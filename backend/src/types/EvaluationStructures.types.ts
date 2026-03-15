import { ObjectType, Field, Float, InputType } from 'type-graphql';

/**
 * 🏐 COMPLETE VOLLEYBALL EVALUATION DATA STRUCTURES
 *
 * These types define the EXACT structure that must be stored in:
 * - Player.currentTechnical (Json)
 * - Player.currentPhysical (Json)
 * - Player.currentMental (Json)
 * - Evaluation.technical (Json)
 * - Evaluation.physical (Json)
 * - Evaluation.mental (Json)
 *
 * ⚠️ CRITICAL: These must match /frontend/types/player-evaluation.ts EXACTLY
 */

// ============================================
// TECHNICAL SKILLS (18 ratings: 6 categories × 3 criteria)
// ============================================

@ObjectType()
export class ServingSkills {
  @Field(() => Float)
  power: number; // Puissance du service (0-10)

  @Field(() => Float)
  accuracy: number; // Précision (0-10)

  @Field(() => Float)
  consistency: number; // Régularité (0-10)
}

@ObjectType()
export class PassingSkills {
  @Field(() => Float)
  control: number; // Contrôle de balle (0-10)

  @Field(() => Float)
  reception: number; // Réception de service (0-10)

  @Field(() => Float)
  positioning: number; // Positionnement (0-10)
}

@ObjectType()
export class SettingSkills {
  @Field(() => Float)
  tempo: number; // Distribution rapide/lente (0-10)

  @Field(() => Float)
  decision: number; // Prise de décision (0-10)

  @Field(() => Float)
  precision: number; // Précision de passe (0-10)
}

@ObjectType()
export class AttackingSkills {
  @Field(() => Float)
  power: number; // Puissance d'attaque (0-10)

  @Field(() => Float)
  variety: number; // Variété d'angles (0-10)

  @Field(() => Float)
  technique: number; // Technique d'approche (0-10)
}

@ObjectType()
export class BlockingSkills {
  @Field(() => Float)
  timing: number; // Timing du contre (0-10)

  @Field(() => Float)
  reading: number; // Lecture de l'adversaire (0-10)

  @Field(() => Float)
  positioning: number; // Positionnement au filet (0-10)
}

@ObjectType()
export class DefenseSkills {
  @Field(() => Float)
  digging: number; // Défense basse (0-10)

  @Field(() => Float)
  positioning: number; // Positionnement défensif (0-10)

  @Field(() => Float)
  anticipation: number; // Anticipation (0-10)
}

@ObjectType()
export class TechnicalSkills {
  @Field(() => ServingSkills)
  serving: ServingSkills;

  @Field(() => PassingSkills)
  passing: PassingSkills;

  @Field(() => SettingSkills)
  setting: SettingSkills;

  @Field(() => AttackingSkills)
  attacking: AttackingSkills;

  @Field(() => BlockingSkills)
  blocking: BlockingSkills;

  @Field(() => DefenseSkills)
  defense: DefenseSkills;
}

// ============================================
// PHYSICAL ATTRIBUTES
// ============================================

@ObjectType()
export class PhysicalMeasurements {
  @Field(() => Float)
  height: number; // Taille en cm

  @Field(() => Float)
  reach: number; // Portée en cm

  @Field(() => Float)
  weight: number; // Poids en kg

  @Field(() => Float)
  wingspan: number; // Envergure en cm
}

@ObjectType()
export class PhysicalPerformance {
  @Field(() => Float)
  verticalJump: number; // Détente verticale en cm

  @Field(() => Float)
  approachJump: number; // Saut d'approche en cm

  @Field(() => Float)
  acceleration: number; // Sprint 15 pieds en secondes

  @Field(() => Float)
  agility: number; // Test en T en secondes

  @Field(() => Float)
  endurance: number; // Navette 300 yards
}

@ObjectType()
export class PhysicalPower {
  @Field(() => Float)
  swingVelocity: number; // Vitesse de frappe en mph

  @Field(() => Float)
  attackHeight: number; // Hauteur d'attaque en cm

  @Field(() => Float)
  blockHeight: number; // Hauteur de contre en cm

  @Field(() => Float)
  servePower: number; // Puissance service en mph
}

@ObjectType()
export class PhysicalFlexibility {
  @Field(() => Float)
  shoulderMobility: number; // Mobilité épaule (1-10)

  @Field(() => Float)
  hipMobility: number; // Mobilité hanche (1-10)

  @Field(() => Float)
  ankleFlexibility: number; // Flexibilité cheville (1-10)

  @Field(() => Float)
  overallFlexibility: number; // Flexibilité globale (1-10)
}

@ObjectType()
export class PhysicalAttributes {
  @Field(() => PhysicalMeasurements)
  measurements: PhysicalMeasurements;

  @Field(() => PhysicalPerformance)
  performance: PhysicalPerformance;

  @Field(() => PhysicalPower)
  power: PhysicalPower;

  @Field(() => PhysicalFlexibility)
  flexibility: PhysicalFlexibility;
}

// ============================================
// MENTAL ATTRIBUTES (25 ratings: 5 categories × 5 criteria)
// ============================================

@ObjectType()
export class GameIntelligence {
  @Field(() => Float)
  courtAwareness: number; // Conscience du terrain (0-10)

  @Field(() => Float)
  situationalUnderstanding: number; // Compréhension situationnelle (0-10)

  @Field(() => Float)
  strategicThinking: number; // Pensée stratégique (0-10)

  @Field(() => Float)
  adaptability: number; // Adaptabilité (0-10)

  @Field(() => Float)
  gameFlow: number; // Compréhension du rythme (0-10)
}

@ObjectType()
export class Communication {
  @Field(() => Float)
  verbal: number; // Communication verbale (0-10)

  @Field(() => Float)
  nonVerbal: number; // Communication non-verbale (0-10)

  @Field(() => Float)
  listening: number; // Écoute (0-10)

  @Field(() => Float)
  teamDirection: number; // Direction d'équipe (0-10)

  @Field(() => Float)
  conflictResolution: number; // Résolution de conflits (0-10)
}

@ObjectType()
export class Leadership {
  @Field(() => Float)
  onCourtPresence: number; // Présence sur le terrain (0-10)

  @Field(() => Float)
  motivating: number; // Motivation des autres (0-10)

  @Field(() => Float)
  responsibility: number; // Sens des responsabilités (0-10)

  @Field(() => Float)
  decisionMaking: number; // Prise de décision (0-10)

  @Field(() => Float)
  roleModeling: number; // Modèle pour les autres (0-10)
}

@ObjectType()
export class MentalToughness {
  @Field(() => Float)
  resilience: number; // Résilience (0-10)

  @Field(() => Float)
  focus: number; // Concentration (0-10)

  @Field(() => Float)
  confidence: number; // Confiance (0-10)

  @Field(() => Float)
  pressurePerformance: number; // Performance sous pression (0-10)

  @Field(() => Float)
  recovery: number; // Récupération après erreur (0-10)
}

@ObjectType()
export class Coachability {
  @Field(() => Float)
  receptiveness: number; // Réceptivité (0-10)

  @Field(() => Float)
  implementation: number; // Mise en application (0-10)

  @Field(() => Float)
  effort: number; // Effort (0-10)

  @Field(() => Float)
  attitude: number; // Attitude (0-10)

  @Field(() => Float)
  growth: number; // Croissance (0-10)
}

@ObjectType()
export class MentalAttributes {
  @Field(() => GameIntelligence)
  gameIntelligence: GameIntelligence;

  @Field(() => Communication)
  communication: Communication;

  @Field(() => Leadership)
  leadership: Leadership;

  @Field(() => MentalToughness)
  mentalToughness: MentalToughness;

  @Field(() => Coachability)
  coachability: Coachability;
}

// ============================================
// INPUT TYPES (for mutations)
// ============================================

@InputType()
export class ServingSkillsInput {
  @Field(() => Float)
  power: number;

  @Field(() => Float)
  accuracy: number;

  @Field(() => Float)
  consistency: number;
}

@InputType()
export class PassingSkillsInput {
  @Field(() => Float)
  control: number;

  @Field(() => Float)
  reception: number;

  @Field(() => Float)
  positioning: number;
}

@InputType()
export class SettingSkillsInput {
  @Field(() => Float)
  tempo: number;

  @Field(() => Float)
  decision: number;

  @Field(() => Float)
  precision: number;
}

@InputType()
export class AttackingSkillsInput {
  @Field(() => Float)
  power: number;

  @Field(() => Float)
  variety: number;

  @Field(() => Float)
  technique: number;
}

@InputType()
export class BlockingSkillsInput {
  @Field(() => Float)
  timing: number;

  @Field(() => Float)
  reading: number;

  @Field(() => Float)
  positioning: number;
}

@InputType()
export class DefenseSkillsInput {
  @Field(() => Float)
  digging: number;

  @Field(() => Float)
  positioning: number;

  @Field(() => Float)
  anticipation: number;
}

@InputType()
export class TechnicalSkillsInput {
  @Field(() => ServingSkillsInput)
  serving: ServingSkillsInput;

  @Field(() => PassingSkillsInput)
  passing: PassingSkillsInput;

  @Field(() => SettingSkillsInput)
  setting: SettingSkillsInput;

  @Field(() => AttackingSkillsInput)
  attacking: AttackingSkillsInput;

  @Field(() => BlockingSkillsInput)
  blocking: BlockingSkillsInput;

  @Field(() => DefenseSkillsInput)
  defense: DefenseSkillsInput;
}

@InputType()
export class PhysicalMeasurementsInput {
  @Field(() => Float)
  height: number;

  @Field(() => Float)
  reach: number;

  @Field(() => Float)
  weight: number;

  @Field(() => Float)
  wingspan: number;
}

@InputType()
export class PhysicalPerformanceInput {
  @Field(() => Float)
  verticalJump: number;

  @Field(() => Float)
  approachJump: number;

  @Field(() => Float)
  acceleration: number;

  @Field(() => Float)
  agility: number;

  @Field(() => Float)
  endurance: number;
}

@InputType()
export class PhysicalPowerInput {
  @Field(() => Float)
  swingVelocity: number;

  @Field(() => Float)
  attackHeight: number;

  @Field(() => Float)
  blockHeight: number;

  @Field(() => Float)
  servePower: number;
}

@InputType()
export class PhysicalFlexibilityInput {
  @Field(() => Float)
  shoulderMobility: number;

  @Field(() => Float)
  hipMobility: number;

  @Field(() => Float)
  ankleFlexibility: number;

  @Field(() => Float)
  overallFlexibility: number;
}

@InputType()
export class PhysicalAttributesInput {
  @Field(() => PhysicalMeasurementsInput)
  measurements: PhysicalMeasurementsInput;

  @Field(() => PhysicalPerformanceInput)
  performance: PhysicalPerformanceInput;

  @Field(() => PhysicalPowerInput)
  power: PhysicalPowerInput;

  @Field(() => PhysicalFlexibilityInput)
  flexibility: PhysicalFlexibilityInput;
}

@InputType()
export class GameIntelligenceInput {
  @Field(() => Float)
  courtAwareness: number;

  @Field(() => Float)
  situationalUnderstanding: number;

  @Field(() => Float)
  strategicThinking: number;

  @Field(() => Float)
  adaptability: number;

  @Field(() => Float)
  gameFlow: number;
}

@InputType()
export class CommunicationInput {
  @Field(() => Float)
  verbal: number;

  @Field(() => Float)
  nonVerbal: number;

  @Field(() => Float)
  listening: number;

  @Field(() => Float)
  teamDirection: number;

  @Field(() => Float)
  conflictResolution: number;
}

@InputType()
export class LeadershipInput {
  @Field(() => Float)
  onCourtPresence: number;

  @Field(() => Float)
  motivating: number;

  @Field(() => Float)
  responsibility: number;

  @Field(() => Float)
  decisionMaking: number;

  @Field(() => Float)
  roleModeling: number;
}

@InputType()
export class MentalToughnessInput {
  @Field(() => Float)
  resilience: number;

  @Field(() => Float)
  focus: number;

  @Field(() => Float)
  confidence: number;

  @Field(() => Float)
  pressurePerformance: number;

  @Field(() => Float)
  recovery: number;
}

@InputType()
export class CoachabilityInput {
  @Field(() => Float)
  receptiveness: number;

  @Field(() => Float)
  implementation: number;

  @Field(() => Float)
  effort: number;

  @Field(() => Float)
  attitude: number;

  @Field(() => Float)
  growth: number;
}

@InputType()
export class MentalAttributesInput {
  @Field(() => GameIntelligenceInput)
  gameIntelligence: GameIntelligenceInput;

  @Field(() => CommunicationInput)
  communication: CommunicationInput;

  @Field(() => LeadershipInput)
  leadership: LeadershipInput;

  @Field(() => MentalToughnessInput)
  mentalToughness: MentalToughnessInput;

  @Field(() => CoachabilityInput)
  coachability: CoachabilityInput;
}
