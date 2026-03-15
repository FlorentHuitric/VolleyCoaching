import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { ExerciseService } from '../services/ExerciseService';
import { ExerciseType, ExerciseTagType, CreateExerciseInput, UpdateExerciseInput, CreateTagInput } from '../types/Exercise.types';
import { ExerciseCategory, ExerciseDifficulty } from '@prisma/client';

@injectable()
@Resolver(() => ExerciseType)
export class ExerciseResolver {
  constructor(
    @inject(ExerciseService) private exerciseService: ExerciseService
  ) {}

  @Query(() => ExerciseType, { nullable: true })
  async exercise(@Arg('id', () => ID) id: string): Promise<ExerciseType | null> {
    return this.exerciseService.getExerciseById(id) as any;
  }

  @Query(() => [ExerciseType])
  async exercises(@Arg('orgId', () => ID) orgId: string): Promise<ExerciseType[]> {
    return this.exerciseService.getExercises(orgId) as any;
  }

  @Query(() => [ExerciseType])
  async exercisesByCategory(
    @Arg('category', () => ExerciseCategory) category: ExerciseCategory,
    @Arg('orgId', () => ID) orgId: string
  ): Promise<ExerciseType[]> {
    return this.exerciseService.getExercisesByCategory(category, orgId) as any;
  }

  @Query(() => [ExerciseType])
  async exercisesByDifficulty(
    @Arg('difficulty', () => ExerciseDifficulty) difficulty: ExerciseDifficulty,
    @Arg('orgId', () => ID) orgId: string
  ): Promise<ExerciseType[]> {
    return this.exerciseService.getExercisesByDifficulty(difficulty, orgId) as any;
  }

  @Query(() => [ExerciseType])
  async exercisesByTags(
    @Arg('tagIds', () => [ID]) tagIds: string[],
    @Arg('orgId', () => ID) orgId: string
  ): Promise<ExerciseType[]> {
    return this.exerciseService.getExercisesByTags(tagIds, orgId) as any;
  }

  @Query(() => [ExerciseType])
  async searchExercises(
    @Arg('query', () => String) query: string,
    @Arg('orgId', () => ID) orgId: string
  ): Promise<ExerciseType[]> {
    return this.exerciseService.searchExercises(query, orgId) as any;
  }

  @Mutation(() => ExerciseType)
  async createExercise(@Arg('input', () => CreateExerciseInput) input: CreateExerciseInput): Promise<ExerciseType> {
    return this.exerciseService.createExercise(input as any) as any;
  }

  @Mutation(() => ExerciseType)
  async cloneExercise(
    @Arg('id', () => ID) id: string,
    @Arg('userId', () => ID) userId: string,
    @Arg('orgId', () => ID) orgId: string
  ): Promise<ExerciseType> {
    return this.exerciseService.cloneExercise(id, userId, orgId) as any;
  }

  @Mutation(() => ExerciseType)
  async updateExercise(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateExerciseInput) input: UpdateExerciseInput
  ): Promise<ExerciseType> {
    const { tagIds, ...data } = input;
    const exercise = await this.exerciseService.updateExercise(id, data as any);
    if (tagIds) {
      await this.exerciseService.updateExerciseTags(id, tagIds);
    }
    return exercise as any;
  }

  @Mutation(() => ExerciseType)
  async deleteExercise(@Arg('id', () => ID) id: string): Promise<ExerciseType> {
    return this.exerciseService.deleteExercise(id) as any;
  }

  @Query(() => [ExerciseTagType])
  async exerciseTags(@Arg('orgId', () => ID) orgId: string): Promise<ExerciseTagType[]> {
    return this.exerciseService.getTags(orgId) as any;
  }

  @Mutation(() => ExerciseTagType)
  async createExerciseTag(@Arg('input', () => CreateTagInput) input: CreateTagInput): Promise<ExerciseTagType> {
    return this.exerciseService.createTag(input) as any;
  }
}
