/**
 * Types TypeScript stricts pour le positionnement volleyball
 * NE PAS MODIFIER sans comprendre la logique de rotation volleyball
 */

// Positions volleyball officielles (numérotation 1-6 selon rotation)
export type CourtPosition = 1 | 2 | 3 | 4 | 5 | 6;

// Rôles des joueurs
export type VolleyballRole =
  | 'SETTER'           // Passeur
  | 'OPPOSITE'         // Attaquant diagonal
  | 'MIDDLE_BLOCKER'   // Central
  | 'OUTSIDE_HITTER'   // Attaquant de pointe
  | 'LIBERO'           // Libéro
  | 'DEFENSIVE_SPECIALIST'; // Spécialiste défensif

// Coordonnées terrain (en mètres, système de VolleyballCourt)
export interface CourtCoordinates {
  x: number; // 0-18m (largeur terrain)
  y: number; // 0-9m (longueur demi-terrain)
}

// Position complète d'un joueur sur le terrain
export interface PlayerCourtPosition {
  courtPosition: CourtPosition; // Position rotation (1-6)
  role: VolleyballRole;         // Rôle du joueur
  coordinates: CourtCoordinates; // Position physique sur le terrain
}

/**
 * POSITIONS OFFICIELLES VOLLEYBALL (demi-terrain, vue depuis le filet)
 *
 * Numérotation rotation anti-horaire:
 *
 *        FILET
 *   ═══════════════
 *   [4]  [3]  [2]    <- Zone avant
 *
 *   [5]  [6]  [1]    <- Zone arrière
 *
 * Position 1: Arrière-droit (serveur)
 * Position 2: Avant-droit
 * Position 3: Avant-centre
 * Position 4: Avant-gauche
 * Position 5: Arrière-gauche
 * Position 6: Arrière-centre
 */

// Terrain dimensions (constantes)
export const COURT_DIMENSIONS = {
  WIDTH: 18,  // mètres (largeur totale)
  HEIGHT: 9,  // mètres (longueur demi-terrain)
  ATTACK_LINE: 3, // mètres (ligne d'attaque)
} as const;

/**
 * Coordonnées par défaut pour chaque position de rotation
 * Basées sur le système de coordonnées VolleyballCourt (en mètres)
 * Demi-terrain: de 0 à 9m (notre côté du filet)
 */
export const DEFAULT_COURT_POSITIONS: Record<CourtPosition, CourtCoordinates> = {
  // Zone arrière (lignes 1, 5, 6)
  1: { x: 13.5, y: 7.0 },  // Arrière-droit (serveur)
  5: { x: 4.5,  y: 7.0 },  // Arrière-gauche
  6: { x: 9.0,  y: 7.0 },  // Arrière-centre

  // Zone avant (lignes 2, 3, 4)
  2: { x: 13.5, y: 2.0 },  // Avant-droit (proche filet)
  3: { x: 9.0,  y: 2.0 },  // Avant-centre (proche filet)
  4: { x: 4.5,  y: 2.0 },  // Avant-gauche (proche filet)
} as const;

/**
 * Configuration par défaut d'une composition 6-2
 * (Formation la plus courante avec 2 passeurs)
 */
export const DEFAULT_LINEUP_CONFIG: PlayerCourtPosition[] = [
  { courtPosition: 1, role: 'SETTER', coordinates: DEFAULT_COURT_POSITIONS[1] },
  { courtPosition: 2, role: 'OPPOSITE', coordinates: DEFAULT_COURT_POSITIONS[2] },
  { courtPosition: 3, role: 'MIDDLE_BLOCKER', coordinates: DEFAULT_COURT_POSITIONS[3] },
  { courtPosition: 4, role: 'OUTSIDE_HITTER', coordinates: DEFAULT_COURT_POSITIONS[4] },
  { courtPosition: 5, role: 'OUTSIDE_HITTER', coordinates: DEFAULT_COURT_POSITIONS[5] },
  { courtPosition: 6, role: 'LIBERO', coordinates: DEFAULT_COURT_POSITIONS[6] },
];

/**
 * Validation d'une position sur le terrain
 */
export function isValidCourtPosition(pos: CourtPosition): pos is CourtPosition {
  return pos >= 1 && pos <= 6;
}

/**
 * Validation de coordonnées (doivent être dans les limites du demi-terrain)
 */
export function isValidCoordinates(coords: CourtCoordinates): boolean {
  return (
    coords.x >= 0 && coords.x <= COURT_DIMENSIONS.WIDTH &&
    coords.y >= 0 && coords.y <= COURT_DIMENSIONS.HEIGHT
  );
}
