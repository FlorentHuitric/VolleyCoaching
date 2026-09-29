import { ObjectType, Field, ID, registerEnumType, InputType } from 'type-graphql';
import GraphQLJSON from 'graphql-type-json';
import { Position, PlayerStatus, ContractLevel } from '@prisma/client';
import { EvaluationType } from './Evaluation.types';
import { TechnicalSkills, PhysicalAttributes, MentalAttributes } from './EvaluationStructures.types';

// Register enums for GraphQL
registerEnumType(Position, { name: 'Position' });
registerEnumType(PlayerStatus, { name: 'PlayerStatus' });
registerEnumType(ContractLevel, { name: 'ContractLevel' });

@ObjectType()
export class PlayerType {
  @Field(() => [String])
  rosterTeamIds: string[];
  @Field(() => String)
  assessmentKind: string;
  @Field(() => GraphQLJSON, { nullable: true })
  intakeProfile?: unknown;

  @Field(() => String, { nullable: true })
  experienceLevel?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  medicalNotes?: string;

  @Field(() => String, { nullable: true })
  emergencyContact?: string;

  @Field(() => String, { nullable: true })
  emergencyPhone?: string;

  @Field(() => ID)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  preferredName?: string;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date | null;

  @Field(() => String)
  nationality: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => Number, { nullable: true })
  jerseyNumber?: number | null;

  @Field(() => Position)
  primaryPosition: Position;

  @Field(() => Position, { nullable: true })
  secondaryPosition?: Position;

  @Field(() => String)
  dominantHand: string;

  @Field(() => Number)
  yearsOfExperience: number;

  @Field(() => Number, { nullable: true })
  height?: number;

  @Field(() => Number, { nullable: true })
  weight?: number;

  @Field(() => Number, { nullable: true })
  armReach?: number;

  @Field(() => Number, { nullable: true })
  wingspan?: number;

  @Field(() => PlayerStatus)
  status: PlayerStatus;

  @Field(() => ContractLevel)
  contractLevel: ContractLevel;

  @Field(() => Date)
  joinDate: Date;

  @Field(() => String)
  teamId: string;

  @Field(() => String)
  orgId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // ✨ Current Stats (Single Source of Truth)
  @Field(() => Number, { nullable: true })
  currentRating?: number;

  @Field(() => Number, { nullable: true })
  potentialRating?: number;

  // ✨ COMPLETE EVALUATION DATA - Properly typed and exposed via GraphQL
  @Field(() => TechnicalSkills, { nullable: true })
  currentTechnical?: TechnicalSkills;

  @Field(() => PhysicalAttributes, { nullable: true })
  currentPhysical?: PhysicalAttributes;

  @Field(() => MentalAttributes, { nullable: true })
  currentMental?: MentalAttributes;

  @Field(() => [String], { nullable: true })
  strengths?: string[];

  @Field(() => [String], { nullable: true })
  weaknesses?: string[];

  @Field(() => Date, { nullable: true })
  lastEvaluationDate?: Date;

  @Field(() => Date, { nullable: true })
  statsUpdatedAt?: Date;

  @Field(() => EvaluationType, { nullable: true })
  currentEvaluation?: EvaluationType;

  // Evaluation history for stat trends and details
  @Field(() => [EvaluationType], { nullable: true })
  evaluations?: EvaluationType[];
}

@InputType()
export class CreatePlayerInput {
  @Field(() => String, { nullable: true })
  experienceLevel?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  medicalNotes?: string;

  @Field(() => String, { nullable: true })
  emergencyContact?: string;

  @Field(() => String, { nullable: true })
  emergencyPhone?: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  preferredName?: string;

  @Field(() => Date)
  dateOfBirth: Date;

  @Field(() => String)
  nationality: string;

  @Field(() => Position)
  primaryPosition: Position;

  @Field(() => Number)
  jerseyNumber: number;

  @Field(() => String)
  teamId: string;

  @Field(() => String)
  orgId: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => Position, { nullable: true })
  secondaryPosition?: Position;

  @Field(() => String, { nullable: true })
  dominantHand?: string;

  @Field(() => Number, { nullable: true })
  yearsOfExperience?: number;

  @Field(() => Number, { nullable: true })
  height?: number;

  @Field(() => Number, { nullable: true })
  weight?: number;

  @Field(() => Number, { nullable: true })
  armReach?: number;

  @Field(() => Number, { nullable: true })
  wingspan?: number;

  @Field(() => PlayerStatus, { nullable: true })
  status?: PlayerStatus;

  @Field(() => ContractLevel, { nullable: true })
  contractLevel?: ContractLevel;
}

@InputType()
export class UpdatePlayerInput {
  @Field(() => GraphQLJSON, { nullable: true })
  assessment?: unknown;
  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date | null;

  @Field(() => String, { nullable: true })
  experienceLevel?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  medicalNotes?: string;

  @Field(() => String, { nullable: true })
  emergencyContact?: string;

  @Field(() => String, { nullable: true })
  emergencyPhone?: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  preferredName?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => Number, { nullable: true })
  jerseyNumber?: number;

  @Field(() => Position, { nullable: true })
  primaryPosition?: Position;

  @Field(() => Position, { nullable: true })
  secondaryPosition?: Position;

  @Field(() => Number, { nullable: true })
  height?: number;

  @Field(() => Number, { nullable: true })
  weight?: number;

  @Field(() => PlayerStatus, { nullable: true })
  status?: PlayerStatus;

  @Field(() => ContractLevel, { nullable: true })
  contractLevel?: ContractLevel;
}
