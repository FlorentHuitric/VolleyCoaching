import { ObjectType, Field, ID, Int, registerEnumType, InputType } from 'type-graphql';
import { SessionStatus, ExerciseDifficulty, ExerciseIntensity } from '@prisma/client';

// Register Prisma enums for GraphQL
registerEnumType(SessionStatus, { name: 'SessionStatus' });

@ObjectType()
export class TrainingSessionType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  totalDuration: number;

  @Field(() => ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @Field(() => ExerciseIntensity)
  intensity: ExerciseIntensity;

  @Field(() => Boolean)
  includeWarmup: boolean;

  @Field(() => Boolean)
  includeStretching: boolean;

  @Field(() => Boolean)
  includeGame: boolean;

  @Field(() => ID)
  coachId: string;

  @Field(() => ID, { nullable: true })
  teamId?: string;

  @Field(() => Date, { nullable: true })
  scheduledAt?: Date;

  @Field(() => SessionStatus)
  status: SessionStatus;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TrainingSessionExerciseType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  sessionId: string;

  @Field(() => ID)
  exerciseId: string;

  @Field(() => Int)
  order: number;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TrainingAttendanceType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  sessionId: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => Boolean)
  attended: boolean;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

// ============================================
// INPUT TYPES
// ============================================

@InputType()
export class CreateTrainingSessionInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  totalDuration: number;

  @Field(() => ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @Field(() => ExerciseIntensity)
  intensity: ExerciseIntensity;

  @Field(() => Boolean, { nullable: true })
  includeWarmup?: boolean;

  @Field(() => Boolean, { nullable: true })
  includeStretching?: boolean;

  @Field(() => Boolean, { nullable: true })
  includeGame?: boolean;

  @Field(() => ID)
  coachId: string;

  @Field(() => ID, { nullable: true })
  teamId?: string;

  @Field(() => Date, { nullable: true })
  scheduledAt?: Date;
}

@InputType()
export class AddExerciseToSessionInput {
  @Field(() => ID)
  sessionId: string;

  @Field(() => ID)
  exerciseId: string;

  @Field(() => Int)
  order: number;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => String, { nullable: true })
  notes?: string;
}

@InputType()
export class RecordAttendanceInput {
  @Field(() => ID)
  sessionId: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => Boolean)
  attended: boolean;

  @Field(() => String, { nullable: true })
  notes?: string;
}
