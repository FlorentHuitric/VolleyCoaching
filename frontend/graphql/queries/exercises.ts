import { gql } from '@apollo/client';

/**
 * GraphQL Queries for Exercises
 * Matches backend ExerciseResolver.ts
 */

export const GET_EXERCISES = gql`
  query GetExercises($orgId: ID!) {
    exercises(orgId: $orgId) {
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
      tags {
        id
        tagId
        tag {
          id
          name
          color
        }
      }
    }
  }
`;

export const GET_EXERCISE = gql`
  query GetExercise($id: ID!) {
    exercise(id: $id) {
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
      tags {
        id
        tagId
        tag {
          id
          name
          color
        }
      }
    }
  }
`;

export const SEARCH_EXERCISES = gql`
  query SearchExercises($query: String!, $orgId: ID!) {
    searchExercises(query: $query, orgId: $orgId) {
      id
      name
      description
      thumbnailUrl
      category
      difficulty
      intensity
      duration
      targetSkills
      primaryFocus
      isBaseExercise
    }
  }
`;

export const GET_EXERCISE_TAGS = gql`
  query GetExerciseTags($orgId: ID!) {
    exerciseTags(orgId: $orgId) {
      id
      name
      color
      orgId
      createdAt
      updatedAt
    }
  }
`;

export const GET_EXERCISES_BY_CATEGORY = gql`
  query GetExercisesByCategory($category: ExerciseCategory!, $orgId: ID!) {
    exercisesByCategory(category: $category, orgId: $orgId) {
      id
      name
      description
      thumbnailUrl
      category
      difficulty
      intensity
      duration
      targetSkills
    }
  }
`;

export const GET_EXERCISES_BY_DIFFICULTY = gql`
  query GetExercisesByDifficulty($difficulty: ExerciseDifficulty!, $orgId: ID!) {
    exercisesByDifficulty(difficulty: $difficulty, orgId: $orgId) {
      id
      name
      description
      thumbnailUrl
      category
      difficulty
      intensity
      duration
      targetSkills
    }
  }
`;

export const GET_EXERCISES_BY_TAGS = gql`
  query GetExercisesByTags($tagIds: [ID!]!, $orgId: ID!) {
    exercisesByTags(tagIds: $tagIds, orgId: $orgId) {
      id
      name
      description
      thumbnailUrl
      category
      difficulty
      intensity
      duration
      targetSkills
    }
  }
`;
