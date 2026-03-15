import { gql } from '@apollo/client';
import {
  EVALUATION_FRAGMENT,
  TECHNICAL_SKILLS_FRAGMENT,
  PHYSICAL_ATTRIBUTES_FRAGMENT,
  MENTAL_ATTRIBUTES_FRAGMENT
} from '../fragments/evaluation';

/**
 * GraphQL Queries for Evaluations
 * Matches backend EvaluationResolver.ts
 */

export const GET_CURRENT_EVALUATION = gql`
  ${EVALUATION_FRAGMENT}
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  query GetCurrentEvaluation($playerId: ID!) {
    currentEvaluation(playerId: $playerId) {
      ...EvaluationFields
      playerId
      evaluatorId
      isCurrent
      createdAt
      updatedAt
    }
  }
`;

export const GET_EVALUATION_HISTORY = gql`
  ${EVALUATION_FRAGMENT}
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  query GetEvaluationHistory($playerId: ID!) {
    evaluationHistory(playerId: $playerId) {
      ...EvaluationFields
      playerId
      evaluatorId
      isCurrent
      createdAt
      updatedAt
    }
  }
`;

export const GET_TEAM_EVALUATIONS = gql`
  ${EVALUATION_FRAGMENT}
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  query GetTeamEvaluations($teamId: ID!) {
    teamEvaluations(teamId: $teamId) {
      ...EvaluationFields
      playerId
      evaluatorId
      isCurrent
      createdAt
      updatedAt
    }
  }
`;
