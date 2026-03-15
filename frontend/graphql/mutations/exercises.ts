import { gql } from '@apollo/client';

/**
 * GraphQL Mutations for Exercises
 * Matches backend ExerciseResolver.ts
 */

export const CREATE_EXERCISE = gql`
  mutation CreateExercise($input: CreateExerciseInput!) {
    createExercise(input: $input) {
      id
      name
      description
      instructions
      videoUrl
      thumbnailUrl
      instagramUrl
      category
      difficulty
      intensity
      duration
      minPlayers
      maxPlayers
      equipment
      spaceRequired
      targetSkills
      primaryFocus
      isBaseExercise
      createdById
      orgId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EXERCISE = gql`
  mutation UpdateExercise($id: ID!, $input: UpdateExerciseInput!) {
    updateExercise(id: $id, input: $input) {
      id
      name
      description
      instructions
      videoUrl
      thumbnailUrl
      instagramUrl
      category
      difficulty
      intensity
      duration
      minPlayers
      maxPlayers
      equipment
      spaceRequired
      targetSkills
      primaryFocus
      isBaseExercise
      createdById
      orgId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EXERCISE = gql`
  mutation DeleteExercise($id: ID!) {
    deleteExercise(id: $id) {
      id
      name
    }
  }
`;

export const CREATE_EXERCISE_TAG = gql`
  mutation CreateExerciseTag($input: CreateTagInput!) {
    createExerciseTag(input: $input) {
      id
      name
      color
      orgId
      createdAt
      updatedAt
    }
  }
`;

export const CLONE_EXERCISE = gql`
  mutation CloneExercise($id: ID!, $userId: ID!, $orgId: ID!) {
    cloneExercise(id: $id, userId: $userId, orgId: $orgId) {
      id
      name
      description
      instructions
      videoUrl
      thumbnailUrl
      instagramUrl
      category
      difficulty
      intensity
      duration
      minPlayers
      maxPlayers
      equipment
      spaceRequired
      targetSkills
      primaryFocus
      isBaseExercise
      createdById
      orgId
      createdAt
      updatedAt
    }
  }
`;
