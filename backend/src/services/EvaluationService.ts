import { injectable, inject } from 'tsyringe';
import { PrismaClient, Evaluation, EvaluationSession, EvaluationTest, SessionStatus, TestCategory } from '@prisma/client';

@injectable()
export class EvaluationService {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  /**
   * Create evaluation session
   */
  async createSession(data: {
    playerId: string;
    evaluatorId: string;
    batteryName: string;
  }): Promise<EvaluationSession> {
    return this.prisma.evaluationSession.create({
      data,
      include: {
        player: true,
        evaluator: {
          select: { id: true, firstName: true, lastName: true },
        },
        tests: true,
      },
    });
  }

  /**
   * Add test to session
   */
  async addTestToSession(data: {
    sessionId: string;
    testId: string;
    category: TestCategory;
    results: any;
    notes?: string;
  }): Promise<EvaluationTest> {
    return this.prisma.evaluationTest.create({
      data,
    });
  }

  /**
   * Helper: Blend JSON stats (for technical/physical/mental)
   * @param current - Current player stats (may be null for unrated)
   * @param evaluation - New evaluation stats
   * @param weight - Weight of new evaluation (1.0 = 100% for first eval, 0.3 = 30% for updates)
   */
  private blendStats(current: any, evaluation: any, weight: number): any {
    if (!evaluation) return current;
    if (!current) return evaluation; // First evaluation - use 100%

    const blended: any = { ...current };

    // Recursively blend nested objects
    Object.keys(evaluation).forEach(key => {
      if (evaluation[key] && typeof evaluation[key] === 'object' && !Array.isArray(evaluation[key])) {
        blended[key] = this.blendStats(current[key], evaluation[key], weight);
      } else if (typeof evaluation[key] === 'number') {
        const currentValue = typeof current[key] === "number" ? current[key] : evaluation[key];
        // Weighted average: current * (1-weight) + evaluation * weight
        blended[key] = currentValue * (1 - weight) + evaluation[key] * weight;
      } else {
        blended[key] = evaluation[key];
      }
    });

    return blended;
  }

  /**
   * Complete evaluation session and create evaluation
   * ARCHITECTURE: Update Player stats based on evaluation
   * - First evaluation (unrated): 100% of evaluation stats → Player
   * - Subsequent evaluations: Blend 30% of new evaluation with 70% of current stats
   */
  async completeSession(
    sessionId: string,
    evaluationData: {
      overallRating: number;
      potentialRating: number;
      technical: any;
      physical: any;
      mental: any;
      strengths: string[];
      improvementAreas: string[];
      notes?: string;
    }
  ): Promise<{ session: EvaluationSession; evaluation: Evaluation }> {
    if (![evaluationData.overallRating, evaluationData.potentialRating].every(value => Number.isFinite(value) && value >= 0 && value <= 10)) throw new Error('Les notes doivent être comprises entre 0 et 10.');
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT p.id FROM players p JOIN evaluation_sessions s ON s."playerId" = p.id WHERE s.id = ${sessionId} FOR UPDATE OF p`;
    const session = await tx.evaluationSession.findUnique({
      where: { id: sessionId },
      include: { player: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === SessionStatus.COMPLETED) throw new Error('Cette évaluation est déjà terminée.');
    const player = session.player;

    // Determine if this is first evaluation (unrated player)
    const isFirstEvaluation = player.currentRating === null || player.assessmentKind === 'ESTIMATED';
    const blendWeight = isFirstEvaluation ? 1.0 : 0.3; // 100% or 30%

    // Calculate blended stats
    const newTechnical = this.blendStats(player.currentTechnical, evaluationData.technical, blendWeight);
    const newPhysical = this.blendStats(player.currentPhysical, evaluationData.physical, blendWeight);
    const newMental = this.blendStats(player.currentMental, evaluationData.mental, blendWeight);

    // Blend overall ratings
    const newOverallRating = isFirstEvaluation
      ? evaluationData.overallRating
      : player.currentRating! * 0.7 + evaluationData.overallRating * 0.3;

    const newPotentialRating = isFirstEvaluation
      ? evaluationData.potentialRating
      : (player.potentialRating || 0) * 0.7 + evaluationData.potentialRating * 0.3;

    // Mark previous evaluations as not current
    await tx.evaluation.updateMany({
      where: {
        playerId: session.playerId,
        isCurrent: true,
      },
      data: { isCurrent: false },
    });

    // Create new evaluation
    const evaluation = await tx.evaluation.create({
      data: {
        playerId: session.playerId,
        evaluatorId: session.evaluatorId,
        ...evaluationData,
        isCurrent: true,
      },
    });

    // ✨ UPDATE PLAYER STATS (Source of Truth)
    await tx.player.update({
      where: { id: session.playerId },
      data: {
        assessmentKind: 'OBSERVED',
          currentRating: newOverallRating,
        potentialRating: newPotentialRating,
        currentTechnical: newTechnical,
        currentPhysical: newPhysical,
        currentMental: newMental,
        strengths: evaluationData.strengths,
        weaknesses: evaluationData.improvementAreas,
        lastEvaluationDate: new Date(),
        statsUpdatedAt: new Date(),
      },
    });

    // Update session status
    const updatedSession = await tx.evaluationSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        player: true,
        tests: true,
      },
    });

    return { session: updatedSession, evaluation };
    });
  }

  async getEvaluationHistory(playerId: string): Promise<Evaluation[]> {
    return this.prisma.evaluation.findMany({
      where: { playerId },
      orderBy: { evaluationDate: 'desc' },
    });
  }

  async getCurrentEvaluation(playerId: string): Promise<Evaluation | null> {
    return this.prisma.evaluation.findFirst({
      where: { playerId, isCurrent: true },
    });
  }
}
