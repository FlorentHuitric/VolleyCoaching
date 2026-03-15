/**
 * Migration Script: Migrate existing evaluations to player current stats
 *
 * This script migrates the current evaluation data from the Evaluation table
 * to the new currentStats fields in the Player table.
 *
 * Run with: npx ts-node src/scripts/migrateEvaluationsToPlayerStats.ts
 */

import prisma from '../prisma';

async function migrateEvaluationsToPlayerStats() {
  console.log('🏐 Starting migration: Evaluations → Player Current Stats');

  try {
    // Get all players
    const players = await prisma.player.findMany({
      include: {
        evaluations: {
          where: { isCurrent: true },
          take: 1
        }
      }
    });

    console.log(`📊 Found ${players.length} players`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const player of players) {
      const currentEval = player.evaluations[0];

      if (!currentEval) {
        console.log(`⏭️  Skipping ${player.firstName} ${player.lastName} - No current evaluation`);
        skippedCount++;
        continue;
      }

      // Update player with current stats from evaluation
      await prisma.player.update({
        where: { id: player.id },
        data: {
          currentRating: currentEval.overallRating,
          potentialRating: currentEval.potentialRating,
          currentTechnical: currentEval.technical as any,
          currentPhysical: currentEval.physical as any,
          currentMental: currentEval.mental as any,
          strengths: currentEval.strengths,
          weaknesses: currentEval.improvementAreas,
          lastEvaluationDate: currentEval.evaluationDate,
          statsUpdatedAt: new Date()
        }
      });

      console.log(`✅ Migrated ${player.firstName} ${player.lastName} (Rating: ${currentEval.overallRating})`);
      migratedCount++;
    }

    console.log('\n🎉 Migration Complete!');
    console.log(`✅ Migrated: ${migratedCount} players`);
    console.log(`⏭️  Skipped: ${skippedCount} players (no evaluation)`);
    console.log(`📊 Total: ${players.length} players`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateEvaluationsToPlayerStats()
  .then(() => {
    console.log('🏁 Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script error:', error);
    process.exit(1);
  });
