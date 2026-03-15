/**
 * UNIFIED TYPE DEFINITIONS
 * Source of Truth: PostgreSQL database via GraphQL API (backend/schema.gql)
 * 
 * This file centralizes all type definitions to ensure 100% coherence across the app.
 * DO NOT create duplicate types elsewhere - import from here instead.
 * 
 * Principles:
 * - Single Source of Truth (DRY)
 * - Types mirror GraphQL schema exactly
 * - No redundant or legacy properties
 */

// ============================================
// ENUMS (from GraphQL)
// ============================================

export enum Position {
  SETTER = 'SETTER',
  OUTSIDE_HITTER = 'OUTSIDE_HITTER',
  OPPOSITE = 'OPPOSITE',
  MIDDLE_BLOCKER = 'MIDDLE_BLOCKER',
  LIBERO = 'LIBERO',
  DEFENSIVE_SPECIALIST = 'DEFENSIVE_SPECIALIST'
}

export enum PlayerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  INJURED = 'INJURED',
  SUSPENDED = 'SUSPENDED'
}

export enum ContractLevel {
  ELITE = 'ELITE',
  SENIOR = 'SENIOR',
  RESERVE = 'RESERVE',
  YOUTH = 'YOUTH',
  ACADEMY = 'ACADEMY'
}

// ============================================
// TECHNICAL SKILLS (from GraphQL)
// ============================================

export interface ServingSkills {
  power: number;      // 0-10
  accuracy: number;   // 0-10
  consistency: number; // 0-10
}

export interface PassingSkills {
  control: number;     // 0-10
  reception: number;   // 0-10
  positioning: number; // 0-10
}

export interface SettingSkills {
  tempo: number;      // 0-10
  decision: number;   // 0-10
  precision: number;  // 0-10
}

export interface AttackingSkills {
  power: number;      // 0-10
  variety: number;    // 0-10
  technique: number;  // 0-10
}

export interface BlockingSkills {
  timing: number;      // 0-10
  reading: number;     // 0-10
  positioning: number; // 0-10
}

export interface DefenseSkills {
  digging: number;      // 0-10
  positioning: number;  // 0-10
  anticipation: number; // 0-10
}

export interface TechnicalSkills {
  serving: ServingSkills;
  passing: PassingSkills;
  setting: SettingSkills;
  attacking: AttackingSkills;
  blocking: BlockingSkills;
  defense: DefenseSkills;
}

// ============================================
// PHYSICAL ATTRIBUTES (from GraphQL)
// ============================================

export interface PhysicalMeasurements {
  height: number;    // cm
  reach: number;     // cm
  weight: number;    // kg
  wingspan: number;  // cm
}

export interface PhysicalPerformance {
  verticalJump: number;   // cm
  approachJump: number;   // cm
  acceleration: number;   // seconds (10m sprint)
  agility: number;        // seconds (T-test)
  endurance: number;      // Yo-Yo level
}

export interface PhysicalPower {
  swingVelocity: number; // km/h
  attackHeight: number;  // cm
  blockHeight: number;   // cm
  servePower: number;    // km/h
}

export interface PhysicalFlexibility {
  shoulderMobility: number; // 0-10
  hipFlexibility: number;   // 0-10
  ankleMobility: number;    // 0-10
}

export interface PhysicalAttributes {
  measurements: PhysicalMeasurements;
  performance: PhysicalPerformance;
  power: PhysicalPower;
  flexibility: PhysicalFlexibility;
}

// ============================================
// MENTAL ATTRIBUTES (from GraphQL)
// ============================================

export interface GameIntelligence {
  situationalUnderstanding: number; // 0-10
  courtAwareness: number;           // 0-10
  adaptability: number;             // 0-10
  gameFlow: number;                 // 0-10
  strategicThinking: number;        // 0-10
}

export interface Communication {
  clarity: number;         // 0-10
  listening: number;       // 0-10
  nonVerbal: number;       // 0-10
  teamCohesion: number;    // 0-10
  conflictResolution: number; // 0-10
}

export interface Leadership {
  motivating: number;       // 0-10
  decisionMaking: number;   // 0-10
  responsibility: number;   // 0-10
  roleModeling: number;     // 0-10
  onCourtPresence: number;  // 0-10
}

export interface MentalToughness {
  pressurePerformance: number; // 0-10
  confidence: number;          // 0-10
  resilience: number;          // 0-10
  focus: number;               // 0-10
  recovery: number;            // 0-10
}

export interface Coachability {
  receptiveness: number;    // 0-10
  adaptability: number;     // 0-10
  workEthic: number;        // 0-10
  selfAwareness: number;    // 0-10
  growthMindset: number;    // 0-10
}

export interface MentalAttributes {
  gameIntelligence: GameIntelligence;
  communication: Communication;
  leadership: Leadership;
  mentalToughness: MentalToughness;
  coachability: Coachability;
}

// ============================================
// EVALUATION (from GraphQL)
// ============================================

export interface EvaluationType {
  id: string;
  playerId: string;
  evaluatorId: string;
  date: Date;
  overallRating: number;
  potentialRating: number;
  technical: TechnicalSkills;
  physical: PhysicalAttributes;
  mental: MentalAttributes;
  strengths: string[];
  improvementAreas: string[];
  notes: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PLAYER (from GraphQL - SINGLE SOURCE OF TRUTH)
// ============================================

export interface PlayerType {
  // Identity
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: Date;
  nationality: string;
  avatar: string | null;
  
  // Team & Status
  orgId: string;
  teamId: string;
  primaryPosition: Position;
  secondaryPosition: Position | null;
  jerseyNumber: number;
  status: PlayerStatus;
  contractLevel: ContractLevel;
  
  // Contact
  email: string | null;
  phone: string | null;
  
  // Physical Measurements (direct properties)
  height: number | null;
  weight: number | null;
  wingspan: number | null;
  armReach: number | null;
  dominantHand: string;
  
  // Experience
  yearsOfExperience: number;
  joinDate: Date;
  
  // Current Stats (JSON fields in database)
  currentRating: number | null;
  potentialRating: number | null;
  currentTechnical: TechnicalSkills | null;
  currentPhysical: PhysicalAttributes | null;
  currentMental: MentalAttributes | null;
  
  // Evaluation Summary
  currentEvaluation: EvaluationType | null;
  evaluations: EvaluationType[];
  lastEvaluationDate: Date | null;
  strengths: string[];
  weaknesses: string[];
  
  // Metadata
  statsUpdatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// HELPER TYPES FOR UI
// ============================================

/**
 * Simplified player for lists/cards (matches SimplePlayer in GraphQL)
 */
export interface SimplePlayer {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  primaryPosition: string;
  currentRating: number | null;
}

/**
 * Player profile for detail views
 * This is just an alias to PlayerType for clarity
 */
export type PlayerProfile = PlayerType;

/**
 * Type guard to check if technical skills are defined
 */
export function hasTechnicalSkills(player: PlayerType): player is PlayerType & { currentTechnical: TechnicalSkills } {
  return player.currentTechnical !== null;
}

/**
 * Type guard to check if physical attributes are defined
 */
export function hasPhysicalAttributes(player: PlayerType): player is PlayerType & { currentPhysical: PhysicalAttributes } {
  return player.currentPhysical !== null;
}

/**
 * Type guard to check if mental attributes are defined
 */
export function hasMentalAttributes(player: PlayerType): player is PlayerType & { currentMental: MentalAttributes } {
  return player.currentMental !== null;
}

// ============================================
// SKILL RATING (legacy compatibility)
// ============================================

/**
 * @deprecated Use number (0-10) directly instead
 * Keep only for backward compatibility during migration
 */
export type SkillRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get player display name
 */
export function getPlayerDisplayName(player: PlayerType | SimplePlayer): string {
  if ('preferredName' in player && player.preferredName) {
    return player.preferredName;
  }
  return `${player.firstName} ${player.lastName}`;
}

/**
 * Get position label in French
 */
export function getPositionLabel(position: Position): string {
  const labels: Record<Position, string> = {
    [Position.SETTER]: 'Passeur',
    [Position.OUTSIDE_HITTER]: 'Attaquant',
    [Position.OPPOSITE]: 'Pointu',
    [Position.MIDDLE_BLOCKER]: 'Central',
    [Position.LIBERO]: 'Libéro',
    [Position.DEFENSIVE_SPECIALIST]: 'Spécialiste Défensif'
  };
  return labels[position] || position;
}

/**
 * Get rating color class
 */
export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-600 dark:text-green-400';
  if (rating >= 6) return 'text-blue-600 dark:text-blue-400';
  if (rating >= 4) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get rating badge color
 */
export function getRatingBadgeColor(rating: number): string {
  if (rating >= 8) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (rating >= 6) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  if (rating >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
}
