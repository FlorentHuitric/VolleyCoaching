import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { EvaluationService } from '../services/EvaluationService';
import { EvaluationType, CompleteEvaluationInput } from '../types/Evaluation.types';

@injectable()
@Resolver(() => EvaluationType)
export class EvaluationResolver {
  constructor(@inject(EvaluationService) private evaluationService: EvaluationService) {}

  @Query(() => EvaluationType, { nullable: true })
  async currentEvaluation(@Arg('playerId', () => ID) playerId: string): Promise<EvaluationType | null> {
    return this.evaluationService.getCurrentEvaluation(playerId) as any;
  }

  @Query(() => [EvaluationType])
  async evaluationHistory(@Arg('playerId', () => ID) playerId: string): Promise<EvaluationType[]> {
    return this.evaluationService.getEvaluationHistory(playerId) as any;
  }

  @Mutation(() => String)
  async createEvaluationSession(
    @Arg('playerId', () => ID) playerId: string,
    @Arg('evaluatorId', () => ID) evaluatorId: string,
    @Arg('batteryName', () => String) batteryName: string
  ): Promise<string> {
    const session = await this.evaluationService.createSession({
      playerId,
      evaluatorId,
      batteryName,
    });
    return session.id;
  }

  @Mutation(() => EvaluationType)
  async completeEvaluationSession(
    @Arg('sessionId', () => ID) sessionId: string,
    @Arg('evaluationData', () => CompleteEvaluationInput) evaluationData: CompleteEvaluationInput
  ): Promise<EvaluationType> {
    const result = await this.evaluationService.completeSession(sessionId, evaluationData as any);
    return result.evaluation as any;
  }
}
