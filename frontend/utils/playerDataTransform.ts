import { PlayerProfile } from '@/types/player-evaluation';
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

  return {
    id: apiPlayer.id,
    personalInfo: {
      firstName: apiPlayer.firstName,
      lastName: apiPlayer.lastName,
      dateOfBirth: new Date(apiPlayer.dateOfBirth),
      jerseyNumber: apiPlayer.jerseyNumber,
      preferredName: apiPlayer.preferredName || apiPlayer.lastName,
      avatar: apiPlayer.avatar || undefined
    },
    nationality: apiPlayer.nationality,
    primaryPosition: position,
    secondaryPositions: apiPlayer.secondaryPosition ? [apiPlayer.secondaryPosition as VolleyballPosition] : [],
    status: mapPlayerStatus(apiPlayer.status),
    contractLevel: mapContractLevel(apiPlayer.contractLevel),
    createdAt: new Date(apiPlayer.createdAt),
    updatedAt: new Date(apiPlayer.updatedAt),
    evaluationHistory,
    currentEvaluation
  };
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
export function transformProfileToCreateInput(profile: Partial<PlayerProfile> & { nationality?: string; dominantHand?: string; teamId?: string }): any {
  return {
    firstName: profile.personalInfo?.firstName,
    lastName: profile.personalInfo?.lastName,
    preferredName: profile.personalInfo?.preferredName,
    dateOfBirth: profile.personalInfo?.dateOfBirth,
    nationality: profile.nationality || 'France',
    jerseyNumber: profile.personalInfo?.jerseyNumber,
    primaryPosition: transformPositionToBackend(profile.primaryPosition),
    secondaryPosition: transformPositionToBackend(profile.secondaryPositions?.[0]),
    dominantHand: profile.dominantHand || 'RIGHT',
    yearsOfExperience: 0, // TODO: Calculate from data
    height: profile.currentEvaluation?.physical?.measurements?.height,
    weight: profile.currentEvaluation?.physical?.measurements?.weight,
    armReach: profile.currentEvaluation?.physical?.measurements?.reach,
    wingspan: profile.currentEvaluation?.physical?.measurements?.wingspan,
    status: (profile.status?.toUpperCase() || 'ACTIVE') as any,
    contractLevel: (profile.contractLevel?.toUpperCase() || 'TRIAL') as any,
    // joinDate removed - not in CreatePlayerInput schema
    avatar: profile.personalInfo?.avatar,
    teamId: profile.teamId || 'team-elite-squad', // From form or default team
    orgId: 'org-volleycoaching-demo' // Default organization
  };
}

/**
 * Transform PlayerProfile to API UpdatePlayerInput format
 */
export function transformProfileToUpdateInput(profile: Partial<PlayerProfile>): any {
  const input: any = {};

  if (profile.personalInfo?.firstName) input.firstName = profile.firstName;
  if (profile.personalInfo?.lastName) input.lastName = profile.lastName;
  if (profile.personalInfo?.jerseyNumber) input.jerseyNumber = profile.jerseyNumber;
  if (profile.primaryPosition) input.primaryPosition = transformPositionToBackend(profile.primaryPosition);
  if (profile.secondaryPositions) input.secondaryPosition = transformPositionToBackend(profile.secondaryPositions[0]);
  if (profile.status) input.status = profile.status.toUpperCase();
  if (profile.contractLevel) input.contractLevel = profile.contractLevel.toUpperCase();
  if (profile.personalInfo?.avatar) input.avatar = profile.avatar;

  // Physical measurements
  if (profile.currentEvaluation?.physical?.measurements) {
    const m = profile.currentEvaluation.physical.measurements;
    if (m.height) input.height = m.height;
    if (m.weight) input.weight = m.weight;
    if (m.reach) input.armReach = m.reach;
    if (m.wingspan) input.wingspan = m.wingspan;
  }

  return input;
}
