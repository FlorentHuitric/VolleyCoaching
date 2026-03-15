import { ObjectType, Field, ID, Float, InputType } from 'type-graphql';
import {
  TechnicalSkills,
  PhysicalAttributes,
  MentalAttributes,
  TechnicalSkillsInput,
  PhysicalAttributesInput,
  MentalAttributesInput
} from './EvaluationStructures.types';

@ObjectType()
export class EvaluationType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => ID)
  evaluatorId: string;

  @Field(() => Date)
  evaluationDate: Date;

  @Field(() => Float)
  overallRating: number;

  @Field(() => Float)
  potentialRating: number;

  // ✨ COMPLETE EVALUATION DATA - Properly typed and exposed via GraphQL
  @Field(() => TechnicalSkills)
  technical: TechnicalSkills;

  @Field(() => PhysicalAttributes)
  physical: PhysicalAttributes;

  @Field(() => MentalAttributes)
  mental: MentalAttributes;

  @Field(() => [String])
  strengths: string[];

  @Field(() => [String])
  improvementAreas: string[];

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => Boolean)
  isCurrent: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

// ============================================
// INPUT TYPES FOR CREATING EVALUATIONS
// ============================================

@InputType()
export class CompleteEvaluationInput {
  @Field(() => Float)
  overallRating: number;

  @Field(() => Float)
  potentialRating: number;

  @Field(() => TechnicalSkillsInput)
  technical: TechnicalSkillsInput;

  @Field(() => PhysicalAttributesInput)
  physical: PhysicalAttributesInput;

  @Field(() => MentalAttributesInput)
  mental: MentalAttributesInput;

  @Field(() => [String])
  strengths: string[];

  @Field(() => [String])
  improvementAreas: string[];

  @Field(() => String, { nullable: true })
  notes?: string;
}
