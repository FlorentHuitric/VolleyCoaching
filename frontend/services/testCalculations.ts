/**
 * Test Calculations Service
 * 
 * Pure calculation functions for evaluation tests.
 * Used by test forms to compute metrics and ratings.
 */

import {
  VerticalJumpTest,
  SprintTest,
  AgilityTest,
  ServingAccuracyTest,
  PassingTest,
  SettingAccuracyTest,
  AttackingTest,
  BlockingTest,
  DefenseTest
} from '@/types/evaluation-tests';

type SkillRating = number;

// ============================================
// PHYSICAL TESTS CALCULATIONS
// ============================================

/**
 * Calculate vertical jump metrics
 */
export const calculateVerticalJumpMetrics = (test: VerticalJumpTest): {
  blockJump: number;
  approachJump: number;
  rating: SkillRating;
} => {
  const blockJump = test.blockJumpReach - test.standingReach;
  const approachJump = test.approachJumpReach - test.standingReach;

  // Rating scale based on approach jump (international standards)
  // Elite: 90+ cm, Advanced: 75-89, Good: 60-74, Average: 45-59, Below: <45
  let rating: SkillRating = 5;
  if (approachJump >= 90) rating = 10;
  else if (approachJump >= 85) rating = 9;
  else if (approachJump >= 80) rating = 8;
  else if (approachJump >= 75) rating = 7;
  else if (approachJump >= 70) rating = 6;
  else if (approachJump >= 60) rating = 5;
  else if (approachJump >= 50) rating = 4;
  else if (approachJump >= 40) rating = 3;
  else if (approachJump >= 30) rating = 2;
  else rating = 1;

  return { blockJump, approachJump, rating };
};

/**
 * Calculate sprint performance rating
 */
export const calculateSprintRating = (test: SprintTest): SkillRating => {
  // Rating based on 20m sprint (international standards)
  // Elite: <3.0s, Advanced: 3.0-3.2, Good: 3.2-3.5, Average: 3.5-4.0, Below: >4.0
  const time = test.sprint20m;

  if (time < 3.0) return 10;
  if (time < 3.1) return 9;
  if (time < 3.2) return 8;
  if (time < 3.3) return 7;
  if (time < 3.5) return 6;
  if (time < 3.7) return 5;
  if (time < 4.0) return 4;
  if (time < 4.3) return 3;
  if (time < 4.6) return 2;
  return 1;
};

/**
 * Calculate agility rating
 */
export const calculateAgilityRating = (test: AgilityTest): SkillRating => {
  // T-Test standards
  // Elite: <9.0s, Advanced: 9.0-9.5, Good: 9.5-10.5, Average: 10.5-11.5, Below: >11.5
  const time = test.tTestTime;

  if (time < 9.0) return 10;
  if (time < 9.3) return 9;
  if (time < 9.6) return 8;
  if (time < 10.0) return 7;
  if (time < 10.5) return 6;
  if (time < 11.0) return 5;
  if (time < 11.5) return 4;
  if (time < 12.0) return 3;
  if (time < 12.5) return 2;
  return 1;
};

// ============================================
// TECHNICAL TESTS CALCULATIONS
// ============================================

/**
 * Calculate serving accuracy metrics
 */
export const calculateServingMetrics = (test: ServingAccuracyTest): {
  accuracy: number;
  aceRate: number;
  errorRate: number;
  consistency: number;
  rating: SkillRating;
} => {
  const totalHits = test.zoneTargets.reduce((sum, zone) => sum + zone.hits, 0);
  const totalAces = test.zoneTargets.reduce((sum, zone) => sum + zone.aces, 0);
  const totalErrors = test.zoneTargets.reduce((sum, zone) => sum + zone.errors, 0);

  const accuracy = (totalHits / test.totalServes) * 100;
  const aceRate = (totalAces / test.totalServes) * 100;
  const errorRate = (totalErrors / test.totalServes) * 100;

  // Consistency based on variance across zones
  const zoneHitRates = test.zoneTargets.map(z => z.attempts > 0 ? z.hits / z.attempts : 0);
  const avgHitRate = zoneHitRates.reduce((a, b) => a + b, 0) / zoneHitRates.length;
  const variance = zoneHitRates.reduce((sum, rate) => sum + Math.pow(rate - avgHitRate, 2), 0) / zoneHitRates.length;
  const consistency = Math.max(0, 100 - (variance * 100));

  // Rating: weighted score (50% accuracy, 30% ace rate, 20% low errors)
  const accuracyScore = (accuracy / 100) * 5;
  const aceScore = (aceRate / 20) * 3; // 20% ace rate = max score
  const errorScore = Math.max(0, 2 - (errorRate / 10) * 2); // <10% errors = max score

  const totalScore = accuracyScore + aceScore + errorScore;
  const rating = Math.max(1, Math.min(10, Math.round(totalScore))) as SkillRating;

  return { accuracy, aceRate, errorRate, consistency, rating };
};

/**
 * Calculate passing rating (0-3 FIVB scale)
 */
export const calculatePassingMetrics = (test: PassingTest): {
  avgRating: number;
  perfectPassRate: number;
  errorRate: number;
  efficiency: number;
  rating: SkillRating;
} => {
  const totalPasses = test.passRatings.length;
  const sumRatings = test.passRatings.reduce((sum: number, r: number) => sum + r, 0);
  const perfectPasses = test.passRatings.filter(r => r === 3).length;
  const errors = test.passRatings.filter(r => r === 0).length;

  const avgRating = sumRatings / totalPasses;
  const perfectPassRate = (perfectPasses / totalPasses) * 100;
  const errorRate = (errors / totalPasses) * 100;

  // Efficiency: weighted score
  const efficiency = ((perfectPasses * 3 + test.passRatings.filter(r => r === 2).length * 2 +
    test.passRatings.filter(r => r === 1).length * 1) / (totalPasses * 3)) * 100;

  // Convert 0-3 scale to 1-10 rating
  const rating = Math.max(1, Math.min(10, Math.round(avgRating * 3.33))) as SkillRating;

  return { avgRating, perfectPassRate, errorRate, efficiency, rating };
};

/**
 * Calculate setting accuracy metrics
 */
export const calculateSettingMetrics = (test: SettingAccuracyTest): {
  accuracy: number;
  consistency: number;
  efficiency: number;
  rating: SkillRating;
} => {
  const totalExcellent = test.zoneAccuracy.reduce((sum, z) => sum + z.excellent, 0);
  const totalGood = test.zoneAccuracy.reduce((sum, z) => sum + z.good, 0);
  const totalPoor = test.zoneAccuracy.reduce((sum, z) => sum + z.poor, 0);
  const totalErrors = test.zoneAccuracy.reduce((sum, z) => sum + z.errors, 0);

  const accuracy = ((totalExcellent + totalGood) / test.totalSets) * 100;

  // Consistency: ratio of excellent to total good sets
  const consistency = (totalExcellent / (totalExcellent + totalGood + 0.1)) * 100;

  // Efficiency: weighted score
  const efficiency = ((totalExcellent * 3 + totalGood * 2 + totalPoor * 1) / (test.totalSets * 3)) * 100;

  // Rating based on good set rate
  const goodSetRate = (test.grades.good / test.totalSets) * 100;
  const rating = Math.max(1, Math.min(10, Math.round((goodSetRate / 10)))) as SkillRating;

  return { accuracy, consistency, efficiency, rating };
};

/**
 * Calculate attacking metrics
 */
export const calculateAttackingMetrics = (test: AttackingTest): {
  killRate: number;
  errorRate: number;
  efficiency: number;
  accuracy: number;
  rating: SkillRating;
} => {
  const killRate = (test.kills / test.totalAttacks) * 100;
  const errorRate = (test.errors / test.totalAttacks) * 100;

  // Efficiency: (Kills - Errors) / Total
  const efficiency = ((test.kills - test.errors) / test.totalAttacks) * 100;

  // Target accuracy
  const totalTargetAttempts = test.zoneAccuracy.reduce((sum, z) => sum + z.attempts, 0);
  const totalTargetSuccess = test.zoneAccuracy.reduce((sum, z) => sum + z.successes, 0);
  const accuracy = totalTargetAttempts > 0 ? (totalTargetSuccess / totalTargetAttempts) * 100 : 0;

  // Rating: weighted (40% kill rate, 40% efficiency, 20% accuracy)
  const killScore = (killRate / 50) * 4; // 50% kill rate = max
  const efficiencyScore = (Math.max(0, efficiency + 30) / 60) * 4; // 30% efficiency = max
  const accuracyScore = (accuracy / 100) * 2;

  const totalScore = killScore + efficiencyScore + accuracyScore;
  const rating = Math.max(1, Math.min(10, Math.round(totalScore))) as SkillRating;

  return { killRate, errorRate, efficiency, accuracy, rating };
};

/**
 * Calculate blocking metrics
 */
export const calculateBlockingMetrics = (test: BlockingTest): {
  stuffRate: number;
  touchRate: number;
  avgTiming: number;
  avgHandPosition: number;
  avgPenetration: number;
  efficiency: number;
  rating: SkillRating;
} => {
  const stuffRate = (test.stuff / test.totalAttempts) * 100;
  const touchRate = ((test.stuff + test.touch) / test.totalAttempts) * 100;

  const avgTiming = test.timingRatings.reduce((a, b) => a + b, 0) / test.timingRatings.length;
  const avgHandPosition = test.handPositionRatings.reduce((a, b) => a + b, 0) / test.handPositionRatings.length;
  const avgPenetration = test.penetrationRatings.reduce((a, b) => a + b, 0) / test.penetrationRatings.length;

  // Efficiency: weighted score
  const efficiency = (stuffRate * 0.4 + touchRate * 0.3 + avgTiming * 10 + avgHandPosition * 10 + avgPenetration * 10) / 7;

  const rating = Math.max(1, Math.min(10, Math.round(efficiency / 10))) as SkillRating;

  return {
    stuffRate,
    touchRate,
    avgTiming,
    avgHandPosition,
    avgPenetration,
    efficiency,
    rating
  };
};

/**
 * Calculate defense metrics
 */
export const calculateDefenseMetrics = (test: DefenseTest): {
  avgRating: number;
  perfectDigRate: number;
  errorRate: number;
  rangeOfMotion: number;
  rating: SkillRating;
} => {
  const sumRatings = test.digRatings.reduce((a: number, b: number) => a + b, 0);
  const avgRating = sumRatings / test.digRatings.length;

  const perfectDigs = test.digRatings.filter(r => r === 3).length;
  const errors = test.digRatings.filter(r => r === 0).length;

  const perfectDigRate = (perfectDigs / test.digRatings.length) * 100;
  const errorRate = (errors / test.digRatings.length) * 100;

  // Range of motion: based on coverage zones
  const zonesWithSuccess = test.coverageZones.filter(z => z.successes > 0).length;
  const rangeOfMotion = (zonesWithSuccess / test.coverageZones.length) * 100;

  // Convert 0-3 scale to 1-10 rating
  const rating = Math.max(1, Math.min(10, Math.round(avgRating * 3.33))) as SkillRating;

  return {
    avgRating,
    perfectDigRate,
    errorRate,
    rangeOfMotion,
    rating
  };
};
