'use client';

import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PLAYERS_BY_TEAM,
  GET_PLAYER,
  SEARCH_PLAYERS,
  GET_PLAYERS_BY_POSITION,
  GET_AVAILABLE_PLAYERS
} from '@/graphql/queries/players';
import {
  CREATE_PLAYER,
  UPDATE_PLAYER,
  DELETE_PLAYER
} from '@/graphql/mutations/players';

/**
 * Custom Hook for Player API Operations
 * Uses Apollo Client to fetch data from GraphQL API
 */


export function usePlayersByTeam(teamId?: string) {
  const { currentTeamId } = useTeam();
  teamId = teamId || currentTeamId || undefined;
  const { data, loading, error, refetch } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId },
    skip: !teamId,
  });

  return {
    players: data?.playersByTeam || [],
    loading,
    error,
    refetch,
  };
}

export function usePlayer(id: string) {
  const { data, loading, error } = useQuery(GET_PLAYER, {
    variables: { id },
    skip: !id,
  });

  return {
    player: data?.player || null,
    loading,
    error,
  };
}

export function useSearchPlayers(query: string, orgId?: string) {
  const { user } = useAuth();
  orgId = orgId || user?.orgId;
  const { data, loading, error } = useQuery(SEARCH_PLAYERS, {
    variables: { query, orgId },
    skip: !orgId || !query || query.length < 2,
  });

  return {
    players: data?.searchPlayers || [],
    loading,
    error,
  };
}

export function usePlayersByPosition(position: string, teamId?: string) {
  const { currentTeamId } = useTeam();
  teamId = teamId || currentTeamId || undefined;
  const { data, loading, error } = useQuery(GET_PLAYERS_BY_POSITION, {
    variables: { position, teamId },
    skip: !position || !teamId,
  });

  return {
    players: data?.playersByPosition || [],
    loading,
    error,
  };
}

export function useAvailablePlayers(teamId?: string) {
  const { currentTeamId } = useTeam();
  teamId = teamId || currentTeamId || undefined;
  const { data, loading, error } = useQuery(GET_AVAILABLE_PLAYERS, {
    variables: { teamId },
  });

  return {
    players: data?.availablePlayers || [],
    loading,
    error,
  };
}

export function useCreatePlayer() {
  const [createPlayer, { data, loading, error }] = useMutation(CREATE_PLAYER, {
    refetchQueries: [GET_PLAYERS_BY_TEAM],
  });

  return {
    createPlayer,
    player: data?.createPlayer || null,
    loading,
    error,
  };
}

export function useUpdatePlayer() {
  const [updatePlayer, { data, loading, error }] = useMutation(UPDATE_PLAYER);

  return {
    updatePlayer,
    player: data?.updatePlayer || null,
    loading,
    error,
  };
}

export function useDeletePlayer() {
  const [deletePlayer, { data, loading, error }] = useMutation(DELETE_PLAYER, {
    refetchQueries: [GET_PLAYERS_BY_TEAM],
  });

  return {
    deletePlayer,
    player: data?.deletePlayer || null,
    loading,
    error,
  };
}
