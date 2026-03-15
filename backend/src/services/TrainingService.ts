import { injectable, inject } from 'tsyringe';
import { PrismaClient, TrainingSession, TrainingSessionExercise, TrainingAttendance, SessionStatus, ExerciseDifficulty, ExerciseIntensity } from '@prisma/client';

@injectable()
export class TrainingService {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  /**
   * Create training session
   */
  async createSession(data: {
    name: string;
    description?: string;
    totalDuration: number;
    difficulty: ExerciseDifficulty;
    intensity: ExerciseIntensity;
    includeWarmup?: boolean;
    includeStretching?: boolean;
    includeGame?: boolean;
    coachId: string;
    teamId?: string;
    scheduledAt?: Date;
  }): Promise<TrainingSession> {
    return this.prisma.trainingSession.create({
      data: {
        ...data,
        includeWarmup: data.includeWarmup ?? true,
        includeStretching: data.includeStretching ?? true,
        includeGame: data.includeGame ?? true,
      },
      include: {
        coach: {
          select: { id: true, firstName: true, lastName: true },
        },
        team: true,
      },
    });
  }

  /**
   * Add exercise to session
   */
  async addExerciseToSession(data: {
    sessionId: string;
    exerciseId: string;
    order: number;
    duration?: number;
    notes?: string;
  }): Promise<TrainingSessionExercise> {
    return this.prisma.trainingSessionExercise.create({
      data,
      include: {
        exercise: true,
      },
    });
  }

  /**
   * Get session with exercises
   */
  async getSessionById(id: string): Promise<TrainingSession | null> {
    return this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        coach: {
          select: { id: true, firstName: true, lastName: true },
        },
        team: true,
        exercises: {
          include: {
            exercise: {
              include: {
                tags: {
                  include: { tag: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        attendances: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  /**
   * Get sessions by team
   */
  async getSessionsByTeam(teamId: string): Promise<TrainingSession[]> {
    return this.prisma.trainingSession.findMany({
      where: { teamId },
      include: {
        _count: {
          select: { exercises: true, attendances: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Record attendance
   */
  async recordAttendance(data: {
    sessionId: string;
    playerId: string;
    attended: boolean;
    notes?: string;
  }): Promise<TrainingAttendance> {
    return this.prisma.trainingAttendance.upsert({
      where: {
        sessionId_playerId: {
          sessionId: data.sessionId,
          playerId: data.playerId,
        },
      },
      update: {
        attended: data.attended,
        notes: data.notes,
      },
      create: data,
    });
  }

  /**
   * Complete training session
   */
  async completeSession(id: string): Promise<TrainingSession> {
    return this.prisma.trainingSession.update({
      where: { id },
      data: {
        status: SessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }
}
