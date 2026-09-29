/**
 * 🏐 VolleyCoaching - Complete Database Seed
 *
 * This seed file populates ALL tables with professional realistic volleyball data.
 *
 * ARCHITECTURE:
 * - Players created WITHOUT stats (currentRating/currentTechnical/etc = null)
 * - EvaluationService.completeSession() updates Player stats automatically
 * - First evaluation: 100% copy to Player
 * - Second evaluation: 30%/70% blend with existing stats
 *
 * Run with: npx prisma db seed
 */

import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient, Role, OrgType, TeamLevel, Position, PlayerStatus, ContractLevel, ExerciseCategory, ExerciseDifficulty, ExerciseIntensity, SessionStatus, MetricType, PlanStatus, TestCategory } from '@prisma/client';
import { EvaluationService } from '../services/EvaluationService';
import * as bcrypt from 'bcryptjs';

// Initialize DI container
container.registerInstance(PrismaClient, new PrismaClient());
const prisma = container.resolve(PrismaClient);
const evaluationService = container.resolve(EvaluationService);

/**
 * Generate realistic complete technical skills data
 */
function generateTechnicalSkills(baseLevel: number, variance: number = 1.5): any {
  const randomize = (base: number) => Math.max(0, Math.min(10, base + (Math.random() * variance * 2 - variance)));

  return {
    serving: {
      power: randomize(baseLevel),
      accuracy: randomize(baseLevel),
      consistency: randomize(baseLevel - 0.5),
    },
    passing: {
      control: randomize(baseLevel),
      reception: randomize(baseLevel),
      positioning: randomize(baseLevel + 0.5),
    },
    setting: {
      tempo: randomize(baseLevel - 0.5),
      decision: randomize(baseLevel),
      precision: randomize(baseLevel),
    },
    attacking: {
      power: randomize(baseLevel + 0.5),
      variety: randomize(baseLevel),
      technique: randomize(baseLevel),
    },
    blocking: {
      timing: randomize(baseLevel),
      reading: randomize(baseLevel - 0.5),
      positioning: randomize(baseLevel),
    },
    defense: {
      digging: randomize(baseLevel),
      positioning: randomize(baseLevel + 0.5),
      anticipation: randomize(baseLevel),
    },
  };
}

/**
 * Generate realistic physical attributes
 */
function generatePhysicalAttributes(height: number, position: Position): any {
  const attackerPositions: Position[] = [Position.OUTSIDE_HITTER, Position.OPPOSITE, Position.MIDDLE_BLOCKER];
  const isAttacker = attackerPositions.includes(position);
  const isSetter = position === Position.SETTER;
  const isLibero = position === Position.LIBERO;

  return {
    measurements: {
      height: height,
      reach: height * 1.3, // Realistic reach
      weight: isLibero ? height * 0.38 : height * 0.42, // Realistic weight
      wingspan: height * 1.05, // Realistic wingspan
    },
    performance: {
      verticalJump: isAttacker ? 75 + Math.random() * 15 : 60 + Math.random() * 10,
      approachJump: isAttacker ? 95 + Math.random() * 20 : 75 + Math.random() * 15,
      acceleration: 2.5 + Math.random() * 0.5, // 15-foot sprint in seconds
      agility: 9 + Math.random() * 2, // T-test in seconds
      endurance: 45 + Math.random() * 10, // 300-yard shuttle
    },
    power: {
      swingVelocity: isAttacker ? 65 + Math.random() * 15 : 50 + Math.random() * 10,
      attackHeight: height + (isAttacker ? 95 + Math.random() * 20 : 75 + Math.random() * 15),
      blockHeight: height + (isAttacker ? 85 + Math.random() * 15 : 65 + Math.random() * 10),
      servePower: isSetter ? 55 + Math.random() * 10 : 60 + Math.random() * 15,
    },
    flexibility: {
      shoulderMobility: 7 + Math.random() * 2,
      hipMobility: 6.5 + Math.random() * 2,
      ankleFlexibility: 7 + Math.random() * 1.5,
      overallFlexibility: 7 + Math.random() * 2,
    },
  };
}

/**
 * Generate realistic mental attributes
 */
function generateMentalAttributes(experienceLevel: number, isLeader: boolean = false): any {
  const baseLevel = 5 + experienceLevel * 0.5;
  const leaderBonus = isLeader ? 1.5 : 0;
  const randomize = (base: number) => Math.max(0, Math.min(10, base + (Math.random() * 2 - 1)));

  return {
    gameIntelligence: {
      courtAwareness: randomize(baseLevel + 0.5),
      situationalUnderstanding: randomize(baseLevel),
      strategicThinking: randomize(baseLevel + (isLeader ? 1 : 0)),
      adaptability: randomize(baseLevel),
      gameFlow: randomize(baseLevel + 0.5),
    },
    communication: {
      verbal: randomize(baseLevel + leaderBonus),
      nonVerbal: randomize(baseLevel + 0.5),
      listening: randomize(baseLevel),
      teamDirection: randomize(baseLevel + leaderBonus),
      conflictResolution: randomize(baseLevel + (isLeader ? 1 : 0)),
    },
    leadership: {
      onCourtPresence: randomize(baseLevel + leaderBonus),
      motivating: randomize(baseLevel + leaderBonus),
      responsibility: randomize(baseLevel + 1),
      decisionMaking: randomize(baseLevel),
      roleModeling: randomize(baseLevel + leaderBonus),
    },
    mentalToughness: {
      resilience: randomize(baseLevel + 1),
      focus: randomize(baseLevel + 0.5),
      confidence: randomize(baseLevel),
      pressurePerformance: randomize(baseLevel),
      recovery: randomize(baseLevel + 0.5),
    },
    coachability: {
      receptiveness: randomize(baseLevel + 0.5),
      implementation: randomize(baseLevel),
      effort: randomize(baseLevel + 1),
      attitude: randomize(baseLevel + 0.5),
      growth: randomize(baseLevel),
    },
  };
}

/**
 * Calculate overall rating from technical/physical/mental stats
 */
function calculateOverallRating(technical: any, physical: any, mental: any): number {
  // Helper to sum numeric values
  const sum = (obj: any): number => Object.values(obj).reduce((a: number, b: any) => a + (b as number), 0);

  // Technical: average all skills (18 values)
  const technicalAvg = (
    sum(technical.serving) +
    sum(technical.passing) +
    sum(technical.setting) +
    sum(technical.attacking) +
    sum(technical.blocking) +
    sum(technical.defense)
  ) / 18;

  // Physical: normalize to 0-10 scale and average
  const physicalScore = (
    ((physical.performance.verticalJump / 90) * 10 +
    (physical.performance.approachJump / 115) * 10 +
    (10 - (physical.performance.acceleration / 3) * 10) +
    (10 - (physical.performance.agility / 11) * 10) +
    (10 - (physical.performance.endurance / 55) * 10) +
    (physical.power.swingVelocity / 80) * 10 +
    (physical.flexibility.shoulderMobility +
    physical.flexibility.hipMobility +
    physical.flexibility.ankleFlexibility +
    physical.flexibility.overallFlexibility) / 4) / 10
  );

  // Mental: average all attributes (25 values)
  const mentalAvg = (
    sum(mental.gameIntelligence) +
    sum(mental.communication) +
    sum(mental.leadership) +
    sum(mental.mentalToughness) +
    sum(mental.coachability)
  ) / 25;

  // Weighted average: Technical 50%, Physical 30%, Mental 20%
  return Number((technicalAvg * 0.5 + physicalScore * 0.3 + mentalAvg * 0.2).toFixed(1));
}

async function seed() {
  console.log('🏐 Starting VolleyCoaching database seed...\n');

  // ============================================
  // 1. ORGANIZATION
  // ============================================
  console.log('📊 Creating organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'VolleyCoaching Demo Club',
      type: OrgType.CLUB,
      country: 'France',
      logo: 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=200',
    },
  });
  console.log(`✅ Organization created: ${org.name}\n`);

  // ============================================
  // 2. USERS
  // ============================================
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@volleycoaching.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Sophie',
      lastName: 'Martin',
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      orgId: org.id,
    },
  });

  const coach1 = await prisma.user.create({
    data: {
      email: 'coach1@volleycoaching.com',
      username: 'coach_thomas',
      password: hashedPassword,
      firstName: 'Thomas',
      lastName: 'Dubois',
      role: Role.COACH,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      orgId: org.id,
    },
  });

  const coach2 = await prisma.user.create({
    data: {
      email: 'coach2@volleycoaching.com',
      username: 'coach_emma',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Lefebvre',
      role: Role.ASSISTANT_COACH,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      orgId: org.id,
    },
  });

  console.log(`✅ Created 3 users (1 admin, 2 coaches)\n`);

  // ============================================
  // 3. TEAMS
  // ============================================
  console.log('🏐 Creating teams...');
  const eliteTeam = await prisma.team.create({
    data: {
      name: 'Elite Squad',
      description: 'Premier league competitive team',
      level: TeamLevel.SENIOR,
      season: '2024-2025',
      avatar: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200',
      coachId: coach1.id,
      orgId: org.id,
    },
  });

  const juniorTeam = await prisma.team.create({
    data: {
      name: 'Junior Team',
      description: 'Development squad for young talents',
      level: TeamLevel.JUNIOR,
      season: '2024-2025',
      avatar: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=200',
      coachId: coach2.id,
      orgId: org.id,
    },
  });

  console.log(`✅ Created 2 teams: ${eliteTeam.name}, ${juniorTeam.name}\n`);

  // ============================================
  // 4. PLAYERS (NO STATS - will be filled by evaluations)
  // ============================================
  console.log('👤 Creating players (WITHOUT stats)...');

  const playerData = [
    // Elite Squad (7 players)
    { firstName: 'Lucas', lastName: 'Bernard', position: Position.SETTER, jersey: 1, height: 192, team: eliteTeam, contract: ContractLevel.STARTER, experience: 8 },
    { firstName: 'Alexandre', lastName: 'Rousseau', position: Position.OUTSIDE_HITTER, jersey: 4, height: 198, team: eliteTeam, contract: ContractLevel.STARTER, experience: 6 },
    { firstName: 'Maxime', lastName: 'Petit', position: Position.MIDDLE_BLOCKER, jersey: 12, height: 203, team: eliteTeam, contract: ContractLevel.STARTER, experience: 7 },
    { firstName: 'Antoine', lastName: 'Moreau', position: Position.OPPOSITE, jersey: 7, height: 196, team: eliteTeam, contract: ContractLevel.STARTER, experience: 5 },
    { firstName: 'Hugo', lastName: 'Simon', position: Position.LIBERO, jersey: 5, height: 178, team: eliteTeam, contract: ContractLevel.STARTER, experience: 6 },
    { firstName: 'Julien', lastName: 'Laurent', position: Position.OUTSIDE_HITTER, jersey: 8, height: 195, team: eliteTeam, contract: ContractLevel.ROTATION, experience: 4 },
    { firstName: 'Nicolas', lastName: 'Michel', position: Position.MIDDLE_BLOCKER, jersey: 14, height: 200, team: eliteTeam, contract: ContractLevel.ROTATION, experience: 4 },

    // Junior Team (5 players)
    { firstName: 'Pierre', lastName: 'Garcia', position: Position.SETTER, jersey: 3, height: 188, team: juniorTeam, contract: ContractLevel.DEVELOPMENT, experience: 2 },
    { firstName: 'Louis', lastName: 'Roux', position: Position.OUTSIDE_HITTER, jersey: 11, height: 193, team: juniorTeam, contract: ContractLevel.DEVELOPMENT, experience: 2 },
    { firstName: 'Gabriel', lastName: 'Morel', position: Position.MIDDLE_BLOCKER, jersey: 9, height: 199, team: juniorTeam, contract: ContractLevel.DEVELOPMENT, experience: 3 },
    { firstName: 'Arthur', lastName: 'Fournier', position: Position.OPPOSITE, jersey: 10, height: 191, team: juniorTeam, contract: ContractLevel.DEVELOPMENT, experience: 2 },
    { firstName: 'Théo', lastName: 'Girard', position: Position.LIBERO, jersey: 6, height: 175, team: juniorTeam, contract: ContractLevel.TRIAL, experience: 1 },
  ];

  const players = [];
  for (const data of playerData) {
    const player = await prisma.player.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(2000 - data.experience, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        nationality: 'France',
        email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@example.com`,
        phone: `+33 6 ${Math.floor(Math.random() * 90000000) + 10000000}`,
        avatar: `https://i.pravatar.cc/200?u=${data.firstName}${data.lastName}`,
        jerseyNumber: data.jersey,
        primaryPosition: data.position,
        dominantHand: Math.random() > 0.8 ? 'left' : 'right',
        yearsOfExperience: data.experience,
        height: data.height,
        weight: data.position === Position.LIBERO ? data.height * 0.38 : data.height * 0.42,
        status: PlayerStatus.ACTIVE,
        contractLevel: data.contract,
        teamId: data.team.id,
        orgId: org.id,
        // ⚠️ NO STATS - Leave undefined, will be filled by EvaluationService
        // Note: Don't set to null explicitly, just omit the fields
      },
    });
    players.push({ ...player, _height: data.height, _experience: data.experience, _contract: data.contract });
    console.log(`   ✅ ${player.firstName} ${player.lastName} - ${data.position} (#${data.jersey})`);
  }
  console.log(`✅ Created ${players.length} players\n`);

  // ============================================
  // 5. EXERCISE TAGS
  // ============================================
  console.log('🏷️  Creating exercise tags...');
  const tagNames = ['Warm-up', 'Technical', 'Tactical', 'Physical', 'Serving', 'Passing', 'Setting', 'Attacking', 'Blocking', 'Defense'];
  const tags = [];

  for (const name of tagNames) {
    const tag = await prisma.exerciseTag.create({
      data: {
        name,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        orgId: null, // System tags
      },
    });
    tags.push(tag);
  }
  console.log(`✅ Created ${tags.length} tags\n`);

  // ============================================
  // 6. EXERCISES
  // ============================================
  console.log('📋 Creating exercises...');

  const exercisesData = [
    { name: 'Dynamic Stretching Circuit', category: ExerciseCategory.WARMUP, difficulty: ExerciseDifficulty.BEGINNER, intensity: ExerciseIntensity.LIGHT, duration: 10, equipment: ['Cones'], targetSkills: ['Mobility', 'Flexibility'], tags: ['Warm-up', 'Physical'] },
    { name: 'Pepper Drill', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.BEGINNER, intensity: ExerciseIntensity.MODERATE, duration: 15, equipment: ['Balls'], targetSkills: ['Passing', 'Setting', 'Hitting'], tags: ['Technical', 'Passing'] },
    { name: 'Target Serving Practice', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.MODERATE, duration: 20, equipment: ['Balls', 'Targets'], targetSkills: ['Serving'], tags: ['Technical', 'Serving'] },
    { name: 'Setting to Zones', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.MODERATE, duration: 20, equipment: ['Balls', 'Markers'], targetSkills: ['Setting', 'Precision'], tags: ['Technical', 'Setting'] },
    { name: 'Blocking Footwork Drills', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.HIGH, duration: 15, equipment: ['Net', 'Cones'], targetSkills: ['Blocking', 'Footwork'], tags: ['Technical', 'Blocking'] },
    { name: 'Defensive Positioning Drill', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.MODERATE, duration: 20, equipment: ['Balls'], targetSkills: ['Defense', 'Positioning'], tags: ['Technical', 'Defense'] },
    { name: 'Approach Jump Training', category: ExerciseCategory.PHYSICAL_CONDITIONING, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.HIGH, duration: 15, equipment: ['Net'], targetSkills: ['Jumping', 'Power'], tags: ['Physical', 'Attacking'] },
    { name: 'Rotation Transition Drill', category: ExerciseCategory.TACTICAL_DRILL, difficulty: ExerciseDifficulty.ADVANCED, intensity: ExerciseIntensity.HIGH, duration: 25, equipment: ['Balls', 'Net'], targetSkills: ['Rotation', 'Communication'], tags: ['Tactical'] },
    { name: '6v6 Scrimmage', category: ExerciseCategory.GAME_SITUATION, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.HIGH, duration: 30, equipment: ['Balls', 'Net', 'Court'], targetSkills: ['Game Sense', 'All Skills'], tags: ['Tactical'] },
    { name: 'Serve Receive Formation', category: ExerciseCategory.TACTICAL_DRILL, difficulty: ExerciseDifficulty.ADVANCED, intensity: ExerciseIntensity.MODERATE, duration: 20, equipment: ['Balls', 'Net'], targetSkills: ['Passing', 'Formation'], tags: ['Tactical', 'Passing'] },
    { name: 'Quick Attack Timing', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.ADVANCED, intensity: ExerciseIntensity.HIGH, duration: 20, equipment: ['Balls', 'Net'], targetSkills: ['Attacking', 'Timing', 'Setting'], tags: ['Technical', 'Attacking', 'Setting'] },
    { name: 'Dig to Set to Hit', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.HIGH, duration: 25, equipment: ['Balls', 'Net'], targetSkills: ['Defense', 'Setting', 'Attacking'], tags: ['Technical', 'Defense', 'Attacking'] },
    { name: 'Middle Blocker Read Drill', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.ADVANCED, intensity: ExerciseIntensity.HIGH, duration: 20, equipment: ['Balls', 'Net'], targetSkills: ['Blocking', 'Reading'], tags: ['Technical', 'Blocking'] },
    { name: 'Conditioning Circuit', category: ExerciseCategory.PHYSICAL_CONDITIONING, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.HIGH, duration: 20, equipment: ['Jump boxes', 'Medicine balls'], targetSkills: ['Strength', 'Endurance'], tags: ['Physical'] },
    { name: 'Butterfly Drill', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.MODERATE, duration: 15, equipment: ['Balls', 'Net'], targetSkills: ['Passing', 'Movement'], tags: ['Technical', 'Passing'] },
    { name: 'Overhand Passing Progression', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.BEGINNER, intensity: ExerciseIntensity.LIGHT, duration: 15, equipment: ['Balls'], targetSkills: ['Passing', 'Hand positioning'], tags: ['Technical', 'Passing'] },
    { name: 'Jump Serve Practice', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.ADVANCED, intensity: ExerciseIntensity.HIGH, duration: 20, equipment: ['Balls', 'Net'], targetSkills: ['Serving', 'Jumping'], tags: ['Technical', 'Serving'] },
    { name: 'Back Row Attack Drill', category: ExerciseCategory.TECHNICAL_DRILL, difficulty: ExerciseDifficulty.ADVANCED, intensity: ExerciseIntensity.HIGH, duration: 20, equipment: ['Balls', 'Net'], targetSkills: ['Attacking', 'Jumping'], tags: ['Technical', 'Attacking'] },
    { name: 'Static Stretching Cool Down', category: ExerciseCategory.COOL_DOWN, difficulty: ExerciseDifficulty.BEGINNER, intensity: ExerciseIntensity.LIGHT, duration: 10, equipment: [], targetSkills: ['Flexibility', 'Recovery'], tags: ['Warm-up', 'Physical'] },
    { name: 'Team Communication Drill', category: ExerciseCategory.TACTICAL_DRILL, difficulty: ExerciseDifficulty.INTERMEDIATE, intensity: ExerciseIntensity.MODERATE, duration: 20, equipment: ['Balls', 'Net'], targetSkills: ['Communication', 'Teamwork'], tags: ['Tactical'] },
  ];

  const exercises = [];
  for (const data of exercisesData) {
    const exercise = await prisma.exercise.create({
      data: {
        name: data.name,
        description: `Professional ${data.category.toLowerCase().replace('_', ' ')} focusing on ${data.targetSkills.join(', ')}.`,
        instructions: `Set up equipment and follow proper form. Focus on ${data.targetSkills[0]}.`,
        category: data.category,
        difficulty: data.difficulty,
        intensity: data.intensity,
        duration: data.duration,
        minPlayers: 2,
        maxPlayers: 12,
        equipment: data.equipment,
        targetSkills: data.targetSkills,
        primaryFocus: data.targetSkills[0],
        isBaseExercise: true,
        createdById: coach1.id,
        orgId: null,
      },
    });

    // Link tags
    for (const tagName of data.tags) {
      const tag = tags.find(t => t.name === tagName);
      if (tag) {
        await prisma.exerciseTagRelation.create({
          data: {
            exerciseId: exercise.id,
            tagId: tag.id,
          },
        });
      }
    }

    exercises.push(exercise);
  }
  console.log(`✅ Created ${exercises.length} exercises with tag relations\n`);

  // ============================================
  // 7. TRAINING SESSIONS
  // ============================================
  console.log('📅 Creating training sessions...');

  const sessionsData = [
    {
      name: 'Elite Technical Training',
      team: eliteTeam,
      coach: coach1,
      difficulty: ExerciseDifficulty.ADVANCED,
      intensity: ExerciseIntensity.HIGH,
      scheduledAt: new Date('2024-10-01T18:00:00'),
      status: SessionStatus.COMPLETED,
      exercises: [
        { exercise: exercises[0], order: 1 }, // Warmup
        { exercise: exercises[2], order: 2 }, // Serving
        { exercise: exercises[10], order: 3 }, // Quick attack
        { exercise: exercises[8], order: 4 }, // Scrimmage
        { exercise: exercises[18], order: 5 }, // Cool down
      ]
    },
    {
      name: 'Elite Tactical Session',
      team: eliteTeam,
      coach: coach1,
      difficulty: ExerciseDifficulty.ADVANCED,
      intensity: ExerciseIntensity.HIGH,
      scheduledAt: new Date('2024-10-03T18:00:00'),
      status: SessionStatus.COMPLETED,
      exercises: [
        { exercise: exercises[0], order: 1 },
        { exercise: exercises[7], order: 2 },
        { exercise: exercises[9], order: 3 },
        { exercise: exercises[8], order: 4 },
        { exercise: exercises[18], order: 5 },
      ]
    },
    {
      name: 'Junior Development Session',
      team: juniorTeam,
      coach: coach2,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      intensity: ExerciseIntensity.MODERATE,
      scheduledAt: new Date('2024-10-02T17:00:00'),
      status: SessionStatus.COMPLETED,
      exercises: [
        { exercise: exercises[0], order: 1 },
        { exercise: exercises[1], order: 2 },
        { exercise: exercises[3], order: 3 },
        { exercise: exercises[15], order: 4 },
        { exercise: exercises[18], order: 5 },
      ]
    },
  ];

  const sessions = [];
  for (const data of sessionsData) {
    const totalDuration = data.exercises.reduce((sum, e) => sum + e.exercise.duration, 0);

    const session = await prisma.trainingSession.create({
      data: {
        name: data.name,
        description: `Comprehensive training session for ${data.team.name}`,
        totalDuration,
        difficulty: data.difficulty,
        intensity: data.intensity,
        includeWarmup: true,
        includeStretching: true,
        includeGame: true,
        coachId: data.coach.id,
        teamId: data.team.id,
        scheduledAt: data.scheduledAt,
        completedAt: data.status === SessionStatus.COMPLETED ? new Date(data.scheduledAt.getTime() + totalDuration * 60000) : null,
        status: data.status,
      },
    });

    // Add exercises to session
    for (const exData of data.exercises) {
      await prisma.trainingSessionExercise.create({
        data: {
          sessionId: session.id,
          exerciseId: exData.exercise.id,
          order: exData.order,
          duration: exData.exercise.duration,
        },
      });
    }

    // Add attendance for team players
    const teamPlayers = players.filter(p => p.teamId === data.team.id);
    for (const player of teamPlayers) {
      await prisma.trainingAttendance.create({
        data: {
          sessionId: session.id,
          playerId: player.id,
          attended: Math.random() > 0.15, // 85% attendance rate
        },
      });
    }

    sessions.push(session);
    console.log(`   ✅ ${session.name} (${session.status})`);
  }
  console.log(`✅ Created ${sessions.length} training sessions\n`);

  // ============================================
  // 8. EVALUATIONS (Using EvaluationService)
  // ============================================
  console.log('📊 Creating evaluations using EvaluationService...\n');

  // Select 5 players for second evaluation (top performers)
  const playersForSecondEval = [players[0], players[1], players[2], players[3], players[4]];

  for (const playerData of players) {
    // Determine skill level based on experience and contract
    const baseSkillLevel = playerData._experience >= 6 ? 7.5 :
                          playerData._experience >= 4 ? 6.5 : 5.5;
    const isLeader = playerData._contract === ContractLevel.STARTER && playerData._experience >= 6;

    // Generate complete evaluation data
    const technical = generateTechnicalSkills(baseSkillLevel);
    const physical = generatePhysicalAttributes(playerData._height, playerData.primaryPosition);
    const mental = generateMentalAttributes(playerData._experience, isLeader);
    const overallRating = calculateOverallRating(technical, physical, mental);
    const potentialRating = Math.min(10, overallRating + (10 - playerData._experience) * 0.3);

    const strengths = [
      playerData.primaryPosition === Position.SETTER ? 'Excellent game vision' : 'Powerful attacks',
      isLeader ? 'Strong leadership' : 'Great work ethic',
      'Consistent performance',
    ];

    const improvementAreas = [
      baseSkillLevel < 7 ? 'Technical refinement needed' : 'Tactical awareness',
      playerData._experience < 4 ? 'Gain more experience' : 'Maintain consistency',
    ];

    // FIRST EVALUATION
    console.log(`   📋 First evaluation for ${playerData.firstName} ${playerData.lastName}...`);
    const session1 = await evaluationService.createSession({
      playerId: playerData.id,
      evaluatorId: coach1.id,
      batteryName: 'Complete Assessment - Initial',
    });

    // Complete session (this will update Player stats automatically)
    await evaluationService.completeSession(session1.id, {
      overallRating,
      potentialRating,
      technical,
      physical,
      mental,
      strengths,
      improvementAreas,
      notes: `Initial comprehensive evaluation. Strong ${playerData.primaryPosition} skills.`,
    });

    console.log(`      ✅ First evaluation complete - Player stats updated (100% copy)`);
    console.log(`      📊 Overall Rating: ${overallRating} | Potential: ${potentialRating}`);

    // SECOND EVALUATION (for top 5 players)
    if (playersForSecondEval.includes(playerData)) {
      console.log(`   📋 Second evaluation for ${playerData.firstName} ${playerData.lastName}...`);

      // Generate slightly improved stats
      const technical2 = generateTechnicalSkills(baseSkillLevel + 0.3);
      const physical2 = generatePhysicalAttributes(playerData._height, playerData.primaryPosition);
      const mental2 = generateMentalAttributes(playerData._experience, isLeader);
      const overallRating2 = calculateOverallRating(technical2, physical2, mental2);
      const potentialRating2 = Math.min(10, overallRating2 + (10 - playerData._experience) * 0.3);

      const session2 = await evaluationService.createSession({
        playerId: playerData.id,
        evaluatorId: coach1.id,
        batteryName: 'Complete Assessment - Follow-up',
      });

      // Complete session (30% new, 70% old blend)
      await evaluationService.completeSession(session2.id, {
        overallRating: overallRating2,
        potentialRating: potentialRating2,
        technical: technical2,
        physical: physical2,
        mental: mental2,
        strengths: [...strengths, 'Showing improvement'],
        improvementAreas: ['Continue development', 'Tactical refinement'],
        notes: `Follow-up evaluation showing improvement. Consistent progress in key areas.`,
      });

      console.log(`      ✅ Second evaluation complete - Player stats updated (30%/70% blend)`);
      console.log(`      📊 Blended Rating: ${overallRating * 0.7 + overallRating2 * 0.3} (from ${overallRating} to ${overallRating2})`);
    }

    console.log('');
  }

  console.log(`✅ All evaluations created and Player stats updated\n`);

  // ============================================
  // 9. PERFORMANCE METRICS
  // ============================================
  console.log('📈 Creating performance metrics...');

  for (const player of players) {
    const isAttacker = ([Position.OUTSIDE_HITTER, Position.OPPOSITE, Position.MIDDLE_BLOCKER] as Position[]).includes(player.primaryPosition);

    await prisma.performanceMetric.createMany({
      data: [
        { playerId: player.id, metricType: MetricType.VERTICAL_JUMP, value: isAttacker ? 75 + Math.random() * 15 : 60 + Math.random() * 10, unit: 'cm', recordedAt: new Date('2024-09-15') },
        { playerId: player.id, metricType: MetricType.APPROACH_JUMP, value: isAttacker ? 95 + Math.random() * 20 : 75 + Math.random() * 15, unit: 'cm', recordedAt: new Date('2024-09-15') },
        { playerId: player.id, metricType: MetricType.SPRINT_10M, value: 1.6 + Math.random() * 0.3, unit: 'seconds', recordedAt: new Date('2024-09-15') },
        { playerId: player.id, metricType: MetricType.AGILITY_T_TEST, value: 9 + Math.random() * 2, unit: 'seconds', recordedAt: new Date('2024-09-15') },
        { playerId: player.id, metricType: MetricType.SERVE_VELOCITY, value: 60 + Math.random() * 20, unit: 'km/h', recordedAt: new Date('2024-09-15') },
      ],
    });
  }
  console.log(`✅ Created performance metrics for all players\n`);

  // ============================================
  // 10. DEVELOPMENT PLANS
  // ============================================
  console.log('🎯 Creating development plans...');

  const topPlayers = players.filter(p => p._contract === ContractLevel.STARTER).slice(0, 2);

  for (const player of topPlayers) {
    await prisma.developmentPlan.create({
      data: {
        playerId: player.id,
        createdById: coach1.id,
        objectives: [
          'Improve serve accuracy by 15%',
          'Increase vertical jump by 5cm',
          'Develop leadership skills',
        ],
        focusAreas: ['Serving', 'Physical conditioning', 'Mental game'],
        startDate: new Date('2024-09-01'),
        targetDate: new Date('2024-12-31'),
        status: PlanStatus.ACTIVE,
        progressNotes: 'Player showing consistent improvement in targeted areas.',
      },
    });
    console.log(`   ✅ Development plan for ${player.firstName} ${player.lastName}`);
  }
  console.log(`✅ Created ${topPlayers.length} development plans\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 SEED COMPLETE!\n');
  console.log('📊 Summary:');
  console.log(`   • 1 Organization`);
  console.log(`   • 3 Users (1 admin, 2 coaches)`);
  console.log(`   • 2 Teams`);
  console.log(`   • ${players.length} Players (stats filled by evaluations)`);
  console.log(`   • ${players.length} First evaluations (100% → Player)`);
  console.log(`   • ${playersForSecondEval.length} Second evaluations (30%/70% blend)`);
  console.log(`   • ${tags.length} Exercise tags`);
  console.log(`   • ${exercises.length} Exercises`);
  console.log(`   • ${sessions.length} Training sessions`);
  console.log(`   • ${players.length * 5} Performance metrics`);
  console.log(`   • ${topPlayers.length} Development plans`);
  console.log('\n✅ Database is ready for use!\n');
}

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
