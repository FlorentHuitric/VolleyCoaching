'use client';

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

const DEFAULT_TEAM_ID = 'team-elite-squad';
const DEFAULT_ORG_ID = 'org-volleycoaching-demo';

export function usePlayersByTeam(teamId: string = DEFAULT_TEAM_ID) {
  const { data, loading, error, refetch } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId },
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

export function useSearchPlayers(query: string, orgId: string = DEFAULT_ORG_ID) {
  const { data, loading, error } = useQuery(SEARCH_PLAYERS, {
    variables: { query, orgId },
    skip: !query || query.length < 2,
  });

  return {
    players: data?.searchPlayers || [],
    loading,
    error,
  };
}

export function usePlayersByPosition(position: string, teamId: string = DEFAULT_TEAM_ID) {
  const { data, loading, error } = useQuery(GET_PLAYERS_BY_POSITION, {
    variables: { position, teamId },
    skip: !position,
  });

  return {
    players: data?.playersByPosition || [],
    loading,
    error,
  };
}

export function useAvailablePlayers(teamId: string = DEFAULT_TEAM_ID) {
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
