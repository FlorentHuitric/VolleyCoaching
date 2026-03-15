import { gql } from '@apollo/client';

/**
 * GraphQL Queries for Training Sessions
 * Matches backend TrainingResolver.ts
 */

export const GET_TRAINING_SESSION = gql`
  query GetTrainingSession($id: ID!) {
    trainingSession(id: $id) {
      id
      name
      description
      totalDuration
      difficulty
      intensity
      includeWarmup
      includeStretching
      includeGame
      coachId
      teamId
      scheduledAt
      status
      completedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_TRAINING_SESSIONS_BY_TEAM = gql`
  query GetTrainingSessionsByTeam($teamId: ID!) {
    trainingSessionsByTeam(teamId: $teamId) {
      id
      name
      description
      totalDuration
      difficulty
      intensity
      includeWarmup
      includeStretching
      includeGame
      coachId
      teamId
      scheduledAt
      status
      completedAt
      createdAt
      updatedAt
    }
  }
`;
