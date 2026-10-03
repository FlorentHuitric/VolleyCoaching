/**
 * Training Service - Generates and manages training sessions
 * Following DRY and SOLID principles
 */

import { PlayerType as PlayerProfile } from '@/types/player';
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
import { normalizeEquipment, normalizeSkill, stationCount, teamSkillPriorities, skillLabels } from './trainingFocus';

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

  const durations = {
    warmup: Math.round(totalDuration * warmupPercent),
    stretching: Math.round(totalDuration * stretchingPercent),
    technical: Math.round(totalDuration * technicalPercent),
    intense: Math.round(totalDuration * intensePercent),
    game: Math.round(totalDuration * gamePercent)
  };
  durations.technical += totalDuration - Object.values(durations).reduce((sum,n)=>sum+n,0);
  return durations;
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
  targetWeaknesses: string[],
  catalog: TrainingExercise[],
  availableEquipment: string[] = [],
  usedExerciseIds: Set<string> = new Set()
): TrainingExercise[] => {
  const phaseCategories: Record<string, string[]> = {
    warmup: ['physical'],
    stretching: ['physical'],
    technical: ['technical'],
    intense: ['physical', 'technical'],
    game: ['tactical']
  };

  // Filter exercises by phase requirements
  let candidates = catalog.filter(exercise => {
    if (usedExerciseIds.has(exercise.id)) return false;
    // Warm-up and stretching must be explicitly tagged; a sprint is not a substitute.
    if (phaseType==='warmup' && !exercise.tags.includes('échauffement')) return false;
    if (phaseType==='stretching' && !exercise.tags.includes('étirements')) return false;
    // Must match category
    if (!phaseCategories[phaseType]?.includes(exercise.category)) return false;

    // Must fit player count
    if (stationCount(playerCount,exercise.minPlayers,exercise.maxPlayers)===null) return false;

    const equipment=new Set(availableEquipment.map(normalizeEquipment));
    if (exercise.equipment.some(item=>!equipment.has(normalizeEquipment(item)))) return false;

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
    const priority=new Map(targetWeaknesses.map((skill,index)=>[skill,targetWeaknesses.length-index]));
    const matching=[...Object.keys(exercise.improvesSkills),...(exercise.targetWeaknesses||[]),...exercise.tags].map(normalizeSkill);
    const focusScore=Math.max(0,...matching.map(skill=>priority.get(skill)||0));
    score+=focusScore*10;
    if(focusScore&&exercise.media?.some(media=>media.type==='instagram'||media.type==='youtube'))score+=5;

    // Bonus for high improvement values
    const improvementValues = Object.values(exercise.improvesSkills).filter(v => v) as number[];
    score += Math.min(5,improvementValues.reduce((sum, val) => sum + val, 0)/10);

    return { exercise, score };
  });

  // Sort by score
  scoredExercises.sort((a, b) => b.score - a.score);

  // Select exercises that fit in the available time
  const selected: TrainingExercise[] = [];
  let timeUsed = 0;

  for (const { exercise } of scoredExercises) {
    // A 10-minute warm-up should still fit a nominal 9-minute phase.
    if (timeUsed + exercise.duration <= availableDuration + Math.min(5,Math.max(1,Math.ceil(availableDuration*0.2)))) {
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
  params: TrainingGeneratorParams,
  catalog: TrainingExercise[]
): TrainingSession => {
  const playerCount = players.length;
  const prioritySkills = params.focusMode==='manual'
    ? [...new Set((params.focusAreas||[]).map(normalizeSkill))]
    : teamSkillPriorities(players,params.focusMode==='strengths'?'strengths':'weaknesses');
  const selectedExerciseIds=new Set<string>();
  const choose=(phase:string,minutes:number,level:ExerciseDifficulty,targets:string[])=>{
    const selected=selectExercisesForPhase(phase,minutes,playerCount,level,targets,catalog,params.availableEquipment||[],selectedExerciseIds);
    selected.forEach(exercise=>selectedExerciseIds.add(exercise.id));
    return selected;
  };

  // Calculate phase durations
  const phaseDurations = calculatePhaseDurations(params.totalDuration, params);

  // Build phases
  const phases: TrainingPhase[] = [];
  let phaseOrder = 0;

  // Warmup phase
  if (params.includeWarmup && phaseDurations.warmup > 0) {
    const exercises = choose('warmup',phaseDurations.warmup,'beginner',[]);

    phases.push({
      id: `phase-warmup-${Date.now()}`,
      phase: 'warmup',
      name: 'Échauffement',
      duration: phaseDurations.warmup,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration,
        groups: stationCount(playerCount,ex.minPlayers,ex.maxPlayers)||1
      }))
    });
  }

  // Stretching phase
  if (params.includeStretching && phaseDurations.stretching > 0) {
    const exercises = choose('stretching',phaseDurations.stretching,'beginner',[]);

    phases.push({
      id: `phase-stretching-${Date.now()}`,
      phase: 'stretching',
      name: 'Étirements',
      duration: phaseDurations.stretching,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration,
        groups: stationCount(playerCount,ex.minPlayers,ex.maxPlayers)||1
      }))
    });
  }

  // Technical phase
  if (phaseDurations.technical > 0) {
    const exercises = choose('technical',phaseDurations.technical,params.difficulty,prioritySkills);

    phases.push({
      id: `phase-technical-${Date.now()}`,
      phase: 'technical',
      name: 'Travail Technique',
      duration: phaseDurations.technical,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration,
        groups: stationCount(playerCount,ex.minPlayers,ex.maxPlayers)||1
      }))
    });
  }

  // Intense phase
  if (phaseDurations.intense > 0) {
    const exercises = choose('intense',phaseDurations.intense,params.difficulty,prioritySkills);

    phases.push({
      id: `phase-intense-${Date.now()}`,
      phase: 'intense',
      name: 'Exercices Intensifs',
      duration: phaseDurations.intense,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration,
        groups: stationCount(playerCount,ex.minPlayers,ex.maxPlayers)||1
      }))
    });
  }

  // Game phase
  if (params.includeGame && phaseDurations.game > 0) {
    const exercises = choose('game',phaseDurations.game,params.difficulty,prioritySkills);

    phases.push({
      id: `phase-game-${Date.now()}`,
      phase: 'game',
      name: 'Jeu',
      duration: phaseDurations.game,
      order: phaseOrder++,
      exercises: exercises.map(ex => ({
        exerciseId: ex.id,
        duration: ex.duration,
        groups: stationCount(playerCount,ex.minPlayers,ex.maxPlayers)||1
      }))
    });
  }

  // Generate objectives based on weaknesses
  const objectives = prioritySkills.slice(0,3).map(skill=>`${params.focusMode==='strengths'?'Renforcer':'Travailler'} : ${skillLabels[skill]||skill}`);

  const activePhases=phases.filter(phase=>phase.exercises.length>0).map(phase=>({...phase,duration:phase.exercises.reduce((sum,exercise)=>sum+exercise.duration,0)}));
  const actualDuration=activePhases.reduce((sum,phase)=>sum+phase.duration,0);
  return {
    exerciseSnapshots:Object.fromEntries(phases.flatMap(phase=>phase.exercises).map(row=>[row.exerciseId,catalog.find(ex=>ex.id===row.exerciseId)]).filter(([,exercise])=>exercise)) as Record<string,TrainingExercise>,
    id: `training-${Date.now()}`,
    name: `Entraînement ${new Date().toLocaleDateString('fr-FR')}`,
    date: new Date(),
    duration: actualDuration,
    playersIds: params.playerIds,
    phases:activePhases,
    objectives: objectives.length > 0 ? objectives : ['Développement général'],
    notes: `Séance préparée pour ${playerCount} joueurs. Durée demandée : ${params.totalDuration} min ; exercices trouvés : ${actualDuration} min. Répartissez les joueurs en ateliers lorsque plusieurs groupes sont indiqués.`,
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
