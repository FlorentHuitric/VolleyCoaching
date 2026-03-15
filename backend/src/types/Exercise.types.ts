import { ObjectType, Field, ID, registerEnumType, InputType, Int } from 'type-graphql';
import { ExerciseCategory, ExerciseDifficulty, ExerciseIntensity } from '@prisma/client';

registerEnumType(ExerciseCategory, { name: 'ExerciseCategory' });
registerEnumType(ExerciseDifficulty, { name: 'ExerciseDifficulty' });
registerEnumType(ExerciseIntensity, { name: 'ExerciseIntensity' });

@ObjectType()
export class ExerciseType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  instructions?: string;

  @Field(() => String, { nullable: true })
  videoUrl?: string;

  @Field(() => String, { nullable: true })
  thumbnailUrl?: string;

  @Field(() => String, { nullable: true })
  instagramUrl?: string;

  @Field(() => ExerciseCategory)
  category: ExerciseCategory;

  @Field(() => ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @Field(() => ExerciseIntensity)
  intensity: ExerciseIntensity;

  @Field(() => Int)
  duration: number;

  @Field(() => Int)
  minPlayers: number;

  @Field(() => Int)
  maxPlayers: number;

  @Field(() => [String])
  equipment: string[];

  @Field(() => String, { nullable: true })
  spaceRequired?: string;

  @Field(() => [String])
  targetSkills: string[];

  @Field(() => String, { nullable: true })
  primaryFocus?: string;

  @Field(() => Boolean)
  isBaseExercise: boolean;

  @Field(() => String)
  createdById: string;

  @Field(() => String, { nullable: true })
  orgId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [ExerciseTagRelationType], { nullable: true })
  tags?: ExerciseTagRelationType[];
}

@ObjectType()
export class ExerciseTagRelationType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  exerciseId: string;

  @Field(() => String)
  tagId: string;

  @Field(() => ExerciseTagType, { nullable: true })
  tag?: ExerciseTagType;
}

@InputType()
export class CreateExerciseInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  instructions?: string;

  @Field(() => ExerciseCategory)
  category: ExerciseCategory;

  @Field(() => ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @Field(() => ExerciseIntensity)
  intensity: ExerciseIntensity;

  @Field(() => Int)
  duration: number;

  @Field(() => Int, { nullable: true })
  minPlayers?: number;

  @Field(() => Int, { nullable: true })
  maxPlayers?: number;

  @Field(() => [String], { nullable: true })
  equipment?: string[];

  @Field(() => String, { nullable: true })
  spaceRequired?: string;

  @Field(() => [String], { nullable: true })
  targetSkills?: string[];

  @Field(() => String, { nullable: true })
  primaryFocus?: string;

  @Field(() => String, { nullable: true })
  videoUrl?: string;

  @Field(() => String, { nullable: true })
  thumbnailUrl?: string;

  @Field(() => String, { nullable: true })
  instagramUrl?: string;

  @Field(() => String)
  createdById: string;

  @Field(() => String)
  orgId: string;

  @Field(() => [ID], { nullable: true })
  tagIds?: string[];
}

@ObjectType()
export class ExerciseTagType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => String, { nullable: true })
  orgId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@InputType()
export class UpdateExerciseInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  instructions?: string;

  @Field(() => ExerciseCategory, { nullable: true })
  category?: ExerciseCategory;

  @Field(() => ExerciseDifficulty, { nullable: true })
  difficulty?: ExerciseDifficulty;

  @Field(() => ExerciseIntensity, { nullable: true })
  intensity?: ExerciseIntensity;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => Int, { nullable: true })
  minPlayers?: number;

  @Field(() => Int, { nullable: true })
  maxPlayers?: number;

  @Field(() => [String], { nullable: true })
  equipment?: string[];

  @Field(() => String, { nullable: true })
  spaceRequired?: string;

  @Field(() => [String], { nullable: true })
  targetSkills?: string[];

  @Field(() => String, { nullable: true })
  primaryFocus?: string;

  @Field(() => String, { nullable: true })
  videoUrl?: string;

  @Field(() => String, { nullable: true })
  thumbnailUrl?: string;

  @Field(() => String, { nullable: true })
  instagramUrl?: string;

  @Field(() => [ID], { nullable: true })
  tagIds?: string[];
}

@InputType()
export class CreateTagInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => String, { nullable: true })
  orgId?: string;
}
