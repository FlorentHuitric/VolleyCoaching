'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { useTeam } from '@/contexts/TeamContext';
import { useLineup } from './useLineup';

export interface BenchPlayer {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  primaryPosition: string;
  avatar?: string;
}

/**
 * Hook pour récupérer les joueurs disponibles sur le banc
 * Banc = Tous les joueurs de l'équipe - Les joueurs sur le terrain dans la composition
 */
export const useBenchPlayers = () => {
  const { currentTeamId } = useTeam();
  const { lineupPlayers, isLoading: lineupLoading } = useLineup();

  const { data, loading, error } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId,
    fetchPolicy: 'cache-and-network',
  });

  const benchPlayers: BenchPlayer[] = useMemo(() => {
    if (!data?.playersByTeam || !lineupPlayers) return [];

    // IDs des joueurs sur le terrain
    const lineupPlayerIds = new Set(lineupPlayers.map(p => p.id));

    // Filtrer les joueurs qui ne sont PAS sur le terrain
    return data.playersByTeam
      .filter((player: any) => !lineupPlayerIds.has(player.id))
      .map((player: any) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        jerseyNumber: player.jerseyNumber,
        primaryPosition: player.primaryPosition,
        avatar: player.avatar,
      }));
  }, [data?.playersByTeam, lineupPlayers]);

  return {
    benchPlayers,
    isLoading: loading || lineupLoading,
    error: error?.message || null,
  };
};
