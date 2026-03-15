import { VolleyballPosition } from '@/hooks/useCourtStore';

// Types for court positioning
export type CourtPosition = 1 | 2 | 3 | 4 | 5 | 6;
export interface Position2D {
  x: number;
  y: number;
}

// Volleyball court position utilities following SOLID principles

/**
 * Validates if a court position is valid (1-6)
 * @param position - The court position to validate
 * @returns true if valid, false otherwise
 */
export const isValidCourtPosition = (position: number): position is CourtPosition => {
  return Number.isInteger(position) && position >= 1 && position <= 6;
};

/**
 * Calculates the next court position in proper volleyball rotation (counterclockwise for horizontal layout)
 * @param currentPosition - Current court position (1-6)
 * @returns Next position in rotation sequence
 * @throws Error if invalid position provided
 */
export const getNextRotationPosition = (currentPosition: CourtPosition): CourtPosition => {
  if (!isValidCourtPosition(currentPosition)) {
    throw new Error(`Invalid court position: ${currentPosition}. Must be 1-6.`);
  }

  // Counterclockwise rotation for horizontal layout: 1→6→5→4→3→2→1
  const nextPositionMap: Record<CourtPosition, CourtPosition> = {
    1: 6, // Serveur (arrière droite) → arrière centre
    6: 5, // Arrière centre → arrière gauche
    5: 4, // Arrière gauche → avant gauche
    4: 3, // Avant gauche → avant centre
    3: 2, // Avant centre → avant droite
    2: 1, // Avant droite → serveur (arrière droite)
  };

  return nextPositionMap[currentPosition];
};

/**
 * Calculates court coordinates for a given position and team (horizontal layout)
 * @param courtPosition - Position number (1-6)
 * @param isTeamA - true for Team A (left), false for Team B (right)
 * @returns 2D coordinates on the court
 * @throws Error if invalid position provided
 */
export const getCourtCoordinates = (courtPosition: CourtPosition, isTeamA: boolean): Position2D => {
  if (!isValidCourtPosition(courtPosition)) {
    throw new Error(`Invalid court position: ${courtPosition}. Must be 1-6.`);
  }

  // Standard volleyball court positions (horizontal layout: 18m wide x 9m tall)
  // Team A positions (left side, 0-9m)
  const basePositions: Record<CourtPosition, Position2D> = {
    1: { x: 3, y: 7.5 }, // Arrière droite (serveur)
    6: { x: 3, y: 4.5 }, // Arrière centre
    5: { x: 3, y: 1.5 }, // Arrière gauche
    4: { x: 6, y: 1.5 }, // Avant gauche
    3: { x: 6, y: 4.5 }, // Avant centre
    2: { x: 6, y: 7.5 }, // Avant droite
  };

  if (isTeamA) {
    return basePositions[courtPosition];
  } else {
    // Team B is on the right side (9-18m) and faces the opposite direction
    // So we mirror both X (offset by 9m) and Y (9 - y to flip vertically)
    const basePos = basePositions[courtPosition];
    return {
      x: (9 - basePos.x) + 9, // Mirror X and add offset: (9-3)+9=15 for back row
      y: 9 - basePos.y        // Mirror Y: 9-7.5=1.5 for position 1
    };
  }
};

/**
 * Gets the position name for a court position
 * @param courtPosition - Position number (1-6)
 * @returns French name of the position
 */
export const getCourtPositionName = (courtPosition: CourtPosition): string => {
  const positionNames: Record<CourtPosition, string> = {
    1: 'Arrière droite (Serveur)',
    2: 'Avant droite',
    3: 'Avant centre',
    4: 'Avant gauche',
    5: 'Arrière gauche',
    6: 'Arrière centre',
  };

  return positionNames[courtPosition];
};

// Conversion des postes en abréviations
export const getPositionAbbreviation = (position: VolleyballPosition): string => {
  const abbreviations: Record<VolleyballPosition, string> = {
    'SETTER': 'S',
    'OUTSIDE_HITTER': 'WS',
    'MIDDLE_BLOCKER': 'MB',
    'OPPOSITE': 'Op',
    'LIBERO': 'L',
    'DEFENSIVE_SPECIALIST': 'DS'
  };

  return abbreviations[position];
};

// Couleurs des postes pour une meilleure visibilité
export const getPositionColor = (position: VolleyballPosition): string => {
  const colors: Record<VolleyballPosition, string> = {
    'SETTER': '#F59E0B',       // Orange - Meneur de jeu
    'OUTSIDE_HITTER': '#EF4444', // Rouge - Attaquant
    'MIDDLE_BLOCKER': '#3B82F6', // Bleu - Défense centrale
    'OPPOSITE': '#8B5CF6',     // Violet - Diagonal
    'LIBERO': '#10B981',       // Vert - Défense spécialisée
    'DEFENSIVE_SPECIALIST': '#6B7280' // Gris - Spécialiste
  };

  return colors[position];
};

// Noms complets des postes en français
export const getPositionName = (position: VolleyballPosition): string => {
  const names: Record<VolleyballPosition, string> = {
    'SETTER': 'Passeur',
    'OUTSIDE_HITTER': 'Attaquant de pointe',
    'MIDDLE_BLOCKER': 'Central',
    'OPPOSITE': 'Diagonal',
    'LIBERO': 'Libéro',
    'DEFENSIVE_SPECIALIST': 'Spécialiste défensif'
  };

  return names[position];
};

// === Fonctions utilitaires pour la gestion du libéro ===

/**
 * Vérifie si un joueur doit être remplacé par le libéro lors d'une rotation
 * @param courtPosition - Position du joueur sur le terrain (1-6)
 * @param liberoReplacesPosition - Position que le libéro remplace
 * @returns true si le joueur doit être remplacé par le libéro
 */
export const shouldLiberoReplace = (
  courtPosition: CourtPosition,
  liberoReplacesPosition: CourtPosition | null
): boolean => {
  if (!liberoReplacesPosition) return false;

  // Le libéro remplace un joueur quand il arrive en position arrière
  // Positions arrière: 1, 6, 5
  const backRowPositions: CourtPosition[] = [1, 6, 5];

  return courtPosition === liberoReplacesPosition && backRowPositions.includes(courtPosition);
};

/**
 * Vérifie si un joueur (actuellement remplacé par le libéro) doit revenir sur le terrain
 * @param courtPosition - Position du joueur sur le terrain (1-6)
 * @param liberoReplacesPosition - Position que le libéro remplace
 * @returns true si le joueur doit revenir (car il arrive en zone avant)
 */
export const shouldPlayerReturnFromLibero = (
  courtPosition: CourtPosition,
  liberoReplacesPosition: CourtPosition | null
): boolean => {
  if (!liberoReplacesPosition) return false;

  // Le joueur revient quand il arrive en zone avant
  // Positions avant: 4, 3, 2
  const frontRowPositions: CourtPosition[] = [4, 3, 2];

  return courtPosition === liberoReplacesPosition && frontRowPositions.includes(courtPosition);
};

/**
 * Détermine si une position est en zone arrière (où le libéro peut jouer)
 * @param courtPosition - Position sur le terrain (1-6)
 * @returns true si la position est en zone arrière
 */
export const isBackRowPosition = (courtPosition: CourtPosition): boolean => {
  return [1, 6, 5].includes(courtPosition);
};

/**
 * Détermine si une position est en zone avant (où le libéro ne peut pas jouer)
 * @param courtPosition - Position sur le terrain (1-6)
 * @returns true si la position est en zone avant
 */
export const isFrontRowPosition = (courtPosition: CourtPosition): boolean => {
  return [4, 3, 2].includes(courtPosition);
};