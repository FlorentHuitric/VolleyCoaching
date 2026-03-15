/**
 * Stats Merge Logic
 * Implements weighted average for progressive stat updates
 * 70% current stats + 30% new evaluation
 */

interface EvaluationStats {
  overallRating: number;
  potentialRating: number;
  technical: any; // JSON
  physical: any; // JSON
  mental: any; // JSON
  strengths: string[];
  improvementAreas: string[];
}

interface PlayerCurrentStats {
  currentRating?: number | null;
  potentialRating?: number | null;
  currentTechnical?: any | null;
  currentPhysical?: any | null;
  currentMental?: any | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
}

interface MergedStats {
  currentRating: number;
  potentialRating: number;
  currentTechnical: any;
  currentPhysical: any;
  currentMental: any;
  strengths: string[];
  weaknesses: string[];
  statsUpdatedAt: Date;
}

/**
 * Merge JSON skill objects with weighted average
 */
function mergeSkillObject(current: any, newEval: any, weight: number = 0.7): any {
  if (!current) return newEval;
  if (!newEval) return current;

  const merged: any = {};

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(current), ...Object.keys(newEval)]);

  for (const key of allKeys) {
    const currentValue = current[key];
    const newValue = newEval[key];

    // Handle nested objects (like serving.accuracy, serving.power, etc.)
    if (typeof currentValue === 'object' && typeof newValue === 'object' && !Array.isArray(currentValue)) {
      merged[key] = mergeSkillObject(currentValue, newValue, weight);
    }
    // Handle numeric values with weighted average
    else if (typeof currentValue === 'number' && typeof newValue === 'number') {
      merged[key] = Math.round((currentValue * weight + newValue * (1 - weight)) * 10) / 10;
    }
    // Use new value if current doesn't exist
    else if (currentValue === undefined || currentValue === null) {
      merged[key] = newValue;
    }
    // Keep current value if new doesn't exist
    else if (newValue === undefined || newValue === null) {
      merged[key] = currentValue;
    }
    // Default to new value
    else {
      merged[key] = newValue;
    }
  }

  return merged;
}

/**
 * Merge strengths and weaknesses arrays
 * Takes top 3 most recent from both old and new
 */
function mergeStringArrays(current: string[] | null | undefined, newArr: string[]): string[] {
  if (!current || current.length === 0) return newArr.slice(0, 3);

  // Combine and deduplicate
  const combined = [...new Set([...newArr, ...current])];

  // Take top 3 (prioritize new evaluation items)
  return combined.slice(0, 3);
}

/**
 * Main merge function: combines current player stats with new evaluation
 * Uses 70% weight for current stats, 30% for new evaluation
 */
export function mergePlayerStats(
  currentStats: PlayerCurrentStats,
  newEvaluation: EvaluationStats
): MergedStats {
  const CURRENT_WEIGHT = 0.7;

  return {
    currentRating: currentStats.currentRating
      ? Math.round((currentStats.currentRating * CURRENT_WEIGHT + newEvaluation.overallRating * (1 - CURRENT_WEIGHT)) * 10) / 10
      : newEvaluation.overallRating,

    potentialRating: currentStats.potentialRating
      ? Math.round((currentStats.potentialRating * CURRENT_WEIGHT + newEvaluation.potentialRating * (1 - CURRENT_WEIGHT)) * 10) / 10
      : newEvaluation.potentialRating,

    currentTechnical: mergeSkillObject(currentStats.currentTechnical, newEvaluation.technical, CURRENT_WEIGHT),
    currentPhysical: mergeSkillObject(currentStats.currentPhysical, newEvaluation.physical, CURRENT_WEIGHT),
    currentMental: mergeSkillObject(currentStats.currentMental, newEvaluation.mental, CURRENT_WEIGHT),

    strengths: mergeStringArrays(currentStats.strengths, newEvaluation.strengths),
    weaknesses: mergeStringArrays(currentStats.weaknesses, newEvaluation.improvementAreas),

    statsUpdatedAt: new Date()
  };
}

/**
 * Calculate stat changes between old and new stats
 * Returns diff object for UI arrows
 */
export interface StatChange {
  field: string;
  oldValue: number;
  newValue: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export function calculateStatChanges(
  oldStats: PlayerCurrentStats,
  newStats: MergedStats
): StatChange[] {
  const changes: StatChange[] = [];

  // Overall rating change
  if (oldStats.currentRating && newStats.currentRating) {
    const change = newStats.currentRating - oldStats.currentRating;
    changes.push({
      field: 'overallRating',
      oldValue: oldStats.currentRating,
      newValue: newStats.currentRating,
      change: Math.round(change * 10) / 10,
      trend: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'neutral'
    });
  }

  // Potential rating change
  if (oldStats.potentialRating && newStats.potentialRating) {
    const change = newStats.potentialRating - oldStats.potentialRating;
    changes.push({
      field: 'potentialRating',
      oldValue: oldStats.potentialRating,
      newValue: newStats.potentialRating,
      change: Math.round(change * 10) / 10,
      trend: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'neutral'
    });
  }

  return changes;
}

/**
 * Calculate detailed skill changes for tooltips
 */
export interface DetailedSkillChange {
  category: string; // 'technical', 'physical', 'mental'
  skill: string; // 'serving.accuracy', 'speed', 'focus'
  oldValue: number;
  newValue: number;
  change: number;
}

export function calculateDetailedSkillChanges(
  oldTechnical: any,
  newTechnical: any,
  oldPhysical: any,
  newPhysical: any,
  oldMental: any,
  newMental: any
): DetailedSkillChange[] {
  const changes: DetailedSkillChange[] = [];

  const extractChanges = (oldObj: any, newObj: any, category: string, prefix = '') => {
    if (!oldObj || !newObj) return;

    for (const key of Object.keys(newObj)) {
      const oldValue = oldObj[key];
      const newValue = newObj[key];

      if (typeof newValue === 'object' && !Array.isArray(newValue)) {
        extractChanges(oldValue, newValue, category, `${prefix}${key}.`);
      } else if (typeof oldValue === 'number' && typeof newValue === 'number') {
        const change = newValue - oldValue;
        if (Math.abs(change) > 0.1) {
          changes.push({
            category,
            skill: `${prefix}${key}`,
            oldValue: Math.round(oldValue * 10) / 10,
            newValue: Math.round(newValue * 10) / 10,
            change: Math.round(change * 10) / 10
          });
        }
      }
    }
  };

  extractChanges(oldTechnical, newTechnical, 'technical');
  extractChanges(oldPhysical, newPhysical, 'physical');
  extractChanges(oldMental, newMental, 'mental');

  return changes;
}
