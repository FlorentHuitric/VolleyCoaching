import { PlayerProfile } from '@/types/player';
import { VolleyballPosition } from '@/hooks/useCourtStore';

/**
 * Transform API player data to frontend PlayerProfile format
 * ✨ NEW ARCHITECTURE: Uses current stats from Player table (not Evaluation)
 * Maps PostgreSQL/GraphQL player data to the evaluation-rich format used in the UI
 */
export function transformAPIPlayerToProfile(apiPlayer: any): PlayerProfile {
  // Map database position to VolleyballPosition
  const position = apiPlayer.primaryPosition as VolleyballPosition;

  // ✨ NEW ARCHITECTURE:
  // - currentRating, potentialRating, strengths, weaknesses come from Player table
  // - technical/physical/mental details come from latest evaluation (if exists)
  const latestEval = apiPlayer.evaluations?.[0]; // evaluations sorted by date DESC

  const currentEvaluation = (apiPlayer.currentRating !== null && apiPlayer.currentRating !== undefined) ? {
    overallRating: apiPlayer.currentRating,
    potentialRating: apiPlayer.potentialRating,
    // Use latest evaluation's detailed stats if available
    technical: latestEval?.technical,
    physical: latestEval?.physical,
    mental: latestEval?.mental,
    strengths: apiPlayer.strengths || [],
    weaknesses: apiPlayer.weaknesses || [],
    notes: '',
    evaluationDate: apiPlayer.lastEvaluationDate ? new Date(apiPlayer.lastEvaluationDate) : new Date()
  } : undefined;

  // Evaluation history for stat change arrows
  const evaluationHistory = apiPlayer.evaluations?.map((evaluation: any) => ({
    overallRating: evaluation.overallRating,
    potentialRating: evaluation.potentialRating,
    technical: evaluation.technical,
    physical: evaluation.physical,
    mental: evaluation.mental,
    strengths: evaluation.strengths,
    weaknesses: evaluation.improvementAreas,
    notes: evaluation.notes || '',
    evaluationDate: new Date(evaluation.evaluationDate)
  })) || [];

  return {...apiPlayer, dateOfBirth:apiPlayer.dateOfBirth ? new Date(apiPlayer.dateOfBirth) : null, createdAt:new Date(apiPlayer.createdAt), updatedAt:new Date(apiPlayer.updatedAt), evaluations:apiPlayer.evaluations || [], currentEvaluation:apiPlayer.evaluations?.[0] || null};
}

/**
 * Determine target rating based on contract level and experience
 */
function determineTargetRating(contractLevel: string, yearsOfExperience: number): number {
  const baseRatings: Record<string, number> = {
    'STARTER': 8.5,
    'ROTATION': 7.0,
    'DEVELOPMENT': 5.5,
    'TRIAL': 4.5
  };

  const base = baseRatings[contractLevel] || 6.0;
  const experienceBonus = Math.min(yearsOfExperience * 0.1, 1.5);

  return Math.min(10, base + experienceBonus);
}

/**
 * Map database PlayerStatus to frontend status
 */
function mapPlayerStatus(status: string): 'active' | 'injured' | 'suspended' | 'inactive' {
  const statusMap: Record<string, 'active' | 'injured' | 'suspended' | 'inactive'> = {
    'ACTIVE': 'active',
    'INJURED': 'injured',
    'SUSPENDED': 'suspended',
    'TRIAL': 'active',
    'INACTIVE': 'inactive'
  };

  return statusMap[status] || 'active';
}

/**
 * Map database ContractLevel to frontend contractLevel
 */
function mapContractLevel(level: string): 'starter' | 'rotation' | 'development' | 'trial' {
  const levelMap: Record<string, 'starter' | 'rotation' | 'development' | 'trial'> = {
    'STARTER': 'starter',
    'ROTATION': 'rotation',
    'DEVELOPMENT': 'development',
    'TRIAL': 'trial'
  };

  return levelMap[level] || 'rotation';
}

/**
 * Transform frontend position format to backend enum format
 * e.g., "Middle Blocker" -> "MIDDLE_BLOCKER"
 */
function transformPositionToBackend(position?: string): string | null {
  if (!position) return null;
  return position.toUpperCase().replace(/\s+/g, '_');
}

/**
 * Transform PlayerProfile to API CreatePlayerInput format
 */
export function transformProfileToCreateInput(profile: Partial<PlayerProfile> & { teamId: string; orgId: string }) {
  if (!profile.teamId || !profile.orgId) throw new Error('Une équipe et une organisation sont nécessaires.');
  return { ...transformProfileToUpdateInput(profile), teamId: profile.teamId, orgId: profile.orgId };
}

export function transformProfileToUpdateInput(profile: Partial<PlayerProfile>) {
  const input: Record<string, unknown> = {};
  const fields = ['firstName', 'lastName', 'preferredName', 'dateOfBirth', 'nationality', 'jerseyNumber', 'primaryPosition', 'secondaryPosition', 'dominantHand', 'yearsOfExperience', 'height', 'weight', 'armReach', 'wingspan', 'status', 'contractLevel', 'avatar'] as const;
  for (const key of fields) if (profile[key] !== undefined) input[key] = profile[key];
  return input;
}
