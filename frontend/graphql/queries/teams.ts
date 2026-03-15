import { gql } from '@apollo/client';

export const TEAM_FIELDS = gql`
  fragment TeamFields on Team {
    id
    name
    description
    level
    season
    avatar
    coachId
    orgId
    createdAt
    updatedAt
    playerCount
    teamProgression
  }
`;

export const SIMPLE_PLAYER_FIELDS = gql`
  fragment SimplePlayerFields on SimplePlayer {
    id
    firstName
    lastName
    avatar
    jerseyNumber
    primaryPosition
    currentRating
  }
`;

export const GET_TEAM = gql`
  ${TEAM_FIELDS}
  query GetTeam($id: ID!) {
    team(id: $id) {
      ...TeamFields
    }
  }
`;

export const GET_TEAM_WITH_PLAYERS = gql`
  ${SIMPLE_PLAYER_FIELDS}
  query GetTeamWithPlayers($id: ID!) {
    teamWithPlayers(id: $id) {
      id
      name
      description
      level
      season
      avatar
      coachId
      orgId
      createdAt
      updatedAt
      playerCount
      teamProgression
      players {
        ...SimplePlayerFields
      }
    }
  }
`;

export const GET_TEAMS_BY_COACH = gql`
  ${TEAM_FIELDS}
  query GetTeamsByCoach($coachId: ID!) {
    teamsByCoach(coachId: $coachId) {
      ...TeamFields
    }
  }
`;

export const GET_MY_TEAMS = gql`
  ${TEAM_FIELDS}
  query GetMyTeams {
    myTeams {
      ...TeamFields
    }
  }
`;

export const GET_TEAMS_BY_ORGANIZATION = gql`
  ${TEAM_FIELDS}
  query GetTeamsByOrganization($orgId: ID!) {
    teamsByOrganization(orgId: $orgId) {
      ...TeamFields
    }
  }
`;

export const CREATE_TEAM = gql`
  ${TEAM_FIELDS}
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      ...TeamFields
    }
  }
`;

export const UPDATE_TEAM = gql`
  ${TEAM_FIELDS}
  mutation UpdateTeam($id: ID!, $input: UpdateTeamInput!) {
    updateTeam(id: $id, input: $input) {
      ...TeamFields
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id)
  }
`;
