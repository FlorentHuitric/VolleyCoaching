/**
 * Phase 1 & 2 Test Calculations
 * Phase 1 tests:
 * - Setting Consistency
 * - Attacking Power
 * - Game Situation Decision Making
 * 
 * Phase 2 tests (Mental evaluations):
 * - Mental Toughness
 * - Game Intelligence
 * - Leadership
 * - Communication
 */

type SkillRating = number;

/**
 * Calculate setting consistency metrics
 * Measures variance in height, distance, and timing over 30-50 sets
 */
export const calculateSettingConsistencyMetrics = (test: any): {
  heightVariance: number;
  distanceVariance: number;
  consistency: number;
  tempoControl: number;
  precision: number;
  rating: SkillRating;
} => {
  const sets = test.sets || [];
  if (sets.length === 0) return { heightVariance: 0, distanceVariance: 0, consistency: 0, tempoControl: 0, precision: 0, rating: 1 };

  // Calculate average values
  const avgHeight = sets.reduce((sum: number, s: any) => sum + s.height, 0) / sets.length;
  const avgDistance = sets.reduce((sum: number, s: any) => sum + s.distance, 0) / sets.length;
  const avgTiming = sets.reduce((sum: number, s: any) => sum + s.timing, 0) / sets.length;

  // Calculate variance (standard deviation)
  const heightVariance = Math.sqrt(
    sets.reduce((sum: number, s: any) => sum + Math.pow(s.height - avgHeight, 2), 0) / sets.length
  );
  const distanceVariance = Math.sqrt(
    sets.reduce((sum: number, s: any) => sum + Math.pow(s.distance - avgDistance, 2), 0) / sets.length
  );

  // Consistency score: Lower variance = better (inverted scale)
  // Elite: <10cm variance, Advanced: 10-20cm, Good: 20-30cm
  const avgVariance = (heightVariance + distanceVariance) / 2;
  let consistencyScore = 100;
  if (avgVariance < 10) consistencyScore = 100;
  else if (avgVariance < 15) consistencyScore = 90;
  else if (avgVariance < 20) consistencyScore = 80;
  else if (avgVariance < 25) consistencyScore = 70;
  else if (avgVariance < 30) consistencyScore = 60;
  else if (avgVariance < 40) consistencyScore = 50;
  else consistencyScore = 40;

  // Tempo control: Fast timing (0.3-0.6s) = better
  const tempoControl = avgTiming < 0.4 ? 10 : avgTiming < 0.5 ? 9 : avgTiming < 0.6 ? 8 : avgTiming < 0.7 ? 7 : 6;

  // Precision: Combination of variance and consistency
  const precision = Math.round((consistencyScore / 10)) as SkillRating;

  const rating = Math.max(1, Math.min(10, precision)) as SkillRating;

  return {
    heightVariance,
    distanceVariance,
    consistency: consistencyScore,
    tempoControl,
    precision,
    rating
  };
};

/**
 * Calculate attacking power metrics
 * Measures swing velocity (km/h) and contact height (cm)
 */
export const calculateAttackingPowerMetrics = (test: any): {
  maxSpeed: number;
  avgSpeed: number;
  maxContactHeight: number;
  avgContactHeight: number;
  powerRating: SkillRating;
  rating: SkillRating;
} => {
  const speeds = test.speeds || [];
  const contactHeights = test.contactHeights || [];

  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
  const avgSpeed = speeds.length > 0 ? speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length : 0;
  const maxContactHeight = contactHeights.length > 0 ? Math.max(...contactHeights) : 0;
  const avgContactHeight = contactHeights.length > 0 ? contactHeights.reduce((a: number, b: number) => a + b, 0) / contactHeights.length : 0;

  // Power rating based on swing velocity
  // Elite: 100+ km/h, Advanced: 85-99, Good: 70-84, Average: 55-69
  let powerRating: SkillRating = 5;
  if (maxSpeed >= 100) powerRating = 10;
  else if (maxSpeed >= 95) powerRating = 9;
  else if (maxSpeed >= 90) powerRating = 8;
  else if (maxSpeed >= 85) powerRating = 7;
  else if (maxSpeed >= 75) powerRating = 6;
  else if (maxSpeed >= 65) powerRating = 5;
  else if (maxSpeed >= 55) powerRating = 4;
  else if (maxSpeed >= 45) powerRating = 3;
  else if (maxSpeed >= 35) powerRating = 2;
  else powerRating = 1;

  return {
    maxSpeed,
    avgSpeed,
    maxContactHeight,
    avgContactHeight,
    powerRating,
    rating: powerRating
  };
};

/**
 * Calculate game situation metrics
 * Evaluates decision-making, awareness, and tactical understanding
 */
export const calculateGameSituationMetrics = (test: any): {
  correctDecisionRate: number;
  avgResponseTime: number;
  awarenessRating: number;
  decisionRating: SkillRating;
  rating: SkillRating;
} => {
  const scenarios = test.scenarios || [];
  if (scenarios.length === 0) return { correctDecisionRate: 0, avgResponseTime: 0, awarenessRating: 0, decisionRating: 1, rating: 1 };

  const correctDecisions = scenarios.filter((s: any) => s.correctDecision).length;
  const correctDecisionRate = (correctDecisions / scenarios.length) * 100;

  const avgResponseTime = scenarios.reduce((sum: number, s: any) => sum + s.responseTime, 0) / scenarios.length;

  const awarenessRating = test.awarenessRating || 3;

  // Decision rating: 90%+ = Elite, 80-89% = Advanced, 70-79% = Good
  let decisionRating: SkillRating = 5;
  if (correctDecisionRate >= 90) decisionRating = 10;
  else if (correctDecisionRate >= 85) decisionRating = 9;
  else if (correctDecisionRate >= 80) decisionRating = 8;
  else if (correctDecisionRate >= 75) decisionRating = 7;
  else if (correctDecisionRate >= 70) decisionRating = 6;
  else if (correctDecisionRate >= 60) decisionRating = 5;
  else if (correctDecisionRate >= 50) decisionRating = 4;
  else if (correctDecisionRate >= 40) decisionRating = 3;
  else if (correctDecisionRate >= 30) decisionRating = 2;
  else decisionRating = 1;

  return {
    correctDecisionRate,
    avgResponseTime,
    awarenessRating,
    decisionRating,
    rating: decisionRating
  };
};

/**
 * Calculate mental toughness metrics - PHASE 2
 * Measures performance under pressure, emotional control, and recovery time
 */
export const calculateMentalToughnessMetrics = (test: any): {
  averagePerformance: number;
  averageRecoveryTime: number;
  emotionalControl: number;
  mentalToughnessRating: SkillRating;
  rating: SkillRating;
} => {
  const scenarios = test.scenarios || [];
  if (scenarios.length === 0) {
    return {
      averagePerformance: 0,
      averageRecoveryTime: 0,
      emotionalControl: 0,
      mentalToughnessRating: 1,
      rating: 1
    };
  }

  // Calculate averages
  const avgPerformance = scenarios.reduce((sum: number, s: any) => sum + s.performanceRating, 0) / scenarios.length;
  const avgRecoveryTime = scenarios.reduce((sum: number, s: any) => sum + s.recoveryTime, 0) / scenarios.length;
  const emotionalControl = test.overallEmotionalControl || 3;

  // Rating based on standards
  // Elite: Performance >4.0, Recovery <30s, Control >4.0
  // Advanced: Performance 3.5-4.0, Recovery 30-60s, Control 3.5-4.0
  // Good: Performance 3.0-3.5, Recovery 60-90s, Control 3.0-3.5
  // Developing: Performance <3.0, Recovery >90s, Control <3.0
  let mentalToughnessRating: SkillRating = 1;

  if (avgPerformance >= 4.0 && avgRecoveryTime <= 30 && emotionalControl >= 4.0) {
    mentalToughnessRating = 10; // Elite
  } else if (avgPerformance >= 3.8 && avgRecoveryTime <= 40 && emotionalControl >= 3.8) {
    mentalToughnessRating = 9;
  } else if (avgPerformance >= 3.5 && avgRecoveryTime <= 60 && emotionalControl >= 3.5) {
    mentalToughnessRating = 8; // Advanced
  } else if (avgPerformance >= 3.2 && avgRecoveryTime <= 75 && emotionalControl >= 3.2) {
    mentalToughnessRating = 7;
  } else if (avgPerformance >= 3.0 && avgRecoveryTime <= 90 && emotionalControl >= 3.0) {
    mentalToughnessRating = 6; // Good
  } else if (avgPerformance >= 2.7 && avgRecoveryTime <= 105 && emotionalControl >= 2.7) {
    mentalToughnessRating = 5;
  } else if (avgPerformance >= 2.5 && avgRecoveryTime <= 120 && emotionalControl >= 2.5) {
    mentalToughnessRating = 4; // Developing
  } else if (avgPerformance >= 2.2) {
    mentalToughnessRating = 3;
  } else if (avgPerformance >= 2.0) {
    mentalToughnessRating = 2;
  } else {
    mentalToughnessRating = 1; // Needs Improvement
  }

  return {
    averagePerformance: parseFloat(avgPerformance.toFixed(2)),
    averageRecoveryTime: Math.round(avgRecoveryTime),
    emotionalControl,
    mentalToughnessRating,
    rating: mentalToughnessRating
  };
};

/**
 * Calculate game intelligence metrics - PHASE 2
 * Measures tactical understanding, video analysis skills, and court awareness
 */
export const calculateGameIntelligenceMetrics = (test: any): {
  videoScore: number;
  tacticalScore: number;
  totalScore: number;
  averageResponseTime: number;
  courtAwarenessRating: number;
  intelligenceRating: SkillRating;
  rating: SkillRating;
} => {
  const videoAnswers = test.videoAnswers || [];
  const tacticalAnswers = test.tacticalAnswers || [];
  
  if (videoAnswers.length === 0 || tacticalAnswers.length === 0) {
    return {
      videoScore: 0,
      tacticalScore: 0,
      totalScore: 0,
      averageResponseTime: 0,
      courtAwarenessRating: 0,
      intelligenceRating: 1,
      rating: 1
    };
  }

  // Calculate video analysis score
  const videoCorrect = videoAnswers.filter((v: any) => v.isCorrect).length;
  const videoScore = (videoCorrect / videoAnswers.length) * 100;
  const avgVideoTime = videoAnswers.reduce((sum: number, v: any) => sum + v.responseTime, 0) / videoAnswers.length;

  // Calculate tactical questions score
  const tacticalCorrect = tacticalAnswers.filter((t: any) => t.isCorrect).length;
  const tacticalScore = (tacticalCorrect / tacticalAnswers.length) * 100;
  const avgTacticalTime = tacticalAnswers.reduce((sum: number, t: any) => sum + t.responseTime, 0) / tacticalAnswers.length;

  // Total score (tactical weighted 60%, video 40%)
  const totalScore = (videoScore * 0.4) + (tacticalScore * 0.6);
  const avgResponseTime = (avgVideoTime + avgTacticalTime) / 2;
  const courtAwarenessRating = test.courtAwareness || 3;

  // Rating based on standards
  // Elite: Score >85%, Response time <20s, Awareness >4.0
  // Advanced: Score 75-85%, Response time 20-30s, Awareness 3.5-4.0
  // Good: Score 65-75%, Response time 30-45s, Awareness 3.0-3.5
  let intelligenceRating: SkillRating = 1;

  if (totalScore >= 85 && avgResponseTime <= 20 && courtAwarenessRating >= 4.0) {
    intelligenceRating = 10; // Elite
  } else if (totalScore >= 80 && avgResponseTime <= 25 && courtAwarenessRating >= 3.8) {
    intelligenceRating = 9;
  } else if (totalScore >= 75 && avgResponseTime <= 30 && courtAwarenessRating >= 3.5) {
    intelligenceRating = 8; // Advanced
  } else if (totalScore >= 70 && avgResponseTime <= 35 && courtAwarenessRating >= 3.2) {
    intelligenceRating = 7;
  } else if (totalScore >= 65 && avgResponseTime <= 45 && courtAwarenessRating >= 3.0) {
    intelligenceRating = 6; // Good
  } else if (totalScore >= 60) {
    intelligenceRating = 5;
  } else if (totalScore >= 55) {
    intelligenceRating = 4;
  } else if (totalScore >= 50) {
    intelligenceRating = 3;
  } else if (totalScore >= 40) {
    intelligenceRating = 2;
  } else {
    intelligenceRating = 1;
  }

  return {
    videoScore: parseFloat(videoScore.toFixed(1)),
    tacticalScore: parseFloat(tacticalScore.toFixed(1)),
    totalScore: parseFloat(totalScore.toFixed(1)),
    averageResponseTime: Math.round(avgResponseTime),
    courtAwarenessRating,
    intelligenceRating,
    rating: intelligenceRating
  };
};

/**
 * Calculate leadership metrics - PHASE 2
 * Measures leadership qualities through peer ratings, coach observations, and decision scenarios
 */
export const calculateLeadershipMetrics = (test: any): {
  peerAverage: number;
  coachAverage: number;
  scenarioScore: number;
  leadershipRating: SkillRating;
  rating: SkillRating;
} => {
  const peerRatings = test.peerRatings || [];
  const coachObservations = test.coachObservations || [];
  const scenarios = test.scenarios || [];

  if (peerRatings.length === 0 || coachObservations.length === 0 || scenarios.length === 0) {
    return {
      peerAverage: 0,
      coachAverage: 0,
      scenarioScore: 0,
      leadershipRating: 1,
      rating: 1
    };
  }

  // Calculate averages
  const peerAvg = peerRatings.reduce((sum: number, p: any) => sum + p.rating, 0) / peerRatings.length;
  const coachAvg = coachObservations.reduce((sum: number, o: any) => sum + o.rating, 0) / coachObservations.length;
  
  // Calculate scenario score
  const scenarioCorrect = scenarios.filter((s: any) => s.isCorrect).length;
  const scenarioScore = (scenarioCorrect / scenarios.length) * 100;

  // Rating based on standards
  // Elite: Peer >4.0, Coach >4.0, Scenarios >85%
  // Advanced: Peer 3.5-4.0, Coach 3.5-4.0, Scenarios 75-85%
  // Good: Peer 3.0-3.5, Coach 3.0-3.5, Scenarios 65-75%
  let leadershipRating: SkillRating = 1;

  if (peerAvg >= 4.0 && coachAvg >= 4.0 && scenarioScore >= 85) {
    leadershipRating = 10; // Elite
  } else if (peerAvg >= 3.8 && coachAvg >= 3.8 && scenarioScore >= 80) {
    leadershipRating = 9;
  } else if (peerAvg >= 3.5 && coachAvg >= 3.5 && scenarioScore >= 75) {
    leadershipRating = 8; // Advanced
  } else if (peerAvg >= 3.2 && coachAvg >= 3.2 && scenarioScore >= 70) {
    leadershipRating = 7;
  } else if (peerAvg >= 3.0 && coachAvg >= 3.0 && scenarioScore >= 65) {
    leadershipRating = 6; // Good
  } else if (peerAvg >= 2.7 && coachAvg >= 2.7 && scenarioScore >= 60) {
    leadershipRating = 5;
  } else if (peerAvg >= 2.5 && coachAvg >= 2.5 && scenarioScore >= 50) {
    leadershipRating = 4; // Developing
  } else if (peerAvg >= 2.2) {
    leadershipRating = 3;
  } else if (peerAvg >= 2.0) {
    leadershipRating = 2;
  } else {
    leadershipRating = 1;
  }

  return {
    peerAverage: parseFloat(peerAvg.toFixed(2)),
    coachAverage: parseFloat(coachAvg.toFixed(2)),
    scenarioScore: parseFloat(scenarioScore.toFixed(1)),
    leadershipRating,
    rating: leadershipRating
  };
};

/**
 * Calculate communication metrics - PHASE 2
 * Measures verbal, non-verbal, active listening skills and conflict resolution
 */
export const calculateCommunicationMetrics = (test: any): {
  verbalAverage: number;
  nonVerbalAverage: number;
  listeningAverage: number;
  conflictScore: number;
  overallAverage: number;
  communicationRating: SkillRating;
  rating: SkillRating;
} => {
  const verbal = test.verbal;
  const nonVerbal = test.nonVerbal;
  const listening = test.listening;
  const scenarios = test.scenarios || [];

  if (!verbal || !nonVerbal || !listening || scenarios.length === 0) {
    return {
      verbalAverage: 0,
      nonVerbalAverage: 0,
      listeningAverage: 0,
      conflictScore: 0,
      overallAverage: 0,
      communicationRating: 1,
      rating: 1
    };
  }

  // Calculate averages
  const verbalAvg = (verbal.clarity + verbal.volume + verbal.timing + verbal.positivity) / 4;
  const nonVerbalAvg = (nonVerbal.bodyLanguage + nonVerbal.eyeContact + nonVerbal.gestures + nonVerbal.facialExpressions) / 4;
  const listeningAvg = (listening.comprehension + listening.retention + listening.feedback + listening.adaptation) / 4;
  
  // Calculate conflict resolution score
  const conflictCorrect = scenarios.filter((s: any) => s.isCorrect).length;
  const conflictScore = (conflictCorrect / scenarios.length) * 100;

  // Overall average
  const overallAvg = (verbalAvg + nonVerbalAvg + listeningAvg) / 3;

  // Rating based on standards
  // Elite: Verbal >4.0, Non-verbal >4.0, Listening >4.0, Conflicts 100%
  // Advanced: Verbal 3.5-4.0, Non-verbal 3.5-4.0, Listening 3.5-4.0, Conflicts 50-100%
  // Good: Verbal 3.0-3.5, Non-verbal 3.0-3.5, Listening 3.0-3.5, Conflicts 50%
  let communicationRating: SkillRating = 1;

  if (verbalAvg >= 4.0 && nonVerbalAvg >= 4.0 && listeningAvg >= 4.0 && conflictScore === 100) {
    communicationRating = 10; // Elite
  } else if (verbalAvg >= 3.8 && nonVerbalAvg >= 3.8 && listeningAvg >= 3.8 && conflictScore >= 50) {
    communicationRating = 9;
  } else if (verbalAvg >= 3.5 && nonVerbalAvg >= 3.5 && listeningAvg >= 3.5 && conflictScore >= 50) {
    communicationRating = 8; // Advanced
  } else if (verbalAvg >= 3.2 && nonVerbalAvg >= 3.2 && listeningAvg >= 3.2) {
    communicationRating = 7;
  } else if (verbalAvg >= 3.0 && nonVerbalAvg >= 3.0 && listeningAvg >= 3.0 && conflictScore >= 50) {
    communicationRating = 6; // Good
  } else if (verbalAvg >= 2.7 && nonVerbalAvg >= 2.7) {
    communicationRating = 5;
  } else if (verbalAvg >= 2.5 && nonVerbalAvg >= 2.5) {
    communicationRating = 4; // Developing
  } else if (verbalAvg >= 2.2) {
    communicationRating = 3;
  } else if (verbalAvg >= 2.0) {
    communicationRating = 2;
  } else {
    communicationRating = 1;
  }

  return {
    verbalAverage: parseFloat(verbalAvg.toFixed(2)),
    nonVerbalAverage: parseFloat(nonVerbalAvg.toFixed(2)),
    listeningAverage: parseFloat(listeningAvg.toFixed(2)),
    conflictScore: parseFloat(conflictScore.toFixed(1)),
    overallAverage: parseFloat(overallAvg.toFixed(2)),
    communicationRating,
    rating: communicationRating
  };
};
