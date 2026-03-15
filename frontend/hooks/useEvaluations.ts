'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CURRENT_EVALUATION,
  GET_EVALUATION_HISTORY,
  GET_TEAM_EVALUATIONS
} from '@/graphql/queries/evaluations';
import {
  CREATE_EVALUATION_SESSION,
  COMPLETE_EVALUATION_SESSION,
  DELETE_EVALUATION
} from '@/graphql/mutations/evaluations';

/**
 * Custom hook for evaluation operations using Apollo Client
 * Replaces localStorage-based EvaluationService
 */

// Query: Get current evaluation for a player
export function useCurrentEvaluation(playerId: string) {
  return useQuery(GET_CURRENT_EVALUATION, {
    variables: { playerId },
    skip: !playerId,
    fetchPolicy: 'cache-and-network'
  });
}

// Query: Get evaluation history for a player
export function useEvaluationHistory(playerId: string) {
  return useQuery(GET_EVALUATION_HISTORY, {
    variables: { playerId },
    skip: !playerId,
    fetchPolicy: 'cache-and-network'
  });
}

// Query: Get all evaluations for a team
export function useTeamEvaluations(teamId: string) {
  return useQuery(GET_TEAM_EVALUATIONS, {
    variables: { teamId },
    skip: !teamId,
    fetchPolicy: 'cache-and-network'
  });
}

// Mutation: Create a new evaluation session
export function useCreateEvaluationSession() {
  const [createSession, { data, loading, error }] = useMutation(CREATE_EVALUATION_SESSION);

  const createEvaluationSession = async (
    playerId: string,
    evaluatorId: string,
    batteryName: string
  ) => {
    try {
      const result = await createSession({
        variables: { playerId, evaluatorId, batteryName }
      });
      return result.data?.createEvaluationSession;
    } catch (err) {
      console.error('Failed to create evaluation session:', err);
      throw err;
    }
  };

  return { createEvaluationSession, sessionId: data?.createEvaluationSession, loading, error };
}

// Mutation: Complete an evaluation session
export function useCompleteEvaluationSession() {
  const [completeSession, { data, loading, error }] = useMutation(COMPLETE_EVALUATION_SESSION, {
    // Refetch queries after completing to update UI
    refetchQueries: ['GetCurrentEvaluation', 'GetEvaluationHistory'],
    awaitRefetchQueries: true
  });

  const completeEvaluationSession = async (
    sessionId: string,
    evaluationData: any
  ) => {
    try {
      const result = await completeSession({
        variables: { sessionId, evaluationData }
      });
      return result.data?.completeEvaluationSession;
    } catch (err) {
      console.error('Failed to complete evaluation session:', err);
      throw err;
    }
  };

  return { completeEvaluationSession, evaluation: data?.completeEvaluationSession, loading, error };
}

// Mutation: Delete an evaluation
export function useDeleteEvaluation() {
  const [deleteEval, { data, loading, error }] = useMutation(DELETE_EVALUATION, {
    refetchQueries: ['GetEvaluationHistory'],
    awaitRefetchQueries: true
  });

  const deleteEvaluation = async (id: string) => {
    try {
      const result = await deleteEval({
        variables: { id }
      });
      return result.data?.deleteEvaluation;
    } catch (err) {
      console.error('Failed to delete evaluation:', err);
      throw err;
    }
  };

  return { deleteEvaluation, loading, error };
}

/**
 * Convenience hook for getting all player evaluations with their history
 * Useful for dashboard views that need to show multiple players
 */
export function usePlayerEvaluations(playerIds: string[]) {
  const queries = playerIds.map(playerId => 
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEvaluationHistory(playerId)
  );

  return {
    evaluations: queries.map(q => q.data?.evaluationHistory || []),
    loading: queries.some(q => q.loading),
    error: queries.find(q => q.error)?.error
  };
}
