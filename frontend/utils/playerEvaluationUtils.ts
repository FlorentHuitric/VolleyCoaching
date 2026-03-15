import {
  PlayerEvaluation,
  PlayerProfile,
  SkillRating,
  TechnicalSkills,
  PhysicalAttributes,
  MentalAttributes,
  PositionSpecificSkills,
  PerformanceAnalytics,
  EvaluationTemplate
} from '@/types/player-evaluation';
import { VolleyballPosition } from '@/hooks/useCourtStore';

// SOLID Principles: Single Responsibility & Interface Segregation

/**
 * Skill rating utilities
 */
export class SkillRatingUtils {
  /**
   * Convert skill rating to descriptive level
   */
  static getSkillLevel(rating: SkillRating): string {
    if (rating <= 3) return 'Developing';
    if (rating <= 6) return 'Intermediate';
    if (rating <= 8) return 'Advanced';
    return 'Elite';
  }

  /**
   * Get skill level color for UI
   */
  static getSkillLevelColor(rating: SkillRating): string {
    if (rating <= 3) return '#ef4444'; // red-500
    if (rating <= 6) return '#f59e0b'; // amber-500
    if (rating <= 8) return '#3b82f6'; // blue-500
    return '#10b981'; // emerald-500
  }

  /**
   * Calculate weighted average of skill ratings
   */
  static calculateWeightedAverage(
    ratings: { rating: SkillRating; weight: number }[]
  ): SkillRating {
    const totalWeight = ratings.reduce((sum, { weight }) => sum + weight, 0);
    const weightedSum = ratings.reduce(
      (sum, { rating, weight }) => sum + rating * weight,
      0
    );
    return Math.round(weightedSum / totalWeight) as SkillRating;
  }

  /**
   * Calculate skill progression trend
   */
  static calculateTrend(
    historicalRatings: { date: Date; rating: SkillRating }[]
  ): 'improving' | 'stable' | 'declining' {
    if (historicalRatings.length < 2) return 'stable';

    const sortedRatings = historicalRatings.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const recent = sortedRatings.slice(-3);
    if (recent.length < 2) return 'stable';

    const slope = (recent[recent.length - 1].rating - recent[0].rating) / (recent.length - 1);

    if (slope > 0.5) return 'improving';
    if (slope < -0.5) return 'declining';
    return 'stable';
  }
}

/**
 * Overall rating calculator following position-specific weights
 */
export class OverallRatingCalculator {
  private static readonly POSITION_WEIGHTS: Record<VolleyballPosition, {
    technical: number;
    physical: number;
    mental: number;
    positionSpecific: number;
  }> = {
    SETTER: { technical: 0.4, physical: 0.2, mental: 0.3, positionSpecific: 0.1 },
    OUTSIDE_HITTER: { technical: 0.35, physical: 0.3, mental: 0.25, positionSpecific: 0.1 },
    MIDDLE_BLOCKER: { technical: 0.3, physical: 0.4, mental: 0.2, positionSpecific: 0.1 },
    OPPOSITE: { technical: 0.35, physical: 0.3, mental: 0.25, positionSpecific: 0.1 },
    LIBERO: { technical: 0.5, physical: 0.15, mental: 0.25, positionSpecific: 0.1 },
    DEFENSIVE_SPECIALIST: { technical: 0.4, physical: 0.2, mental: 0.3, positionSpecific: 0.1 },
  };

  /**
   * Calculate technical skills average
   */
  static calculateTechnicalAverage(technical: TechnicalSkills): SkillRating {
    const servingAvg = Object.values(technical.serving).reduce((a, b) => a + b, 0) / 5;
    const passingAvg = Object.values(technical.passing).reduce((a, b) => a + b, 0) / 5;
    const settingAvg = Object.values(technical.setting).reduce((a, b) => a + b, 0) / 5;
    const attackingAvg = Object.values(technical.attacking).reduce((a, b) => a + b, 0) / 5;
    const blockingAvg = Object.values(technical.blocking).reduce((a, b) => a + b, 0) / 5;
    const defenseAvg = Object.values(technical.defense).reduce((a, b) => a + b, 0) / 5;

    return Math.round((servingAvg + passingAvg + settingAvg + attackingAvg + blockingAvg + defenseAvg) / 6) as SkillRating;
  }

  /**
   * Calculate physical attributes score (normalized to 1-10 scale)
   */
  static calculatePhysicalScore(physical: PhysicalAttributes, position: VolleyballPosition): SkillRating {
    // Normalize physical measurements based on position expectations
    const positionStandards = this.getPositionPhysicalStandards(position);

    const jumpScore = Math.min(10, (physical.performance.verticalJump / positionStandards.verticalJump) * 10);
    const heightScore = Math.min(10, (physical.measurements.height / positionStandards.height) * 10);
    const powerScore = Math.min(10, (physical.power.swingVelocity / positionStandards.swingVelocity) * 10);
    const agilityScore = Math.min(10, (positionStandards.agility / physical.performance.agility) * 10);

    const flexibilityAvg = Object.values(physical.flexibility).reduce((a, b) => a + b, 0) / 4;

    return Math.round((jumpScore + heightScore + powerScore + agilityScore + flexibilityAvg) / 5) as SkillRating;
  }

  /**
   * Calculate mental attributes average
   */
  static calculateMentalAverage(mental: MentalAttributes): SkillRating {
    const gameIntelligenceAvg = Object.values(mental.gameIntelligence).reduce((a, b) => a + b, 0) / 5;
    const communicationAvg = Object.values(mental.communication).reduce((a, b) => a + b, 0) / 5;
    const leadershipAvg = Object.values(mental.leadership).reduce((a, b) => a + b, 0) / 5;
    const mentalToughnessAvg = Object.values(mental.mentalToughness).reduce((a, b) => a + b, 0) / 5;
    const coachabilityAvg = Object.values(mental.coachability).reduce((a, b) => a + b, 0) / 5;

    return Math.round((gameIntelligenceAvg + communicationAvg + leadershipAvg + mentalToughnessAvg + coachabilityAvg) / 5) as SkillRating;
  }

  /**
   * Calculate position-specific skills average
   */
  static calculatePositionSpecificAverage(
    positionSkills: PositionSpecificSkills,
    position: VolleyballPosition
  ): SkillRating {
    const skills = positionSkills[position.toLowerCase() as keyof PositionSpecificSkills];
    if (!skills) return 5;

    const values = Object.values(skills);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length) as SkillRating;
  }

  /**
   * Calculate overall rating using position-specific weights
   */
  static calculateOverallRating(evaluation: PlayerEvaluation): SkillRating {
    const weights = this.POSITION_WEIGHTS[evaluation.position];

    const technicalAvg = this.calculateTechnicalAverage(evaluation.technical);
    const physicalScore = this.calculatePhysicalScore(evaluation.physical, evaluation.position);
    const mentalAvg = this.calculateMentalAverage(evaluation.mental);
    const positionAvg = this.calculatePositionSpecificAverage(
      evaluation.positionSpecific,
      evaluation.position
    );

    const weightedScore = (
      technicalAvg * weights.technical +
      physicalScore * weights.physical +
      mentalAvg * weights.mental +
      positionAvg * weights.positionSpecific
    );

    return Math.round(weightedScore) as SkillRating;
  }

  /**
   * Get physical standards by position (for normalization)
   */
  private static getPositionPhysicalStandards(position: VolleyballPosition) {
    const standards = {
      SETTER: { height: 180, verticalJump: 60, swingVelocity: 65, agility: 9.5 },
      OUTSIDE_HITTER: { height: 185, verticalJump: 70, swingVelocity: 75, agility: 9.0 },
      MIDDLE_BLOCKER: { height: 195, verticalJump: 75, swingVelocity: 70, agility: 10.0 },
      OPPOSITE: { height: 190, verticalJump: 72, swingVelocity: 78, agility: 9.2 },
      LIBERO: { height: 170, verticalJump: 50, swingVelocity: 50, agility: 8.5 },
      DEFENSIVE_SPECIALIST: { height: 175, verticalJump: 55, swingVelocity: 55, agility: 8.8 },
    };

    return standards[position];
  }
}

/**
 * Performance analytics generator
 */
export class PerformanceAnalyticsGenerator {
  /**
   * Generate comprehensive analytics for a player
   */
  static generateAnalytics(
    profile: PlayerProfile,
    teamAverages?: Record<string, number>
  ): PerformanceAnalytics {
    const evaluationHistory = profile.evaluationHistory;
    const currentEvaluation = profile.currentEvaluation;

    if (!currentEvaluation || evaluationHistory.length === 0) {
      throw new Error('Insufficient evaluation data for analytics');
    }

    return {
      playerId: profile.id,
      skillProgressions: this.calculateSkillProgressions(evaluationHistory),
      positionRanking: this.calculatePositionRanking(currentEvaluation, teamAverages),
      skillRadar: this.generateSkillRadar(currentEvaluation),
      topStrengths: this.identifyTopStrengths(currentEvaluation, evaluationHistory),
      priorityWeaknesses: this.identifyPriorityWeaknesses(currentEvaluation),
      trainingRecommendations: this.generateTrainingRecommendations(currentEvaluation),
      estimatedDevelopmentTime: this.estimateDevelopmentTimes(currentEvaluation),
    };
  }

  /**
   * Calculate skill progressions over time
   */
  private static calculateSkillProgressions(
    history: PlayerEvaluation[]
  ): Record<string, { dates: Date[]; ratings: SkillRating[]; trend: string }> {
    const progressions: Record<string, { dates: Date[]; ratings: SkillRating[]; trend: string }> = {};

    // Track key skills over time
    const keySkills = [
      'serving', 'passing', 'setting', 'attacking', 'blocking', 'defense',
      'overall', 'physical', 'mental'
    ];

    keySkills.forEach(skill => {
      const data = history.map(eval => ({
        date: eval.evaluationDate,
        rating: skill === 'overall' ? eval.overallRating :
                skill === 'physical' ? OverallRatingCalculator.calculatePhysicalScore(eval.physical, eval.position) :
                skill === 'mental' ? OverallRatingCalculator.calculateMentalAverage(eval.mental) :
                this.getSkillRating(eval, skill)
      }));

      const trend = SkillRatingUtils.calculateTrend(data);

      progressions[skill] = {
        dates: data.map(d => d.date),
        ratings: data.map(d => d.rating),
        trend
      };
    });

    return progressions;
  }

  /**
   * Generate radar chart data
   */
  private static generateSkillRadar(evaluation: PlayerEvaluation) {
    const technical = OverallRatingCalculator.calculateTechnicalAverage(evaluation.technical);
    const physical = OverallRatingCalculator.calculatePhysicalScore(evaluation.physical, evaluation.position);
    const mental = OverallRatingCalculator.calculateMentalAverage(evaluation.mental);
    const positionSpecific = OverallRatingCalculator.calculatePositionSpecificAverage(
      evaluation.positionSpecific,
      evaluation.position
    );

    return {
      labels: ['Technical', 'Physical', 'Mental', 'Position Skills', 'Communication', 'Leadership'],
      current: [
        technical,
        physical,
        mental,
        positionSpecific,
        evaluation.mental.communication.verbal,
        evaluation.mental.leadership.onCourtPresence
      ],
      potential: [
        Math.min(10, technical + 1.5),
        Math.min(10, physical + 1),
        Math.min(10, mental + 2),
        Math.min(10, positionSpecific + 1.5),
        Math.min(10, evaluation.mental.communication.verbal + 2),
        Math.min(10, evaluation.mental.leadership.onCourtPresence + 1.5)
      ],
      target: [8, 7, 8, 8, 7, 7] // Reasonable targets
    };
  }

  /**
   * Identify top strengths
   */
  private static identifyTopStrengths(
    current: PlayerEvaluation,
    history: PlayerEvaluation[]
  ) {
    // Extract all skill ratings and identify top performers
    const allSkills = this.extractAllSkills(current);

    return allSkills
      .filter(skill => skill.rating >= 7) // Only strengths
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(skill => ({
        ...skill,
        trend: history.length > 1 ?
          SkillRatingUtils.calculateTrend(
            history.map(h => ({
              date: h.evaluationDate,
              rating: this.getSkillRating(h, skill.skill)
            }))
          ) : 'stable'
      }));
  }

  /**
   * Identify priority weaknesses
   */
  private static identifyPriorityWeaknesses(evaluation: PlayerEvaluation) {
    const allSkills = this.extractAllSkills(evaluation);

    return allSkills
      .filter(skill => skill.rating <= 5) // Only weaknesses
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 3)
      .map(skill => ({
        ...skill,
        impact: this.determineImpactLevel(skill.skill, evaluation.position)
      }));
  }

  /**
   * Generate training recommendations
   */
  private static generateTrainingRecommendations(evaluation: PlayerEvaluation): string[] {
    const weaknesses = this.identifyPriorityWeaknesses(evaluation);
    const position = evaluation.position;

    const recommendations: string[] = [];

    weaknesses.forEach(weakness => {
      switch (weakness.skill) {
        case 'serving':
          recommendations.push('Focus on serving consistency drills and target practice');
          break;
        case 'passing':
          recommendations.push('Improve passing platform and footwork with reception drills');
          break;
        case 'attacking':
          recommendations.push('Work on approach timing and arm swing mechanics');
          break;
        case 'blocking':
          recommendations.push('Practice reading opponent attacks and hand positioning');
          break;
        default:
          recommendations.push(`Develop ${weakness.skill} through targeted skill sessions`);
      }
    });

    // Position-specific recommendations
    if (position === 'SETTER') {
      recommendations.push('Enhance ball handling precision and distribution timing');
    } else if (position === 'LIBERO') {
      recommendations.push('Focus on advanced digging techniques and court coverage');
    }

    return recommendations;
  }

  /**
   * Extract all skills from evaluation for analysis
   */
  private static extractAllSkills(evaluation: PlayerEvaluation) {
    const skills: { skill: string; rating: SkillRating }[] = [];

    // Technical skills
    Object.entries(evaluation.technical).forEach(([category, skillSet]) => {
      Object.entries(skillSet).forEach(([skill, rating]) => {
        skills.push({ skill: `${category}.${skill}`, rating: rating as SkillRating });
      });
    });

    return skills;
  }

  /**
   * Get skill rating from evaluation
   */
  private static getSkillRating(evaluation: PlayerEvaluation, skillPath: string): SkillRating {
    // Simplified - in real implementation would parse the skillPath
    return evaluation.overallRating;
  }

  /**
   * Calculate position ranking
   */
  private static calculatePositionRanking(
    evaluation: PlayerEvaluation,
    teamAverages?: Record<string, number>
  ) {
    // Simplified ranking - would compare against team/league averages
    return {
      overall: evaluation.overallRating,
      technical: OverallRatingCalculator.calculateTechnicalAverage(evaluation.technical),
      physical: OverallRatingCalculator.calculatePhysicalScore(evaluation.physical, evaluation.position),
      mental: OverallRatingCalculator.calculateMentalAverage(evaluation.mental),
    };
  }

  /**
   * Determine impact level of weakness
   */
  private static determineImpactLevel(
    skill: string,
    position: VolleyballPosition
  ): 'high' | 'medium' | 'low' {
    const criticalSkills: Record<VolleyballPosition, string[]> = {
      SETTER: ['setting', 'communication', 'leadership'],
      OUTSIDE_HITTER: ['attacking', 'passing', 'serving'],
      MIDDLE_BLOCKER: ['blocking', 'attacking', 'timing'],
      OPPOSITE: ['attacking', 'blocking', 'serving'],
      LIBERO: ['passing', 'defense', 'communication'],
      DEFENSIVE_SPECIALIST: ['defense', 'passing', 'coverage'],
    };

    if (criticalSkills[position].some(critical => skill.includes(critical))) {
      return 'high';
    }
    return skill.includes('mental') ? 'medium' : 'low';
  }

  /**
   * Estimate development times
   */
  private static estimateDevelopmentTimes(evaluation: PlayerEvaluation): Record<string, string> {
    // Based on skill gap and current level
    return {
      'Technical Skills': '3-6 months',
      'Physical Development': '6-12 months',
      'Mental Toughness': '2-4 months',
      'Position Mastery': '4-8 months',
    };
  }
}