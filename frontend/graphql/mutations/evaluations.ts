import { gql } from '@apollo/client';
import {
  EVALUATION_FRAGMENT,
  TECHNICAL_SKILLS_FRAGMENT,
  PHYSICAL_ATTRIBUTES_FRAGMENT,
  MENTAL_ATTRIBUTES_FRAGMENT
} from '../fragments/evaluation';

/**
 * GraphQL Mutations for Evaluations
 * Matches backend EvaluationResolver.ts
 */

export const CREATE_EVALUATION_SESSION = gql`
  mutation CreateEvaluationSession(
    $playerId: ID!
    $evaluatorId: ID!
    $batteryName: String!
  ) {
    createEvaluationSession(
      playerId: $playerId
      evaluatorId: $evaluatorId
      batteryName: $batteryName
    )
  }
`;

export const COMPLETE_EVALUATION_SESSION = gql`
  ${EVALUATION_FRAGMENT}
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  mutation CompleteEvaluationSession(
    $sessionId: ID!
    $evaluationData: CompleteEvaluationInput!
  ) {
    completeEvaluationSession(
      sessionId: $sessionId
      evaluationData: $evaluationData
    ) {
      ...EvaluationFields
      playerId
      evaluatorId
      isCurrent
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EVALUATION = gql`
  ${EVALUATION_FRAGMENT}
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  mutation DeleteEvaluation($id: ID!) {
    deleteEvaluation(id: $id) {
      ...EvaluationFields
    }
  }
`;
