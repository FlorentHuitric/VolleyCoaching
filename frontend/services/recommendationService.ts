/**
 * Recommendation Service - Analyzes player evaluations and recommends targeted exercises
 */

import { PlayerType } from '@/types/player';
import { TrainingExercise, ExerciseRecommendation } from '@/types/exercises';
import { TRAINING_EXERCISES } from '@/data/exercises';

/**
 * Analyze player evaluation and identify weaknesses
 */
export const identifyWeaknesses = (player: PlayerType): string[] => {
  const weaknesses: string[] = [];
  
  // If player has no evaluation, mark as unrated
  if (!player.currentTechnical || !player.currentPhysical || !player.currentMental) {
    weaknesses.push('unrated');
    return weaknesses;
  }

  // Use weaknesses array from player (source of truth)
  if (player.weaknesses && player.weaknesses.length > 0) {
    weaknesses.push(...player.weaknesses.map(w => w.toLowerCase().replace(/\s+/g, '_')));
  }

  // Technical skills analysis (average < 6 is considered weakness)
  const technical = player.currentTechnical;
  if (technical.serving && Object.values(technical.serving).reduce((a, b) => a + b, 0) / 3 < 6) weaknesses.push('low_serving');
  if (technical.passing && Object.values(technical.passing).reduce((a, b) => a + b, 0) / 3 < 6) weaknesses.push('low_passing');
  if (technical.setting && Object.values(technical.setting).reduce((a, b) => a + b, 0) / 3 < 6) weaknesses.push('low_setting');
  if (technical.attacking && Object.values(technical.attacking).reduce((a, b) => a + b, 0) / 3 < 6) weaknesses.push('low_attacking');
  if (technical.blocking && Object.values(technical.blocking).reduce((a, b) => a + b, 0) / 3 < 6) weaknesses.push('low_blocking');
  if (technical.defense && Object.values(technical.defense).reduce((a, b) => a + b, 0) / 3 < 6) weaknesses.push('low_defense');

  // Physical attributes analysis
  const physical = player.currentPhysical;
  if (physical.performance.verticalJump < 60) weaknesses.push('vertical_jump', 'explosive_power');
  if (physical.performance.acceleration > 3.5) weaknesses.push('sprint_speed', 'low_speed');
  if (physical.performance.agility > 10) weaknesses.push('footwork', 'agility');
  if (physical.performance.endurance < 65) weaknesses.push('endurance', 'stamina');

  // Mental attributes (if low)
  const mental = player.currentMental;
  if (Object.values(mental.gameIntelligence).reduce((a, b) => a + b, 0) / 5 < 6) weaknesses.push('game_understanding', 'decision_making');
  if (Object.values(mental.communication).reduce((a, b) => a + b, 0) / 5 < 5) weaknesses.push('communication');
  if (Object.values(mental.leadership).reduce((a, b) => a + b, 0) / 5 < 5) weaknesses.push('leadership');

  // Specific technical weaknesses from strengths/weaknesses text
  if (player.weaknesses && player.weaknesses.length > 0) {
    player.weaknesses.forEach(weakness => {
      const weaknessText = weakness.toLowerCase();

      if (weaknessText.includes('service') || weaknessText.includes('serve')) {
        weaknesses.push('serving_accuracy', 'serving_consistency');
      }
      if (weaknessText.includes('pass') || weaknessText.includes('réception')) {
        weaknesses.push('passing_consistency', 'platform_control');
      }
      if (weaknessText.includes('attaque') || weaknessText.includes('attack')) {
        weaknesses.push('attack_timing', 'kill_rate', 'approach_technique');
      }
      if (weaknessText.includes('bloc') || weaknessText.includes('block')) {
        weaknesses.push('blocking_timing', 'hand_position', 'lateral_movement');
      }
      if (weaknessText.includes('défense') || weaknessText.includes('defense') || weaknessText.includes('dig')) {
        weaknesses.push('dig_consistency', 'reaction_time', 'defensive_positioning');
      }
      if (weaknessText.includes('passe') && weaknessText.includes('passeur')) {
        weaknesses.push('setting_accuracy', 'consistency', 'decision_making');
      }
    });
  }

  // Remove duplicates
  return Array.from(new Set(weaknesses));
};

/**
 * Calculate match score between player weaknesses and exercise targets
 */
const calculateExerciseMatchScore = (
  playerWeaknesses: string[],
  exercise: TrainingExercise,
  player: PlayerType
): number => {
  let score = 0;

  // Match weakness targets (high weight)
  const matchedWeaknesses = exercise.targetWeaknesses?.filter(weakness =>
    playerWeaknesses.includes(weakness)
  ) || [];
  score += matchedWeaknesses.length * 10;

  // Match skill improvements based on player's low skills
  const technical = player.currentTechnical;
  const physical = player.currentPhysical;

  if (technical?.serving && Object.values(technical.serving).reduce((a, b) => a + b, 0) / 3 < 6 && exercise.improvesSkills.serving) {
    score += exercise.improvesSkills.serving;
  }
  if (technical?.passing && Object.values(technical.passing).reduce((a, b) => a + b, 0) / 3 < 6 && exercise.improvesSkills.passing) {
    score += exercise.improvesSkills.passing;
  }
  if (technical?.setting && Object.values(technical.setting).reduce((a, b) => a + b, 0) / 3 < 6 && exercise.improvesSkills.setting) {
    score += exercise.improvesSkills.setting;
  }
  if (technical?.attacking && Object.values(technical.attacking).reduce((a, b) => a + b, 0) / 3 < 6 && exercise.improvesSkills.attacking) {
    score += exercise.improvesSkills.attacking;
  }
  if (technical?.blocking && Object.values(technical.blocking).reduce((a, b) => a + b, 0) / 3 < 6 && exercise.improvesSkills.blocking) {
    score += exercise.improvesSkills.blocking;
  }
  if (technical?.defense && Object.values(technical.defense).reduce((a, b) => a + b, 0) / 3 < 6 && exercise.improvesSkills.defense) {
    score += exercise.improvesSkills.defense;
  }
  if (physical?.performance?.verticalJump && physical.performance.verticalJump < 60 && exercise.improvesSkills.verticalJump) {
    score += exercise.improvesSkills.verticalJump;
  }
  if (physical?.performance?.acceleration && physical.performance.acceleration > 3.5 && exercise.improvesSkills.speed) {
    score += exercise.improvesSkills.speed;
  }
  if (physical?.performance?.agility && physical.performance.agility > 10 && exercise.improvesSkills.agility) {
    score += exercise.improvesSkills.agility;
  }
  if (physical?.performance?.endurance && physical.performance.endurance < 65 && exercise.improvesSkills.endurance) {
    score += exercise.improvesSkills.endurance;
  }

  return score;
};

/**
 * Determine priority level based on match score
 */
const determinePriority = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= 20) return 'high';
  if (score >= 10) return 'medium';
  return 'low';
};

/**
 * Generate recommendation reason text
 */
const generateRecommendationReason = (
  player: PlayerType,
  exercise: TrainingExercise,
  matchedWeaknesses: string[]
): string => {
  const technical = player.currentTechnical;
  const physical = player.currentPhysical;
  const reasons: string[] = [];

  // Technical reasons - calculate averages
  if (technical?.serving) {
    const servingAvg = Object.values(technical.serving).reduce((a, b) => a + b, 0) / 3;
    if (servingAvg < 6 && exercise.improvesSkills.serving) {
      reasons.push(`améliore le service (${servingAvg.toFixed(1)}/10)`);
    }
  }
  if (technical?.passing) {
    const passingAvg = Object.values(technical.passing).reduce((a, b) => a + b, 0) / 3;
    if (passingAvg < 6 && exercise.improvesSkills.passing) {
      reasons.push(`améliore la passe (${passingAvg.toFixed(1)}/10)`);
    }
  }
  if (technical?.setting) {
    const settingAvg = Object.values(technical.setting).reduce((a, b) => a + b, 0) / 3;
    if (settingAvg < 6 && exercise.improvesSkills.setting) {
      reasons.push(`améliore la passe décisive (${settingAvg.toFixed(1)}/10)`);
    }
  }
  if (technical?.attacking) {
    const attackingAvg = Object.values(technical.attacking).reduce((a, b) => a + b, 0) / 3;
    if (attackingAvg < 6 && exercise.improvesSkills.attacking) {
      reasons.push(`améliore l'attaque (${attackingAvg.toFixed(1)}/10)`);
    }
  }
  if (technical?.blocking) {
    const blockingAvg = Object.values(technical.blocking).reduce((a, b) => a + b, 0) / 3;
    if (blockingAvg < 6 && exercise.improvesSkills.blocking) {
      reasons.push(`améliore le contre (${blockingAvg.toFixed(1)}/10)`);
    }
  }
  if (technical?.defense) {
    const defenseAvg = Object.values(technical.defense).reduce((a, b) => a + b, 0) / 3;
    if (defenseAvg < 6 && exercise.improvesSkills.defense) {
      reasons.push(`améliore la défense (${defenseAvg.toFixed(1)}/10)`);
    }
  }

  // Physical reasons
  if (physical?.performance?.verticalJump && physical.performance.verticalJump < 60 && exercise.improvesSkills.verticalJump) {
    reasons.push(`améliore la détente (${physical.performance.verticalJump}cm)`);
  }
  if (physical?.performance?.acceleration && physical.performance.acceleration > 3.5 && exercise.improvesSkills.speed) {
    reasons.push(`améliore la vitesse (${physical.performance.acceleration.toFixed(2)}s)`);
  }
  if (physical?.performance?.agility && physical.performance.agility > 10 && exercise.improvesSkills.agility) {
    reasons.push(`améliore l'agilité (${physical.performance.agility.toFixed(2)}s)`);
  }

  if (reasons.length === 0) {
    return 'Exercice complémentaire pour développement général';
  }

  return `Cet exercice ${reasons.slice(0, 2).join(' et ')}`;
};

/**
 * Generate expected improvement text
 */
const generateExpectedImprovement = (exercise: TrainingExercise): string => {
  const mainSkills: string[] = [];

  Object.entries(exercise.improvesSkills).forEach(([skill, value]) => {
    if (value && value >= 8) {
      const skillNames: Record<string, string> = {
        serving: 'Service',
        passing: 'Passe',
        setting: 'Passe décisive',
        attacking: 'Attaque',
        blocking: 'Contre',
        defense: 'Défense',
        verticalJump: 'Détente',
        speed: 'Vitesse',
        agility: 'Agilité',
        endurance: 'Endurance',
        coordination: 'Coordination',
        gameReading: 'Lecture de jeu',
      };
      if (skillNames[skill]) mainSkills.push(skillNames[skill]);
    }
  });

  if (mainSkills.length === 0) return 'Amélioration générale des compétences';

  return `+1-2 points en ${mainSkills.join(', ')} avec pratique régulière (4-6 semaines)`;
};

/**
 * Get exercise recommendations for a player
 */
export const getRecommendationsForPlayer = (
  player: PlayerType,
  limit: number = 10
): ExerciseRecommendation[] => {
  const weaknesses = identifyWeaknesses(player);

  // If player is unrated, return basic evaluation exercises
  if (weaknesses.includes('unrated')) {
    return TRAINING_EXERCISES.filter(ex =>
      ex.tags?.includes('fundamentals') || ex.tags?.includes('beginner')
    ).slice(0, limit).map(exercise => ({
      exercise,
      priority: 'high',
      reason: 'Évaluation initiale requise - Exercices de base',
      targetedWeaknesses: ['unrated'],
      expectedImprovement: 'Permet une première évaluation des compétences'
    }));
  }

  if (weaknesses.length === 0) {
    // Player has no significant weaknesses, return general exercises
    return TRAINING_EXERCISES.slice(0, limit).map(exercise => ({
      exercise,
      priority: 'low',
      reason: 'Exercice de maintien et perfectionnement',
      targetedWeaknesses: [],
      expectedImprovement: generateExpectedImprovement(exercise)
    }));
  }

  // Score each exercise
  const scoredExercises = TRAINING_EXERCISES.map(exercise => {
    const score = calculateExerciseMatchScore(weaknesses, exercise, player);
    const matchedWeaknesses = exercise.targetWeaknesses?.filter(w =>
      weaknesses.includes(w)
    ) || [];

    return {
      exercise,
      score,
      matchedWeaknesses
    };
  });

  // Sort by score (highest first)
  scoredExercises.sort((a, b) => b.score - a.score);

  // Convert to recommendations
  const recommendations: ExerciseRecommendation[] = scoredExercises
    .slice(0, limit)
    .filter(item => item.score > 0) // Only include exercises that match at least something
    .map(item => ({
      exercise: item.exercise,
      priority: determinePriority(item.score),
      reason: generateRecommendationReason(player, item.exercise, item.matchedWeaknesses),
      targetedWeaknesses: item.matchedWeaknesses,
      expectedImprovement: generateExpectedImprovement(item.exercise)
    }));

  // If no exercises match weaknesses, return top general exercises
  if (recommendations.length === 0) {
    return TRAINING_EXERCISES.slice(0, Math.min(5, limit)).map(exercise => ({
      exercise,
      priority: 'low' as const,
      reason: 'Exercice général recommandé',
      targetedWeaknesses: [],
      expectedImprovement: generateExpectedImprovement(exercise)
    }));
  }

  return recommendations;
};

/**
 * Get recommendations for multiple players (for team training)
 */
export const getRecommendationsForTeam = (
  players: PlayerType[],
  limit: number = 10
): ExerciseRecommendation[] => {
  // Aggregate all weaknesses across team
  const teamWeaknesses: Record<string, number> = {};

  players.forEach(player => {
    const weaknesses = identifyWeaknesses(player);
    weaknesses.forEach(weakness => {
      teamWeaknesses[weakness] = (teamWeaknesses[weakness] || 0) + 1;
    });
  });

  // Score exercises based on how many players they help
  const scoredExercises = TRAINING_EXERCISES.map(exercise => {
    let score = 0;

    exercise.targetWeaknesses?.forEach(weakness => {
      score += (teamWeaknesses[weakness] || 0) * 10;
    });

    // Count players this exercise helps
    let playersHelped = 0;
    players.forEach(player => {
      const playerScore = calculateExerciseMatchScore(
        identifyWeaknesses(player),
        exercise,
        player
      );
      if (playerScore > 0) playersHelped++;
    });

    return {
      exercise,
      score,
      playersHelped
    };
  });

  // Sort by score
  scoredExercises.sort((a, b) => b.score - a.score);

  // Convert to recommendations
  return scoredExercises
    .slice(0, limit)
    .map(item => ({
      exercise: item.exercise,
      priority: item.playersHelped >= players.length * 0.5 ? 'high' :
                item.playersHelped >= players.length * 0.3 ? 'medium' : 'low',
      reason: `Bénéfique pour ${item.playersHelped}/${players.length} joueurs de l'équipe`,
      targetedWeaknesses: Object.keys(teamWeaknesses).filter(w =>
        item.exercise.targetWeaknesses?.includes(w)
      ),
      expectedImprovement: generateExpectedImprovement(item.exercise)
    }));
};
