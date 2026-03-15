'use client';

import { useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_LINEUP } from '@/graphql/queries/lineups';
import { useTeam } from '@/contexts/TeamContext';

export interface LineupPosition {
  courtPosition: number;
  position: string;
  player?: {
    id: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      jerseyNumber: number;
      avatar?: string;
    };
  };
}

// Custom hook following DRY and SOLID principles
export const useLineup = () => {
  const { currentTeamId } = useTeam();

  const { data, loading, error, refetch } = useQuery(GET_ACTIVE_LINEUP, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId,
    fetchPolicy: 'cache-and-network',
  });

  const currentLineup: LineupPosition[] | null = data?.activeLineup?.positions || null;

  // Refresh lineup function
  const refreshLineup = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Check if lineup is complete (all positions filled)
  const isLineupComplete = useCallback(() => {
    if (!currentLineup) return false;
    return currentLineup.every(position => position.player);
  }, [currentLineup]);

  // Get players in lineup
  const getLineupPlayers = useCallback(() => {
    if (!currentLineup) return [];
    return currentLineup
      .filter(position => position.player)
      .map(position => position.player!);
  }, [currentLineup]);

  return {
    currentLineup,
    isLoading: loading,
    error: error?.message || null,
    refreshLineup,
    isLineupComplete: isLineupComplete(),
    lineupPlayers: getLineupPlayers()
  };
};