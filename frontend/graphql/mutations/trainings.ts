import { gql } from '@apollo/client';

/**
 * GraphQL Mutations for Training Sessions
 * Matches backend TrainingResolver.ts
 */

export const CREATE_TRAINING_SESSION = gql`
  mutation CreateTrainingSession($input: CreateTrainingSessionInput!) {
    createTrainingSession(input: $input) {
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

export const ADD_EXERCISE_TO_SESSION = gql`
  mutation AddExerciseToSession($input: AddExerciseToSessionInput!) {
    addExerciseToSession(input: $input) {
      id
      sessionId
      exerciseId
      order
      duration
      notes
      createdAt
      updatedAt
    }
  }
`;

export const RECORD_ATTENDANCE = gql`
  mutation RecordAttendance($input: RecordAttendanceInput!) {
    recordAttendance(input: $input) {
      id
      sessionId
      playerId
      attended
      notes
      createdAt
      updatedAt
    }
  }
`;

export const COMPLETE_TRAINING_SESSION = gql`
  mutation CompleteTrainingSession($id: ID!) {
    completeTrainingSession(id: $id) {
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
