import { SkillRating } from './player';
import { VolleyballPosition } from '@/hooks/useCourtStore';

/**
 * Types d'exercices pour évaluation automatisée
 */
export type ExerciseType =
  | 'service_precision'
  | 'service_puissance'
  | 'passe_reception'
  | 'passe_precision'
  | 'attaque_puissance'
  | 'attaque_precision'
  | 'contre_timing'
  | 'defense_dig'
  | 'set_precision'
  | 'endurance'
  | 'saut_vertical'
  | 'agilite';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ExerciseCategory = 'physical' | 'technical' | 'tactical' | 'mental' | 'evaluation';

/**
 * Définition d'un exercice d'évaluation
 */
export interface Exercise {
  id: string;
  nom: string;
  description: string;
  type: ExerciseType;
  positionsApplicables: VolleyballPosition[];
  materielRequis: string[];
  dureeMinutes: number;
  mesures: ExerciseMeasurement[];
  instructions: string[];
  baremeNotation: {
    excellent: { min: number; max: number; note: SkillRating };
    bon: { min: number; max: number; note: SkillRating };
    moyen: { min: number; max: number; note: SkillRating };
    faible: { min: number; max: number; note: SkillRating };
  };
}

/**
 * Type de mesure pour un exercice
 */
export interface ExerciseMeasurement {
  nom: string;
  unite: string;
  typeValeur: 'nombre' | 'temps' | 'pourcentage' | 'boolean';
  valeurMin?: number;
  valeurMax?: number;
  description: string;
}

/**
 * Résultat d'un exercice
 */
export interface ExerciseResult {
  exerciceId: string;
  playerId: string;
  dateExecution: Date;
  resultats: Record<string, number | boolean>;
  noteCalculee: SkillRating;
  commentaires?: string;
  conditions: {
    temperature?: number;
    humidite?: number;
    surface: 'parquet' | 'synthetique' | 'exterieur';
    ballon: 'officiel' | 'entrainement';
  };
}

/**
 * Session d'évaluation complète
 */
export interface EvaluationSession {
  id: string;
  playerId: string;
  evaluateurId: string;
  dateDebut: Date;
  dateFin?: Date;
  exercicesRealises: ExerciseResult[];
  noteGlobale?: SkillRating;
  commentairesFinaux?: string;
  recommandations: string[];
  prochainObjectifs: string[];
}

/**
 * Template d'évaluation par position
 */
export interface PositionEvaluationTemplate {
  position: VolleyballPosition;
  nom: string;
  exercicesObligatoires: string[]; // IDs des exercices
  exercicesOptionels: string[];
  dureeEstimeeMinutes: number;
  coefficientsCompetences: Record<ExerciseType, number>; // Poids pour calcul note globale
}

// ============================================
// TRAINING EXERCISES & RECOMMENDATIONS
// ============================================

/**
 * Training exercise (non-evaluation) for skill improvement
 */
export interface TrainingExercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  duration: number; // in minutes
  minPlayers: number;
  maxPlayers: number;

  // Skills improved by this exercise
  improvesSkills: {
    serving?: number; // 1-10 how much it improves
    passing?: number;
    setting?: number;
    attacking?: number;
    blocking?: number;
    defense?: number;
    verticalJump?: number;
    speed?: number;
    agility?: number;
    endurance?: number;
    coordination?: number;
    gameReading?: number;
  };

  // Target weaknesses (keys from player evaluation)
  targetWeaknesses?: string[];

  // Equipment needed
  equipment: string[];

  // Media (videos, images)
  media?: {
    type: 'youtube' | 'instagram' | 'vimeo' | 'image';
    url: string;
    thumbnail?: string;
  }[];

  // Instructions
  setup: string;
  execution: string;
  coachingPoints: string[];
  variations?: string[];

  // Success criteria
  successContract?: {
    description: string;
    target: string;
  };

  // Failure penalty
  failurePenalty?: {
    description: string;
    examples: string[];
  };

  tags: string[];
}

/**
 * Exercise recommendation for a player
 */
export interface ExerciseRecommendation {
  exercise: TrainingExercise;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  targetedWeaknesses: string[];
  expectedImprovement: string;
}

/**
 * Training session plan
 */
export interface TrainingSession {
  exerciseSnapshots?: Record<string, TrainingExercise>;
  id: string;
  name: string;
  date: Date;
  duration: number; // total in minutes
  playersIds: string[];

  phases: TrainingPhase[];

  objectives: string[];
  notes?: string;
  completed: boolean;
  createdBy?: string;
  createdAt: Date;
  difficulty: ExerciseDifficulty;
}

export interface TrainingPhase {
  id: string;
  phase: 'warmup' | 'stretching' | 'technical' | 'intense' | 'game';
  name: string;
  duration: number; // total duration of phase in minutes
  exercises: TrainingPhaseExercise[];
  order: number;
}

export interface TrainingPhaseExercise {
  exerciseId: string;
  duration: number;
  groups?: number;
  notes?: string;
  sets?: number;
  reps?: number;
  restTime?: number;
}

/**
 * Filters for exercise selection
 */
export interface ExerciseFilters {
  category?: ExerciseCategory[];
  difficulty?: ExerciseDifficulty[];
  minDuration?: number;
  maxDuration?: number;
  minPlayers?: number;
  maxPlayers?: number;
  targetSkills?: string[];
  tags?: string[];
  searchTerm?: string;
}

/**
 * Training generation parameters
 */
export interface TrainingGeneratorParams {
  playerIds: string[];
  totalDuration: number; // in minutes (default 90)
  difficulty: ExerciseDifficulty;
  focusAreas?: string[]; // specific skills to focus on
  focusMode?: 'weaknesses' | 'strengths' | 'manual';
  availableEquipment?: string[];
  includeWarmup: boolean;
  includeStretching: boolean;
  includeGame: boolean;
  intensity: 'light' | 'moderate' | 'high';
}

/**
 * Training template for quick session creation
 */
export interface TrainingTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: ExerciseDifficulty;
  phases: Omit<TrainingPhase, 'id'>[];
  targetPositions?: string[];
  tags: string[];
}
