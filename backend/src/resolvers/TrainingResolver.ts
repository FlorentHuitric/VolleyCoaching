import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { TrainingService } from '../services/TrainingService';
import {
  TrainingSessionType,
  TrainingSessionExerciseType,
  TrainingAttendanceType,
  CreateTrainingSessionInput,
  AddExerciseToSessionInput,
  RecordAttendanceInput,
} from '../types/Training.types';

@injectable()
@Resolver(() => TrainingSessionType)
export class TrainingResolver {
  constructor(@inject(TrainingService) private trainingService: TrainingService) {}

  @Query(() => TrainingSessionType, { nullable: true })
  async trainingSession(@Arg('id', () => ID) id: string): Promise<TrainingSessionType | null> {
    return this.trainingService.getSessionById(id) as any;
  }

  @Query(() => [TrainingSessionType])
  async trainingSessionsByTeam(@Arg('teamId', () => ID) teamId: string): Promise<TrainingSessionType[]> {
    return this.trainingService.getSessionsByTeam(teamId) as any;
  }

  @Mutation(() => TrainingSessionType)
  async createTrainingSession(
    @Arg('input', () => CreateTrainingSessionInput) input: CreateTrainingSessionInput
  ): Promise<TrainingSessionType> {
    return this.trainingService.createSession(input as any) as any;
  }

  @Mutation(() => TrainingSessionExerciseType)
  async addExerciseToSession(
    @Arg('input', () => AddExerciseToSessionInput) input: AddExerciseToSessionInput
  ): Promise<TrainingSessionExerciseType> {
    return this.trainingService.addExerciseToSession(input) as any;
  }

  @Mutation(() => TrainingAttendanceType)
  async recordAttendance(
    @Arg('input', () => RecordAttendanceInput) input: RecordAttendanceInput
  ): Promise<TrainingAttendanceType> {
    return this.trainingService.recordAttendance(input) as any;
  }

  @Mutation(() => TrainingSessionType)
  async completeTrainingSession(@Arg('id', () => ID) id: string): Promise<TrainingSessionType> {
    return this.trainingService.completeSession(id) as any;
  }
}
