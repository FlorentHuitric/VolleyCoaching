import { gql } from '@apollo/client';

export const LINEUP_FIELDS = gql`
  fragment LineupFields on Lineup {
    id
    teamId
    name
    isActive
    positions
    createdAt
    updatedAt
  }
`;

export const GET_ACTIVE_LINEUP = gql`
  ${LINEUP_FIELDS}
  query GetActiveLineup($teamId: ID!) {
    activeLineup(teamId: $teamId) {
      ...LineupFields
    }
  }
`;

export const GET_TEAM_LINEUPS = gql`
  ${LINEUP_FIELDS}
  query GetTeamLineups($teamId: ID!) {
    teamLineups(teamId: $teamId) {
      ...LineupFields
    }
  }
`;

export const SAVE_LINEUP = gql`
  ${LINEUP_FIELDS}
  mutation SaveLineup($input: SaveLineupInput!) {
    saveLineup(input: $input) {
      ...LineupFields
    }
  }
`;

export const DELETE_LINEUP = gql`
  mutation DeleteLineup($id: ID!) {
    deleteLineup(id: $id)
  }
`;
