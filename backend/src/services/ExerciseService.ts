import { injectable, inject } from 'tsyringe';
import { PrismaClient, Exercise, ExerciseTag, ExerciseCategory, ExerciseDifficulty, ExerciseIntensity } from '@prisma/client';

/**
 * Exercise Service
 * Handles exercise library management with user customization
 *
 * Features:
 * - 30 base exercises (isBaseExercise = true, orgId = null)
 * - Organization-specific exercises
 * - Tag-based categorization
 * - User can add/delete/modify their own exercises
 */
@injectable()
export class ExerciseService {
  constructor(
    @inject(PrismaClient) private prisma: PrismaClient
  ) {}

  /**
   * Create a new exercise
   */
  async createExercise(data: {
    name: string;
    description: string;
    instructions?: string;
    category: ExerciseCategory;
    difficulty: ExerciseDifficulty;
    intensity: ExerciseIntensity;
    duration: number;
    minPlayers?: number;
    maxPlayers?: number;
    equipment?: string[];
    spaceRequired?: string;
    targetSkills?: string[];
    primaryFocus?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    instagramUrl?: string;
    isBaseExercise?: boolean;
    createdById: string;
    orgId?: string;
    tagIds?: string[];
  }): Promise<Exercise> {
    const { tagIds, ...exerciseData } = data;

    const exercise = await this.prisma.exercise.create({
      data: {
        ...exerciseData,
        equipment: exerciseData.equipment || [],
        targetSkills: exerciseData.targetSkills || [],
        minPlayers: exerciseData.minPlayers || 1,
        maxPlayers: exerciseData.maxPlayers || 12,
        isBaseExercise: exerciseData.isBaseExercise || false,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await this.addTagsToExercise(exercise.id, tagIds);
    }

    return exercise;
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(id: string): Promise<Exercise | null> {
    return this.prisma.exercise.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get all exercises (base + organization-specific)
   */
  async getExercises(orgId: string): Promise<Exercise[]> {
    return this.prisma.exercise.findMany({
      where: {
        OR: [
          { isBaseExercise: true }, // Include all base exercises
          { orgId }, // Include organization's custom exercises
        ],
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { isBaseExercise: 'desc' }, // Base exercises first
        { name: 'asc' },
      ],
    });
  }

  /**
   * Get exercises by category
   */
  async getExercisesByCategory(
    category: ExerciseCategory,
    orgId: string
  ): Promise<Exercise[]> {
    return this.prisma.exercise.findMany({
      where: {
        category,
        OR: [
          { isBaseExercise: true },
          { orgId },
        ],
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Get exercises by difficulty
   */
  async getExercisesByDifficulty(
    difficulty: ExerciseDifficulty,
    orgId: string
  ): Promise<Exercise[]> {
    return this.prisma.exercise.findMany({
      where: {
        difficulty,
        OR: [
          { isBaseExercise: true },
          { orgId },
        ],
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Get exercises by tags
   */
  async getExercisesByTags(tagIds: string[], orgId: string): Promise<Exercise[]> {
    return this.prisma.exercise.findMany({
      where: {
        OR: [
          { isBaseExercise: true },
          { orgId },
        ],
        tags: {
          some: {
            tagId: {
              in: tagIds,
            },
          },
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Search exercises
   */
  async searchExercises(query: string, orgId: string): Promise<Exercise[]> {
    return this.prisma.exercise.findMany({
      where: {
        OR: [
          { isBaseExercise: true },
          { orgId },
        ],
        AND: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { targetSkills: { has: query } },
          ],
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      take: 50,
    });
  }

  /**
   * Update exercise
   * Note: Base exercises cannot be modified directly
   */
  async updateExercise(
    id: string,
    data: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'isBaseExercise'>>
  ): Promise<Exercise> {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });

    if (!exercise) {
      throw new Error('Exercise not found');
    }

    if (exercise.isBaseExercise) {
      throw new Error('Base exercises cannot be modified. Create a custom copy instead.');
    }

    return this.prisma.exercise.update({
      where: { id },
      data,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Delete exercise (only custom exercises)
   */
  async deleteExercise(id: string): Promise<Exercise> {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });

    if (!exercise) {
      throw new Error('Exercise not found');
    }

    if (exercise.isBaseExercise) {
      throw new Error('Base exercises cannot be deleted');
    }

    return this.prisma.exercise.delete({
      where: { id },
    });
  }

  /**
   * Clone a base exercise for customization
   */
  async cloneExercise(id: string, userId: string, orgId: string): Promise<Exercise> {
    const original = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!original) {
      throw new Error('Exercise not found');
    }

    const { id: _, createdAt, updatedAt, isBaseExercise, tags, ...exerciseData } = original;

    const cloned = await this.prisma.exercise.create({
      data: {
        ...exerciseData,
        createdById: userId,
        orgId,
        isBaseExercise: false,
        name: `${original.name} (Custom)`,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Copy tags
    if (tags && tags.length > 0) {
      const tagIds = tags.map(t => t.tag.id);
      await this.addTagsToExercise(cloned.id, tagIds);
    }

    return cloned;
  }

  // ============================================
  // TAG MANAGEMENT
  // ============================================

  /**
   * Create a new tag
   */
  async createTag(data: {
    name: string;
    color?: string;
    orgId?: string;
  }): Promise<ExerciseTag> {
    return this.prisma.exerciseTag.create({
      data,
    });
  }

  /**
   * Get all tags (system + organization-specific)
   */
  async getTags(orgId: string): Promise<ExerciseTag[]> {
    return this.prisma.exerciseTag.findMany({
      where: {
        OR: [
          { orgId: null }, // System tags
          { orgId }, // Organization tags
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Add tags to exercise
   */
  async addTagsToExercise(exerciseId: string, tagIds: string[]): Promise<void> {
    await this.prisma.exerciseTagRelation.createMany({
      data: tagIds.map(tagId => ({
        exerciseId,
        tagId,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Remove tags from exercise
   */
  async removeTagsFromExercise(exerciseId: string, tagIds: string[]): Promise<void> {
    await this.prisma.exerciseTagRelation.deleteMany({
      where: {
        exerciseId,
        tagId: {
          in: tagIds,
        },
      },
    });
  }

  /**
   * Update exercise tags (replace all)
   */
  async updateExerciseTags(exerciseId: string, tagIds: string[]): Promise<void> {
    // Remove all existing tags
    await this.prisma.exerciseTagRelation.deleteMany({
      where: { exerciseId },
    });

    // Add new tags
    if (tagIds.length > 0) {
      await this.addTagsToExercise(exerciseId, tagIds);
    }
  }
}
