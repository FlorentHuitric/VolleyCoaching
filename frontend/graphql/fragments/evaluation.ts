import { gql } from '@apollo/client';

/**
 * GraphQL Fragments for Evaluation Data Structures
 * Matches backend EvaluationStructures.types.ts
 */

export const TECHNICAL_SKILLS_FRAGMENT = gql`
  fragment TechnicalSkillsFields on TechnicalSkills {
    serving {
      power
      accuracy
      consistency
    }
    passing {
      control
      reception
      positioning
    }
    setting {
      tempo
      decision
      precision
    }
    attacking {
      power
      variety
      technique
    }
    blocking {
      timing
      reading
      positioning
    }
    defense {
      digging
      positioning
      anticipation
    }
  }
`;

export const PHYSICAL_ATTRIBUTES_FRAGMENT = gql`
  fragment PhysicalAttributesFields on PhysicalAttributes {
    measurements {
      height
      reach
      weight
      wingspan
    }
    performance {
      verticalJump
      approachJump
      acceleration
      agility
      endurance
    }
    power {
      swingVelocity
      attackHeight
      blockHeight
      servePower
    }
    flexibility {
      shoulderMobility
      hipMobility
      ankleFlexibility
      overallFlexibility
    }
  }
`;

export const MENTAL_ATTRIBUTES_FRAGMENT = gql`
  fragment MentalAttributesFields on MentalAttributes {
    gameIntelligence {
      courtAwareness
      situationalUnderstanding
      strategicThinking
      adaptability
      gameFlow
    }
    communication {
      verbal
      nonVerbal
      listening
      teamDirection
      conflictResolution
    }
    leadership {
      onCourtPresence
      motivating
      responsibility
      decisionMaking
      roleModeling
    }
    mentalToughness {
      resilience
      focus
      confidence
      pressurePerformance
      recovery
    }
    coachability {
      receptiveness
      implementation
      effort
      attitude
      growth
    }
  }
`;

export const EVALUATION_FRAGMENT = gql`
  ${TECHNICAL_SKILLS_FRAGMENT}
  ${PHYSICAL_ATTRIBUTES_FRAGMENT}
  ${MENTAL_ATTRIBUTES_FRAGMENT}

  fragment EvaluationFields on EvaluationType {
    id
    overallRating
    potentialRating
    technical {
      ...TechnicalSkillsFields
    }
    physical {
      ...PhysicalAttributesFields
    }
    mental {
      ...MentalAttributesFields
    }
    strengths
    improvementAreas
    notes
    evaluationDate
  }
`;
