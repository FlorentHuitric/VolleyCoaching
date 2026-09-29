import { gql } from '@apollo/client';
import {
  EVALUATION_FRAGMENT,
  TECHNICAL_SKILLS_FRAGMENT,
  PHYSICAL_ATTRIBUTES_FRAGMENT,
  MENTAL_ATTRIBUTES_FRAGMENT
} from '../fragments/evaluation';

/**
 * GraphQL Queries for Players
 */

export const GET_PLAYERS_BY_TEAM = gql`
  ${EVALUATION_FRAGMENT}
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  query GetPlayersByTeam($teamId: ID!) {
    playersByTeam(teamId: $teamId) {
      assessmentKind
      rosterTeamIds
      id
      firstName
      lastName
      preferredName
      dateOfBirth
      nationality
      jerseyNumber
      primaryPosition
      secondaryPosition
      dominantHand
      yearsOfExperience
      height
      weight
      armReach
      wingspan
      status
      contractLevel
      joinDate
      avatar
      createdAt
      updatedAt
      currentRating
      potentialRating
      currentTechnical {
        ...TechnicalSkillsFields
      }
      currentPhysical {
        ...PhysicalAttributesFields
      }
      currentMental {
        ...MentalAttributesFields
      }
      strengths
      weaknesses
      lastEvaluationDate
      evaluations {
        ...EvaluationFields
      }
    }
  }
`;

export const GET_PLAYER = gql`
  ${EVALUATION_FRAGMENT}
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  query GetPlayer($id: ID!) {
    player(id: $id) {
      assessmentKind
      rosterTeamIds
      intakeProfile
      email
      phone
      orgId
      teamId
      armReach
      wingspan
      experienceLevel
      notes
      medicalNotes
      emergencyContact
      emergencyPhone
      id
      firstName
      lastName
      preferredName
      dateOfBirth
      nationality
      jerseyNumber
      primaryPosition
      secondaryPosition
      dominantHand
      yearsOfExperience
      height
      weight
      armReach
      wingspan
      status
      contractLevel
      joinDate
      avatar
      createdAt
      updatedAt
      currentRating
      potentialRating
      currentTechnical {
        ...TechnicalSkillsFields
      }
      currentPhysical {
        ...PhysicalAttributesFields
      }
      currentMental {
        ...MentalAttributesFields
      }
      strengths
      weaknesses
      lastEvaluationDate
      evaluations {
        ...EvaluationFields
      }
    }
  }
`;

export const SEARCH_PLAYERS = gql`
  query SearchPlayers($query: String!, $orgId: ID!) {
    searchPlayers(query: $query, orgId: $orgId) {
      id
      firstName
      lastName
      jerseyNumber
      primaryPosition
      avatar
    }
  }
`;

export const GET_PLAYERS_BY_POSITION = gql`
  query GetPlayersByPosition($position: Position!, $teamId: ID!) {
    playersByPosition(position: $position, teamId: $teamId) {
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

export const GET_AVAILABLE_PLAYERS = gql`
  query GetAvailablePlayers($teamId: ID!) {
    availablePlayers(teamId: $teamId) {
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
