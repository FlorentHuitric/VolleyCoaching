/**
 * Professional Volleyball Evaluation System
 * Based on FIVB standards and international combine testing protocols
 */

export type TestCategory =
  | 'physical'
  | 'technical'
  | 'tactical'
  | 'mental';

export type TestDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite';

// ============================================
// PHYSICAL TESTS
// ============================================

export interface VerticalJumpTest {
  testId: 'vertical_jump';
  category: 'physical';

  // Measurements (in cm)
  standingReach: number;
  blockJumpReach: number;
  approachJumpReach: number;

  // Calculated values
  blockJumpHeight: number; // blockJumpReach - standingReach
  approachJumpHeight: number; // approachJumpReach - standingReach

  // Protocol: 3 attempts, best recorded
  attempts: {
    blockJumps: number[];
    approachJumps: number[];
  };
}

export interface SprintTest {
  testId: 'sprint';
  category: 'physical';

  // Times in seconds
  sprint10m: number;
  sprint20m: number;

  // Protocol: 2 attempts, best recorded
  attempts: {
    sprint10m: number[];
    sprint20m: number[];
  };
}

export interface AgilityTest {
  testId: 'agility';
  category: 'physical';

  // T-Test or Pro-Agility Shuttle (seconds)
  tTestTime: number;

  // 5-10-5 Shuttle (seconds)
  proAgilityTime?: number;

  attempts: number[];
}

export interface EnduranceTest {
  testId: 'endurance';
  category: 'physical';

  // Beep test / Yo-Yo test
  level: number;
  shuttle: number;
  vo2max?: number; // Estimated

  // Or timed run
  cooper12MinDistance?: number; // meters
}

// ============================================
// TECHNICAL TESTS - SERVING
// ============================================

export interface ServingAccuracyTest {
  testId: 'serving_accuracy';
  category: 'technical';
  skill: 'serving';

  // 6 zones on court, 10 serves per session
  totalServes: number;

  // Zone targeting (zones 1-6)
  zoneTargets: {
    zone: 1 | 2 | 3 | 4 | 5 | 6;
    attempts: number;
    hits: number; // Successful target hits
    aces: number;
    errors: number;
  }[];

  // Serve types
  serveTypes: {
    float: number;
    jump: number;
    topspin: number;
  };

  // Calculated metrics
  accuracy: number; // % of serves in target
  aceRate: number; // % of aces
  errorRate: number; // % of errors
  consistency: number; // Based on variation
}

export interface ServingPowerTest {
  testId: 'serving_power';
  category: 'physical';
  skill: 'serving';

  // Radar gun measurement (km/h)
  speeds: number[];
  maxSpeed: number;
  avgSpeed: number;
}

// ============================================
// TECHNICAL TESTS - PASSING/RECEPTION
// ============================================

export interface PassingTest {
  testId: 'passing';
  category: 'technical';
  skill: 'passing';

  // 20-30 passes with varying difficulty
  totalPasses: number;

  // Rating scale 0-3 (FIVB standard)
  // 3 = Perfect (all options for setter)
  // 2 = Good (setter has 2 options)
  // 1 = Playable (setter has 1 option)
  // 0 = Error (unplayable)
  passRatings: (0 | 1 | 2 | 3)[];

  // Pass types received
  passTypes: {
    floatServe: number[];
    jumpServe: number[];
    topspin: number[];
  };

  // Calculated
  avgRating: number; // Should be 2.0+ for good performance
  perfectPassRate: number; // % of 3s
  errorRate: number; // % of 0s
  efficiency: number; // Weighted score
}

// ============================================
// TECHNICAL TESTS - SETTING
// ============================================

export interface SettingAccuracyTest {
  testId: 'setting_accuracy';
  category: 'technical';
  skill: 'setting';

  totalSets: number;

  // Target zones for hitters
  // Front left (zone 4), Front center (zone 3), Front right (zone 2)
  // Back row (zones 1, 6, 5)
  zoneAccuracy: {
    zone: 1 | 2 | 3 | 4 | 5 | 6;
    attempts: number;
    excellent: number; // Perfect height/distance
    good: number; // Hittable but not perfect
    poor: number; // Barely hittable
    errors: number; // Unhittable
  }[];

  // Set types
  setTypes: {
    high: number; // Standard high ball
    quick: number; // 1st tempo
    slide: number; // Behind setter
    back: number; // Backset
  };

  // Grading (Joe Trinsey system)
  // E# = Good set
  // E+ = Too far off net
  // E! = Too far in
  // E- = Too wide
  // E/ = Too tight
  // E= = Error
  grades: {
    good: number;
    tooFarOff: number;
    tooFarIn: number;
    tooWide: number;
    tooTight: number;
    error: number;
  };

  // Calculated
  accuracy: number;
  consistency: number;
  efficiency: number;
}

export interface SettingConsistencyTest {
  testId: 'setting_consistency';
  category: 'technical';
  skill: 'setting';

  // 30 consecutive sets to same target
  sets: {
    height: number; // cm from net
    distance: number; // cm from sideline
    timing: number; // seconds from pass
  }[];

  // Calculated variance
  heightVariance: number;
  distanceVariance: number;
  avgTiming: number;
  consistency: number; // Lower variance = better
}

// ============================================
// TECHNICAL TESTS - ATTACKING
// ============================================

export interface AttackingTest {
  testId: 'attacking';
  category: 'technical';
  skill: 'attacking';

  totalAttacks: number;

  // Attack outcomes
  kills: number; // Successful attacks (point scored)
  errors: number; // Out, net, block error
  blocked: number; // Blocked by opponent
  inPlay: number; // Defended but in play

  // Target zones hit (1-6)
  zoneAccuracy: {
    zone: 1 | 2 | 3 | 4 | 5 | 6;
    attempts: number;
    successes: number;
  }[];

  // Attack types
  attackTypes: {
    hard: number; // Power attack
    tip: number; // Soft touch
    roll: number; // Roll shot
    tooling: number; // Off block
  };

  // Shot selection
  line: number; // Down the line
  angle: number; // Cross court
  middle: number; // To middle

  // Calculated
  killRate: number; // % of kills
  errorRate: number; // % of errors
  efficiency: number; // (K - E) / Total
  accuracy: number; // % hitting target zones
}

export interface AttackingPowerTest {
  testId: 'attacking_power';
  category: 'physical';
  skill: 'attacking';

  // Swing speed (km/h)
  speeds: number[];
  maxSpeed: number;
  avgSpeed: number;

  // Contact height (cm)
  contactHeights: number[];
  maxContactHeight: number;
  avgContactHeight: number;
}

// ============================================
// TECHNICAL TESTS - BLOCKING
// ============================================

export interface BlockingTest {
  testId: 'blocking';
  category: 'technical';
  skill: 'blocking';

  totalAttempts: number;

  // Block outcomes
  stuff: number; // Ball blocked to floor (point)
  touch: number; // Touched but not stopped
  noTouch: number; // No contact

  // Block types
  solo: number;
  double: number;
  triple: number;

  // Timing assessment (by evaluator)
  timingRatings: (1 | 2 | 3 | 4 | 5)[]; // 1=too early, 5=perfect

  // Hand position (by evaluator)
  handPositionRatings: (1 | 2 | 3 | 4 | 5)[]; // 1=poor, 5=excellent

  // Penetration over net
  penetrationRatings: (1 | 2 | 3 | 4 | 5)[];

  // Calculated
  stuffRate: number; // % of stuffs
  touchRate: number; // % of touches
  avgTiming: number;
  avgHandPosition: number;
  avgPenetration: number;
  efficiency: number;
}

// ============================================
// TECHNICAL TESTS - DEFENSE/DIGGING
// ============================================

export interface DefenseTest {
  testId: 'defense';
  category: 'technical';
  skill: 'defense';

  totalAttempts: number;

  // Dig outcomes (0-3 scale like passing)
  digRatings: (0 | 1 | 2 | 3)[];

  // Attack types defended
  attackTypes: {
    hard: number[];
    tip: number[];
    roll: number[];
  };

  // Court coverage
  coverageZones: {
    zone: 1 | 2 | 3 | 4 | 5 | 6;
    attempts: number;
    successes: number;
  }[];

  // Calculated
  avgRating: number;
  perfectDigRate: number; // % of 3s
  errorRate: number; // % of 0s
  rangeOfMotion: number; // Based on coverage
  anticipation: number; // Based on timing assessment
}

// ============================================
// TACTICAL TESTS
// ============================================

export interface GameSituationTest {
  testId: 'game_situation';
  category: 'tactical';

  // Decision making scenarios (scored by coach)
  scenarios: {
    situation: string;
    correctDecision: boolean;
    responseTime: number; // seconds
    reasoning: string;
  }[];

  // Court awareness assessment
  awarenessRating: 1 | 2 | 3 | 4 | 5;

  // Communication
  communicationRating: 1 | 2 | 3 | 4 | 5;

  // Adaptability
  adaptabilityRating: 1 | 2 | 3 | 4 | 5;
}

// ============================================
// MENTAL TESTS
// ============================================

export interface MentalToughnessTest {
  testId: 'mental_toughness';
  category: 'mental';

  // Pressure situations
  pressureSituations: {
    situation: string;
    performanceRating: 1 | 2 | 3 | 4 | 5;
    emotionalControl: 1 | 2 | 3 | 4 | 5;
    focusLevel: 1 | 2 | 3 | 4 | 5;
  }[];

  // Recovery from errors
  errorRecoveryRating: 1 | 2 | 3 | 4 | 5;

  // Leadership
  leadershipRating: 1 | 2 | 3 | 4 | 5;

  // Coachability
  coachabilityRating: 1 | 2 | 3 | 4 | 5;
}

export interface GameIntelligenceTest {
  testId: 'game_intelligence';
  category: 'mental';

  // Video analysis (5 clips)
  videoAnalysis: {
    clipId: string;
    playerAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    responseTime: number; // seconds
  }[];

  // Tactical questions (10 questions)
  tacticalQuestions: {
    questionId: string;
    playerAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    responseTime: number; // seconds
  }[];

  // Court awareness rating by coach
  courtAwarenessRating: 1 | 2 | 3 | 4 | 5;

  // Vision 3D rating
  visionRating: 1 | 2 | 3 | 4 | 5;
}

export interface LeadershipTest {
  testId: 'leadership';
  category: 'mental';

  // Peer ratings (by teammates)
  peerRatings: {
    dimension: string; // motivation, communication, example, accountability, trust
    rating: 1 | 2 | 3 | 4 | 5;
  }[];

  // Coach observations
  coachObservations: {
    item: string; // vocal_leadership, body_language, tactical_guidance, etc.
    rating: 1 | 2 | 3 | 4 | 5;
  }[];

  // Leadership decision scenarios
  scenarios: {
    scenarioId: string;
    playerChoice: number;
    correctChoice: number;
    isCorrect: boolean;
  }[];
}

export interface CommunicationTest {
  testId: 'communication';
  category: 'mental';

  // Verbal communication metrics (1-5 scale)
  verbalCommunication: {
    clarity: 1 | 2 | 3 | 4 | 5;
    volume: 1 | 2 | 3 | 4 | 5;
    timing: 1 | 2 | 3 | 4 | 5;
    positivity: 1 | 2 | 3 | 4 | 5;
  };

  // Non-verbal communication metrics (1-5 scale)
  nonVerbalCommunication: {
    bodyLanguage: 1 | 2 | 3 | 4 | 5;
    eyeContact: 1 | 2 | 3 | 4 | 5;
    gestures: 1 | 2 | 3 | 4 | 5;
    facialExpressions: 1 | 2 | 3 | 4 | 5;
  };

  // Active listening metrics (1-5 scale)
  activeListening: {
    comprehension: 1 | 2 | 3 | 4 | 5;
    retention: 1 | 2 | 3 | 4 | 5;
    feedback: 1 | 2 | 3 | 4 | 5;
    adaptation: 1 | 2 | 3 | 4 | 5;
  };

  // Communication scenarios with conflict resolution
  scenarios: {
    scenarioId: string;
    playerChoice: number;
    correctChoice: number;
    isCorrect: boolean;
  }[];
}

// ============================================
// COMPLETE EVALUATION SESSION
// ============================================

export type EvaluationTest =
  | VerticalJumpTest
  | SprintTest
  | AgilityTest
  | EnduranceTest
  | ServingAccuracyTest
  | ServingPowerTest
  | PassingTest
  | SettingAccuracyTest
  | SettingConsistencyTest
  | AttackingTest
  | AttackingPowerTest
  | BlockingTest
  | DefenseTest
  | GameSituationTest
  | MentalToughnessTest
  | GameIntelligenceTest
  | LeadershipTest
  | CommunicationTest;

export interface EvaluationSession {
  id: string;
  playerId: string;
  evaluatorId: string;

  date: Date;
  location: string;
  duration: number; // minutes

  // Test battery selected
  tests: EvaluationTest[];

  // Overall assessment by coach
  coachNotes: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];

  // Status
  status: 'draft' | 'in_progress' | 'completed';
  completedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TEST TEMPLATES/BATTERIES
// ============================================

export interface TestBattery {
  id: string;
  name: string;
  description: string;
  difficulty: TestDifficulty;

  // Estimated time
  estimatedDuration: number; // minutes

  // Required tests
  requiredTests: EvaluationTest['testId'][];

  // Recommended for positions
  positions: string[];

  // Use cases
  useCase: 'initial_assessment' | 'progress_check' | 'season_start' | 'tryout' | 'injury_recovery';
}

// Predefined test batteries
export const TEST_BATTERIES: TestBattery[] = [
  {
    id: 'quick_assessment',
    name: 'Évaluation Rapide',
    description: 'Évaluation rapide pour tryouts ou suivi régulier',
    difficulty: 'beginner',
    estimatedDuration: 20,
    requiredTests: ['vertical_jump', 'serving_accuracy', 'passing'],
    positions: ['ALL'],
    useCase: 'tryout'
  },
  {
    id: 'complete_physical',
    name: 'Évaluation Physique Complète',
    description: 'Batterie complète de tests physiques pour évaluer la condition athlétique',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    requiredTests: ['vertical_jump', 'sprint', 'agility', 'endurance'],
    positions: ['ALL'],
    useCase: 'initial_assessment'
  },
  {
    id: 'setter_evaluation',
    name: 'Évaluation Passeur',
    description: 'Tests spécifiques pour évaluer les compétences de passeur',
    difficulty: 'advanced',
    estimatedDuration: 60,
    requiredTests: ['setting_accuracy', 'setting_consistency', 'vertical_jump', 'game_situation'],
    positions: ['SETTER'],
    useCase: 'initial_assessment'
  },
  {
    id: 'attacker_evaluation',
    name: 'Évaluation Attaquant',
    description: 'Tests pour évaluer les compétences offensives',
    difficulty: 'advanced',
    estimatedDuration: 60,
    requiredTests: ['attacking', 'attacking_power', 'vertical_jump', 'sprint'],
    positions: ['OUTSIDE_HITTER', 'OPPOSITE', 'MIDDLE_BLOCKER'],
    useCase: 'initial_assessment'
  },
  {
    id: 'libero_evaluation',
    name: 'Évaluation Libéro',
    description: 'Tests pour évaluer les compétences défensives',
    difficulty: 'advanced',
    estimatedDuration: 50,
    requiredTests: ['passing', 'defense', 'agility', 'game_situation'],
    positions: ['LIBERO', 'DEFENSIVE_SPECIALIST'],
    useCase: 'initial_assessment'
  },
  // Phase 2 - Mental Assessment Battery
  {
    id: 'mental_assessment',
    name: 'Évaluation Mentale Complète',
    description: 'Batterie complète pour évaluer la dimension mentale (résilience, intelligence de jeu, leadership, communication)',
    difficulty: 'advanced',
    estimatedDuration: 105,
    requiredTests: ['mental_toughness', 'game_intelligence', 'leadership', 'communication'],
    positions: ['ALL'],
    useCase: 'season_start'
  },
  // Phase 3 - Pro Assessment Battery (COMPLETE)
  {
    id: 'pro_assessment',
    name: 'Évaluation Professionnelle Complète',
    description: 'Batterie exhaustive pour évaluation professionnelle : physique, technique, tactique, et mentale. Adaptée selon la position du joueur.',
    difficulty: 'elite',
    estimatedDuration: 120,
    requiredTests: [
      // Physical (4 tests - 45 min)
      'vertical_jump',
      'sprint',
      'agility',
      'endurance',
      // Technical - Position dependent (5-6 tests - 50 min)
      'serving_accuracy',
      'passing',
      'attacking',
      'blocking',
      'defense',
      // Tactical (1 test - 10 min)
      'game_situation',
      // Mental (2 tests prioritaires - 15 min)
      'mental_toughness',
      'game_intelligence'
    ],
    positions: ['ALL'],
    useCase: 'initial_assessment'
  }
];
