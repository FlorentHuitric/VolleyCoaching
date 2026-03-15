import { gql } from '@apollo/client';

/**
 * GraphQL Mutations for Players
 */

export const CREATE_PLAYER = gql`
  mutation CreatePlayer($input: CreatePlayerInput!) {
    createPlayer(input: $input) {
      id
      firstName
      lastName
      jerseyNumber
      primaryPosition
      avatar
      status
    }
  }
`;

export const UPDATE_PLAYER = gql`
  mutation UpdatePlayer($id: ID!, $input: UpdatePlayerInput!) {
    updatePlayer(id: $id, input: $input) {
      id
      firstName
      lastName
      jerseyNumber
      primaryPosition
      avatar
      status
      updatedAt
    }
  }
`;

export const DELETE_PLAYER = gql`
  mutation DeletePlayer($id: ID!) {
    deletePlayer(id: $id) {
      id
      firstName
      lastName
    }
  }
`;
