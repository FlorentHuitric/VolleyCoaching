/**
 * Training Service - Generates and manages training sessions
 * Following DRY and SOLID principles
 */

import { PlayerProfile } from '@/types/player-evaluation';
import {
  TrainingSession,
  TrainingPhase,
  TrainingPhaseExercise,
  TrainingExercise,
  ExerciseFilters,
  TrainingGeneratorParams,
  ExerciseDifficulty
} from '@/types/exercises';
import { TRAINING_EXERCISES } from '@/data/exercises';
import { identifyWeaknesses } from './recommendationService';

// ============================================
// SINGLE RESPONSIBILITY: Exercise Filtering
// ============================================

/**
 * Filters exercises based on criteria
 */
export const filterExercises = (
  exercises: TrainingExercise[],
  filters: ExerciseFilters
): TrainingExercise[] => {
  return exercises.filter(exercise => {
    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(exercise.category)) return false;
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(exercise.difficulty)) return false;
    }

    // Duration range
    if (filters.minDuration && exercise.duration < filters.minDuration) return false;
    if (filters.maxDuration && exercise.duration > filters.maxDuration) return false;

    // Player count range
    if (filters.minPlayers && exercise.maxPlayers < filters.minPlayers) return false;
    if (filters.maxPlayers && exercise.minPlayers > filters.maxPlayers) return false;

    // Target skills
    if (filters.targetSkills && filters.targetSkills.length > 0) {
      const hasSkill = filters.targetSkills.some(skill => {
        const skillKey = skill as keyof typeof exercise.improvesSkills;
        return exercise.improvesSkills[skillKey] && exercise.improvesSkills[skillKey]! > 0;
      });
      if (!hasSkill) return false;
    }

    // Tags
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => exercise.tags.includes(tag));
      if (!hasTag) return false;
    }

    // Search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesName = exercise.name.toLowerCase().includes(searchLower);
      const matchesDescription = exercise.description.toLowerCase().includes(searchLower);
      const matchesTags = exercise.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesName && !matchesDescription && !matchesTags) return false;
    }

    return true;
  });
};

// ============================================
// SINGLE RESPONSIBILITY: Phase Duration Calculator
// ============================================

/**
 * Calculates recommended phase durations based on total session time
 */
export const calculatePhaseDurations = (
  totalDuration: number,
  params: TrainingGeneratorParams
): Record<string, number> => {
  const { includeWarmup, includeStretching, includeGame, intensity } = params;

  // Base percentages
  let warmupPercent = includeWarmup ? 0.10 : 0; // 10%
  let stretchingPercent = includeStretching ? 0.10 : 0; // 10%
  let gamePercent = includeGame ? 0.25 : 0; // 25%

  // Remaining time for technical + intense
  const remainingPercent = 1 - (warmupPercent + stretchingPercent + gamePercent);

  // Adjust technical/intense based on intensity
  let technicalPercent = 0;
  let intensePercent = 0;

  switch (intensity) {
    case 'light':
      technicalPercent = remainingPercent * 0.7;
      intensePercent = remainingPercent * 0.3;
      break;
    case 'moderate':
      technicalPercent = remainingPercent * 0.5;
      intensePercent = remainingPercent * 0.5;
      break;
    case 'high':
      technicalPercent = remainingPercent * 0.3;
      intensePercent = remainingPercent * 0.7;
      break;
  }

  return {
    warmup: Math.round(totalDuration * warmupPercent),
    stretching: Math.round(totalDuration * stretchingPercent),
    technical: Math.round(totalDuration * technicalPercent),
    intense: Math.round(totalDuration * intensePercent),
    game: Math.round(totalDuration * gamePercent)
  };
};

// ============================================
// SINGLE RESPONSIBILITY: Exercise Selector
// ============================================

/**
 * Selects appropriate exercises for a phase based on criteria
 */
export const selectExercisesForPhase = (
  phaseType: string,
  availableDuration: number,
  playerCount: number,
  difficulty: ExerciseDifficulty,
  targetWeaknesses: string[]
): TrainingExercise[] => {
  const phaseCategories: Record<string, string[]> = {
    warmup: ['physical'],
    stretching: ['physical'],
    technical: ['technical'],
    intense: ['physical', 'technical'],
    game: ['tactical']
  };

  // Filter exercises by phase requirements
  let candidates = TRAINING_EXERCISES.filter(exercise => {
    // Must match category
    if (!phaseCategories[phaseType]?.includes(exercise.category)) return false;

    // Must fit player count
    if (exercise.minPlayers > playerCount || exercise.maxPlayers < playerCount) return false;

    // Difficulty should be appropriate (allow one level up or down)
    const difficultyOrder: ExerciseDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const targetIndex = difficultyOrder.indexOf(difficulty);
    const exerciseIndex = difficultyOrder.indexOf(exercise.difficulty);
    if (Math.abs(targetIndex - exerciseIndex) > 1) return false;

    return true;
  });

  // Score exercises based on weakness match
  const scoredExercises = candidates.map(exercise => {
    let score = 0;

    // Bonus for matching weaknesses
    if (exercise.targetWeaknesses) {
      const matchCount = exercise.targetWeaknesses.filter(w =>
        targetWeaknesses.includes(w)
      ).length;
      score += matchCount * 10;
    }

    // Bonus for high improvement values
    const improvementValues = Object.values(exercise.improvesSkills).filter(v => v) as number[];
    score += improvementValues.reduce((sum, val) => sum + val, 0);

    return { exercise, score };
  });

  // Sort by score
  scoredExercises.sort((a, b) => b.score - a.score);

  // Select exercises that fit in the available time
  const selected: TrainingExercise[] = [];
  let timeUsed = 0;

  for (const { exercise } of scoredExercises) {
    if (timeUsed + exercise.duration <= availableDuration) {
      selected.push(exercise);
      timeUsed += exercise.duration;
    }

    if (timeUsed >= availableDuration * 0.9) break; // Fill at least 90% of time
  }

  return selected;
};

// ============================================
// SINGLE RESPONSIBILITY: Weakness Aggregator
// ============================================

/**
 * Aggregates weaknesses across multiple players
 */
export const aggregatePlayerWeaknesses = (players: PlayerProfile[]): string[] => {
  const weaknessCount: Record<string, number> = {};

  players.forEach(player => {
    const weaknesses = identifyWeaknesses(player);
    weaknesses.forEach(weakness => {
      weaknessCount[weakness] = (weaknessCount[weakness] || 0) + 1;
    });
  });

  // Sort by frequency
  const sortedWeaknesses = Object.entries(weaknessCount)
    .sort(([, a], [, b]) => b - a)
    .map(([weakness]) => weakness);

  return sortedWeaknesses;
};

// ============================================
// MAIN GENERATOR: Training Session Builder
// ============================================

/**
 * Generates a complete training session automatically
 */
export const generateTrainingSession = (
  players: PlayerProfile[],
  params: TrainingGeneratorParams
): TrainingSession => {
  const playerCount = players.length;
  const teamWeaknesses = aggregatePlayerWeaknesses(players);

  // Calculate phase durations
  const phaseDurations = calculatePhaseDurations(params.totalDuration, params);

  // Build phases
  const phases: TrainingPhase[] = [];
  let phaseOrder = 0;

  // Warmup phase
  if (params.includeWarmup && phaseDurations.warmup > 0) {
    const exercises = selectExercisesForPhase(
      'warmup',
      phaseDurations.warmup,
      playerCount,
      'beginner', // Warmup is always beginner level
      []
    );

    phases.push({
      id: `phase-warmup-${Date.now()}`,
      phase: 'warmup',
      name: 'Échauffement',
      duration: phaseDurations.warmup,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration
      }))
    });
  }

  // Stretching phase
  if (params.includeStretching && phaseDurations.stretching > 0) {
    const exercises = selectExercisesForPhase(
      'stretching',
      phaseDurations.stretching,
      playerCount,
      'beginner',
      []
    );

    phases.push({
      id: `phase-stretching-${Date.now()}`,
      phase: 'stretching',
      name: 'Étirements',
      duration: phaseDurations.stretching,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration
      }))
    });
  }

  // Technical phase
  if (phaseDurations.technical > 0) {
    const exercises = selectExercisesForPhase(
      'technical',
      phaseDurations.technical,
      playerCount,
      params.difficulty,
      teamWeaknesses
    );

    phases.push({
      id: `phase-technical-${Date.now()}`,
      phase: 'technical',
      name: 'Travail Technique',
      duration: phaseDurations.technical,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration
      }))
    });
  }

  // Intense phase
  if (phaseDurations.intense > 0) {
    const exercises = selectExercisesForPhase(
      'intense',
      phaseDurations.intense,
      playerCount,
      params.difficulty,
      teamWeaknesses
    );

    phases.push({
      id: `phase-intense-${Date.now()}`,
      phase: 'intense',
      name: 'Exercices Intensifs',
      duration: phaseDurations.intense,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration
      }))
    });
  }

  // Game phase
  if (params.includeGame && phaseDurations.game > 0) {
    const exercises = selectExercisesForPhase(
      'game',
      phaseDurations.game,
      playerCount,
      params.difficulty,
      []
    );

    phases.push({
      id: `phase-game-${Date.now()}`,
      phase: 'game',
      name: 'Jeu',
      duration: phaseDurations.game,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration
      }))
    });
  }

  // Generate objectives based on weaknesses
  const objectives = teamWeaknesses.slice(0, 3).map(weakness => {
    const formattedWeakness = weakness.replace(/_/g, ' ');
    return `Améliorer: ${formattedWeakness}`;
  });

  return {
    id: `training-${Date.now()}`,
    name: `Entraînement ${new Date().toLocaleDateString('fr-FR')}`,
    date: new Date(),
    duration: params.totalDuration,
    playersIds: params.playerIds,
    phases,
    objectives: objectives.length > 0 ? objectives : ['Développement général'],
    notes: `Entraînement généré automatiquement pour ${playerCount} joueur(s)`,
    completed: false,
    createdAt: new Date(),
    difficulty: params.difficulty
  };
};

/**
 * Get exercise by ID
 */
export const getExerciseById = (id: string): TrainingExercise | undefined => {
  return TRAINING_EXERCISES.find(ex => ex.id === id);
};

/**
 * Calculate total actual duration from phases
 */
export const calculateActualDuration = (phases: TrainingPhase[]): number => {
  return phases.reduce((total, phase) => {
    const phaseDuration = phase.exercises.reduce((sum, ex) => sum + ex.duration, 0);
    return total + phaseDuration;
  }, 0);
};

/**
 * Validate training session completeness
 */
export const validateTrainingSession = (session: TrainingSession): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!session.name || session.name.trim() === '') {
    errors.push('Le nom de la session est requis');
  }

  if (session.phases.length === 0) {
    errors.push('Au moins une phase est requise');
  }

  if (session.playersIds.length === 0) {
    errors.push('Au moins un joueur doit être sélectionné');
  }

  const actualDuration = calculateActualDuration(session.phases);
  if (Math.abs(actualDuration - session.duration) > session.duration * 0.2) {
    errors.push('La durée réelle diffère trop de la durée prévue (±20%)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
