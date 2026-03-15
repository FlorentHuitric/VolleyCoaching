/**
 * Position-specific weight configurations for professional evaluation
 * Based on FIVB position requirements and international scouting standards
 */

export type PlayerPosition = 
  | 'SETTER'
  | 'OUTSIDE_HITTER'
  | 'OPPOSITE'
  | 'MIDDLE_BLOCKER'
  | 'LIBERO'
  | 'DEFENSIVE_SPECIALIST'
  | 'UNIVERSAL';

export type SkillCategory = 'physical' | 'technical' | 'tactical' | 'mental';

export interface PositionWeights {
  // Category weights (must sum to 100)
  categoryWeights: {
    physical: number;
    technical: number;
    tactical: number;
    mental: number;
  };
  
  // Specific skill weights within technical category
  technicalSkillWeights: {
    serving: number;
    passing: number;
    setting: number;
    attacking: number;
    blocking: number;
    defense: number;
  };
  
  // Physical attribute priorities
  physicalAttributeWeights: {
    power: number;      // Vertical jump, attacking power
    speed: number;      // Sprint
    agility: number;    // Agility test
    endurance: number;  // Endurance test
  };
}

/**
 * Position-specific weight configurations
 * All weights are percentages and sum to 100 within their category
 */
export const POSITION_WEIGHTS: Record<PlayerPosition, PositionWeights> = {
  
  SETTER: {
    categoryWeights: {
      physical: 15,    // Least physical position
      technical: 50,   // Highest technical demands
      tactical: 20,    // High tactical IQ required
      mental: 15       // Leadership and communication
    },
    technicalSkillWeights: {
      serving: 10,
      passing: 15,
      setting: 45,     // Primary skill
      attacking: 5,    // Occasional dumps/attacks
      blocking: 10,
      defense: 15
    },
    physicalAttributeWeights: {
      power: 20,       // Jump for blocking
      speed: 25,       // Quick movements
      agility: 35,     // Most important - court coverage
      endurance: 20    // Moderate importance
    }
  },

  OUTSIDE_HITTER: {
    categoryWeights: {
      physical: 30,    // High physical demands
      technical: 40,   // Balanced technical skills
      tactical: 15,    // Good tactical awareness
      mental: 15       // Mental toughness
    },
    technicalSkillWeights: {
      serving: 15,
      passing: 25,     // Critical for reception
      setting: 5,
      attacking: 35,   // Primary offensive role
      blocking: 10,
      defense: 10
    },
    physicalAttributeWeights: {
      power: 40,       // Jump and power critical
      speed: 20,
      agility: 20,
      endurance: 20    // Long rallies
    }
  },

  OPPOSITE: {
    categoryWeights: {
      physical: 35,    // Highest physical demands
      technical: 40,   // Focus on offense
      tactical: 13,    // Moderate tactical role
      mental: 12       // Confidence and aggression
    },
    technicalSkillWeights: {
      serving: 20,     // Key service role
      passing: 5,      // Limited reception
      setting: 5,
      attacking: 45,   // Primary scorer
      blocking: 20,    // Important defensive role
      defense: 5
    },
    physicalAttributeWeights: {
      power: 50,       // Most power-dependent position
      speed: 15,
      agility: 15,
      endurance: 20
    }
  },

  MIDDLE_BLOCKER: {
    categoryWeights: {
      physical: 35,    // Very physical position
      technical: 35,   // Specialized skills
      tactical: 18,    // High blocking IQ
      mental: 12       // Quick decision making
    },
    technicalSkillWeights: {
      serving: 15,
      passing: 5,      // Rarely passes
      setting: 5,
      attacking: 25,   // Quick attacks
      blocking: 40,    // Primary skill
      defense: 10
    },
    physicalAttributeWeights: {
      power: 40,       // Height and jump critical
      speed: 25,       // Lateral speed for blocking
      agility: 25,     // Quick transitions
      endurance: 10    // Shorter points
    }
  },

  LIBERO: {
    categoryWeights: {
      physical: 20,    // Less power, more agility
      technical: 45,   // Highest technical precision
      tactical: 20,    // Court awareness and positioning
      mental: 15       // Leadership and communication
    },
    technicalSkillWeights: {
      serving: 10,     // Jump serve not allowed
      passing: 40,     // Primary skill
      setting: 5,      // Emergency sets only
      attacking: 0,    // Not allowed to attack
      blocking: 0,     // Not allowed to block
      defense: 45      // Critical skill
    },
    physicalAttributeWeights: {
      power: 5,        // Minimal importance
      speed: 25,       // Important for coverage
      agility: 50,     // Most critical
      endurance: 20    // High rally involvement
    }
  },

  DEFENSIVE_SPECIALIST: {
    categoryWeights: {
      physical: 20,
      technical: 45,
      tactical: 20,
      mental: 15
    },
    technicalSkillWeights: {
      serving: 15,     // Can serve (unlike libero)
      passing: 35,
      setting: 5,
      attacking: 5,
      blocking: 5,
      defense: 35
    },
    physicalAttributeWeights: {
      power: 10,
      speed: 25,
      agility: 45,
      endurance: 20
    }
  },

  UNIVERSAL: {
    categoryWeights: {
      physical: 25,    // Balanced
      technical: 40,   // Balanced
      tactical: 20,    // Balanced
      mental: 15       // Balanced
    },
    technicalSkillWeights: {
      serving: 15,
      passing: 20,
      setting: 10,
      attacking: 25,
      blocking: 15,
      defense: 15
    },
    physicalAttributeWeights: {
      power: 30,
      speed: 25,
      agility: 25,
      endurance: 20
    }
  }
};

/**
 * Get position weights for a specific position
 */
export function getPositionWeights(position: PlayerPosition): PositionWeights {
  return POSITION_WEIGHTS[position];
}

/**
 * Normalize weights to ensure they sum to 100
 */
function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const normalized: Record<string, number> = {};
  
  for (const [key, value] of Object.entries(weights)) {
    normalized[key] = (value / total) * 100;
  }
  
  return normalized;
}

/**
 * Validate that weights sum to approximately 100 (with 0.1 tolerance)
 */
export function validateWeights(weights: Record<string, number>): boolean {
  const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
  return Math.abs(sum - 100) < 0.1;
}

/**
 * Get position-specific test priorities
 * Returns array of test IDs sorted by importance for the position
 */
export function getPositionTestPriorities(position: PlayerPosition): string[] {
  const weights = getPositionWeights(position);
  
  switch (position) {
    case 'SETTER':
      return [
        'setting_accuracy',
        'setting_consistency',
        'game_intelligence',
        'leadership',
        'passing',
        'vertical_jump',
        'agility',
        'communication'
      ];
    
    case 'OUTSIDE_HITTER':
      return [
        'attacking',
        'passing',
        'vertical_jump',
        'serving_accuracy',
        'sprint',
        'mental_toughness',
        'blocking',
        'defense'
      ];
    
    case 'OPPOSITE':
      return [
        'attacking',
        'attacking_power',
        'serving_accuracy',
        'blocking',
        'vertical_jump',
        'sprint',
        'mental_toughness',
        'agility'
      ];
    
    case 'MIDDLE_BLOCKER':
      return [
        'blocking',
        'attacking',
        'vertical_jump',
        'sprint',
        'agility',
        'game_intelligence',
        'serving_accuracy',
        'mental_toughness'
      ];
    
    case 'LIBERO':
      return [
        'passing',
        'defense',
        'agility',
        'game_situation',
        'communication',
        'leadership',
        'sprint',
        'endurance'
      ];
    
    case 'DEFENSIVE_SPECIALIST':
      return [
        'passing',
        'defense',
        'agility',
        'serving_accuracy',
        'communication',
        'sprint',
        'endurance',
        'game_situation'
      ];
    
    case 'UNIVERSAL':
      return [
        'attacking',
        'passing',
        'vertical_jump',
        'serving_accuracy',
        'blocking',
        'defense',
        'game_intelligence',
        'mental_toughness'
      ];
    
    default:
      return [];
  }
}

/**
 * Calculate weighted score for a position based on test results
 * 
 * @param testScores - Map of testId to score (1-10)
 * @param position - Player position
 * @returns Weighted overall score (1-10)
 */
export function calculatePositionWeightedScore(
  testScores: Record<string, number>,
  position: PlayerPosition
): number {
  const weights = getPositionWeights(position);
  
  // Categorize tests
  const physicalTests = ['vertical_jump', 'sprint', 'agility', 'endurance', 'serving_power', 'attacking_power'];
  const technicalTests = ['serving_accuracy', 'passing', 'setting_accuracy', 'setting_consistency', 'attacking', 'blocking', 'defense'];
  const tacticalTests = ['game_situation'];
  const mentalTests = ['mental_toughness', 'game_intelligence', 'leadership', 'communication'];
  
  // Calculate category averages
  const categoryScores = {
    physical: calculateCategoryAverage(testScores, physicalTests),
    technical: calculateCategoryAverage(testScores, technicalTests),
    tactical: calculateCategoryAverage(testScores, tacticalTests),
    mental: calculateCategoryAverage(testScores, mentalTests)
  };
  
  // Apply category weights
  let weightedScore = 0;
  weightedScore += (categoryScores.physical * weights.categoryWeights.physical) / 100;
  weightedScore += (categoryScores.technical * weights.categoryWeights.technical) / 100;
  weightedScore += (categoryScores.tactical * weights.categoryWeights.tactical) / 100;
  weightedScore += (categoryScores.mental * weights.categoryWeights.mental) / 100;
  
  return Math.round(weightedScore * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate average score for a category of tests
 */
function calculateCategoryAverage(
  testScores: Record<string, number>,
  testIds: string[]
): number {
  const relevantScores = testIds
    .filter(testId => testScores[testId] !== undefined)
    .map(testId => testScores[testId]);
  
  if (relevantScores.length === 0) return 0;
  
  const sum = relevantScores.reduce((acc, score) => acc + score, 0);
  return sum / relevantScores.length;
}

/**
 * Get position-specific strengths and weaknesses
 * 
 * @param testScores - Map of testId to score (1-10)
 * @param position - Player position
 * @returns Object with top 3 strengths and weaknesses
 */
export function analyzePositionProfile(
  testScores: Record<string, number>,
  position: PlayerPosition
): {
  strengths: Array<{ test: string; score: number; importance: 'critical' | 'important' | 'moderate' }>;
  weaknesses: Array<{ test: string; score: number; importance: 'critical' | 'important' | 'moderate' }>;
  overallRating: number;
} {
  const priorities = getPositionTestPriorities(position);
  
  // Map test scores with importance
  const scoredTests = priorities
    .filter(testId => testScores[testId] !== undefined)
    .map((testId, index) => {
      let importance: 'critical' | 'important' | 'moderate';
      if (index < 3) importance = 'critical';
      else if (index < 6) importance = 'important';
      else importance = 'moderate';
      
      return {
        test: testId,
        score: testScores[testId],
        importance
      };
    });
  
  // Sort by score
  const sortedByScore = [...scoredTests].sort((a, b) => b.score - a.score);
  
  // Top 3 strengths
  const strengths = sortedByScore.slice(0, 3);
  
  // Top 3 weaknesses (focus on critical and important tests)
  const criticalAndImportant = scoredTests.filter(
    t => t.importance === 'critical' || t.importance === 'important'
  );
  const weaknesses = criticalAndImportant
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  
  // Calculate overall rating
  const overallRating = calculatePositionWeightedScore(testScores, position);
  
  return {
    strengths,
    weaknesses,
    overallRating
  };
}

/**
 * Get recommended training priorities for a position
 */
export function getTrainingPriorities(
  testScores: Record<string, number>,
  position: PlayerPosition
): Array<{
  category: SkillCategory;
  tests: string[];
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}> {
  const analysis = analyzePositionProfile(testScores, position);
  const weights = getPositionWeights(position);
  
  const priorities: Array<{
    category: SkillCategory;
    tests: string[];
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }> = [];
  
  // Focus on weaknesses in critical areas
  const criticalWeaknesses = analysis.weaknesses.filter(w => w.importance === 'critical' && w.score < 6);
  
  if (criticalWeaknesses.length > 0) {
    const category = categorizeTest(criticalWeaknesses[0].test);
    priorities.push({
      category,
      tests: criticalWeaknesses.map(w => w.test),
      priority: 'high',
      reasoning: `Critical weakness detected in position-essential skill. Score ${criticalWeaknesses[0].score}/10 needs immediate attention.`
    });
  }
  
  // Identify category with lowest performance
  const categoryPerformance = {
    physical: calculateCategoryAverage(testScores, ['vertical_jump', 'sprint', 'agility', 'endurance']),
    technical: calculateCategoryAverage(testScores, ['serving_accuracy', 'passing', 'attacking', 'blocking', 'defense']),
    tactical: calculateCategoryAverage(testScores, ['game_situation']),
    mental: calculateCategoryAverage(testScores, ['mental_toughness', 'game_intelligence', 'leadership', 'communication'])
  };
  
  const sortedCategories = Object.entries(categoryPerformance)
    .sort(([, a], [, b]) => a - b)
    .filter(([, score]) => score > 0 && score < 7); // Focus on categories that need work
  
  if (sortedCategories.length > 0) {
    const [weakestCategory, score] = sortedCategories[0];
    priorities.push({
      category: weakestCategory as SkillCategory,
      tests: getTestsForCategory(weakestCategory as SkillCategory),
      priority: 'medium',
      reasoning: `${weakestCategory} category shows room for improvement (avg ${score.toFixed(1)}/10).`
    });
  }
  
  return priorities;
}

/**
 * Categorize a test into physical/technical/tactical/mental
 */
function categorizeTest(testId: string): SkillCategory {
  if (['vertical_jump', 'sprint', 'agility', 'endurance', 'serving_power', 'attacking_power'].includes(testId)) {
    return 'physical';
  }
  if (['serving_accuracy', 'passing', 'setting_accuracy', 'setting_consistency', 'attacking', 'blocking', 'defense'].includes(testId)) {
    return 'technical';
  }
  if (['game_situation'].includes(testId)) {
    return 'tactical';
  }
  return 'mental';
}

/**
 * Get all tests for a category
 */
function getTestsForCategory(category: SkillCategory): string[] {
  switch (category) {
    case 'physical':
      return ['vertical_jump', 'sprint', 'agility', 'endurance'];
    case 'technical':
      return ['serving_accuracy', 'passing', 'setting_accuracy', 'attacking', 'blocking', 'defense'];
    case 'tactical':
      return ['game_situation'];
    case 'mental':
      return ['mental_toughness', 'game_intelligence', 'leadership', 'communication'];
    default:
      return [];
  }
}
