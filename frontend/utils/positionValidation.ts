import { Player } from '@/hooks/useCourtStore';

/**
 * Règles de positionnement au volleyball
 * Chaque joueur doit respecter sa position par rapport à ses voisins
 */

export interface PositionConstraint {
  /** Joueur qui doit respecter la contrainte */
  player: Player;
  /** Joueur de référence */
  reference: Player;
  /** Type de contrainte */
  type: 'behind' | 'front' | 'left' | 'right';
  /** Est-ce que la contrainte est respectée */
  isValid: boolean;
}

/**
 * Détermine si un joueur appartient à l'équipe A (côté gauche)
 */
function isTeamA(player: Player): boolean {
  return player.color === '#8B5CF6'; // Violet = Team A
}

/**
 * Calcule la zone rectangulaire où un joueur peut être placé
 * en respectant les contraintes de position du volleyball
 */
export function getValidPositionZone(
  player: Player,
  allPlayers: Player[],
  courtBounds: { left: number; top: number; width: number; height: number }
): { minX: number; maxX: number; minY: number; maxY: number; isValid: boolean } {
  const teamA = isTeamA(player);

  // Filtre uniquement les joueurs de la même équipe (même couleur)
  const teamPlayers = allPlayers.filter(p => p.color === player.color);

  // Trouve un joueur par sa courtPosition
  const findPlayerByPosition = (pos: number) =>
    teamPlayers.find(p => p.courtPosition === pos);

  // Position du filet (milieu du terrain)
  const netX = courtBounds.left + (courtBounds.width / 2);

  // Initialiser les limites avec les bords du terrain
  let minX = courtBounds.left;
  let maxX = courtBounds.left + courtBounds.width;
  let minY = courtBounds.top;
  let maxY = courtBounds.top + courtBounds.height;

  // Limiter au filet selon l'équipe
  if (teamA) {
    // Équipe A (gauche) : ne peut pas dépasser le filet
    maxX = Math.min(maxX, netX);
  } else {
    // Équipe B (droite) : ne peut pas descendre en dessous du filet
    minX = Math.max(minX, netX);
  }

  /**
   * Pour l'équipe A (gauche, X: 0-9m) :
   * - "devant" (vers filet) = X plus grand
   * - "derrière" (loin filet) = X plus petit
   * - "droite" = Y plus grand
   * - "gauche" = Y plus petit
   *
   * Pour l'équipe B (droite, X: 9-18m) :
   * - "devant" (vers filet) = X plus petit
   * - "derrière" (loin filet) = X plus grand
   * - "droite" = Y plus petit
   * - "gauche" = Y plus grand
   */

  const position = player.courtPosition;

  switch (position) {
    case 1: {
      // Position 1: derrière position 2 ET à droite de position 6
      const pos2 = findPlayerByPosition(2);
      const pos6 = findPlayerByPosition(6);

      if (pos2) {
        if (teamA) {
          // Derrière = X plus petit que pos2
          maxX = Math.min(maxX, pos2.position.x);
        } else {
          // Derrière = X plus grand que pos2
          minX = Math.max(minX, pos2.position.x);
        }
      }

      if (pos6) {
        if (teamA) {
          // À droite = Y plus grand que pos6
          minY = Math.max(minY, pos6.position.y);
        } else {
          // À droite (point de vue B) = Y plus petit que pos6
          maxY = Math.min(maxY, pos6.position.y);
        }
      }
      break;
    }

    case 2: {
      // Position 2: devant position 1 ET à droite de position 3
      const pos1 = findPlayerByPosition(1);
      const pos3 = findPlayerByPosition(3);

      if (pos1) {
        if (teamA) {
          // Devant = X plus grand que pos1
          minX = Math.max(minX, pos1.position.x);
        } else {
          // Devant = X plus petit que pos1
          maxX = Math.min(maxX, pos1.position.x);
        }
      }

      if (pos3) {
        if (teamA) {
          // À droite = Y plus grand que pos3
          minY = Math.max(minY, pos3.position.y);
        } else {
          // À droite (point de vue B) = Y plus petit que pos3
          maxY = Math.min(maxY, pos3.position.y);
        }
      }
      break;
    }

    case 3: {
      // Position 3: devant position 6 ET à droite de position 4 ET à gauche de position 2
      const pos6 = findPlayerByPosition(6);
      const pos4 = findPlayerByPosition(4);
      const pos2 = findPlayerByPosition(2);

      if (pos6) {
        if (teamA) {
          // Devant = X plus grand que pos6
          minX = Math.max(minX, pos6.position.x);
        } else {
          // Devant = X plus petit que pos6
          maxX = Math.min(maxX, pos6.position.x);
        }
      }

      if (pos4) {
        if (teamA) {
          // À droite = Y plus grand que pos4
          minY = Math.max(minY, pos4.position.y);
        } else {
          // À droite (point de vue B) = Y plus petit que pos4
          maxY = Math.min(maxY, pos4.position.y);
        }
      }

      if (pos2) {
        if (teamA) {
          // À gauche = Y plus petit que pos2
          maxY = Math.min(maxY, pos2.position.y);
        } else {
          // À gauche (point de vue B) = Y plus grand que pos2
          minY = Math.max(minY, pos2.position.y);
        }
      }
      break;
    }

    case 4: {
      // Position 4: devant position 5 ET à gauche de position 3
      const pos5 = findPlayerByPosition(5);
      const pos3 = findPlayerByPosition(3);

      if (pos5) {
        if (teamA) {
          // Devant = X plus grand que pos5
          minX = Math.max(minX, pos5.position.x);
        } else {
          // Devant = X plus petit que pos5
          maxX = Math.min(maxX, pos5.position.x);
        }
      }

      if (pos3) {
        if (teamA) {
          // À gauche = Y plus petit que pos3
          maxY = Math.min(maxY, pos3.position.y);
        } else {
          // À gauche (point de vue B) = Y plus grand que pos3
          minY = Math.max(minY, pos3.position.y);
        }
      }
      break;
    }

    case 5: {
      // Position 5: à gauche de position 6 ET derrière position 4
      const pos6 = findPlayerByPosition(6);
      const pos4 = findPlayerByPosition(4);

      if (pos6) {
        if (teamA) {
          // À gauche = Y plus petit que pos6
          maxY = Math.min(maxY, pos6.position.y);
        } else {
          // À gauche (point de vue B) = Y plus grand que pos6
          minY = Math.max(minY, pos6.position.y);
        }
      }

      if (pos4) {
        if (teamA) {
          // Derrière = X plus petit que pos4
          maxX = Math.min(maxX, pos4.position.x);
        } else {
          // Derrière = X plus grand que pos4
          minX = Math.max(minX, pos4.position.x);
        }
      }
      break;
    }

    case 6: {
      // Position 6: derrière position 3 ET à droite de position 5 ET à gauche de position 1
      const pos3 = findPlayerByPosition(3);
      const pos5 = findPlayerByPosition(5);
      const pos1 = findPlayerByPosition(1);

      if (pos3) {
        if (teamA) {
          // Derrière = X plus petit que pos3
          maxX = Math.min(maxX, pos3.position.x);
        } else {
          // Derrière = X plus grand que pos3
          minX = Math.max(minX, pos3.position.x);
        }
      }

      if (pos5) {
        if (teamA) {
          // À droite = Y plus grand que pos5
          minY = Math.max(minY, pos5.position.y);
        } else {
          // À droite (point de vue B) = Y plus petit que pos5
          maxY = Math.min(maxY, pos5.position.y);
        }
      }

      if (pos1) {
        if (teamA) {
          // À gauche = Y plus petit que pos1
          maxY = Math.min(maxY, pos1.position.y);
        } else {
          // À gauche (point de vue B) = Y plus grand que pos1
          minY = Math.max(minY, pos1.position.y);
        }
      }
      break;
    }
  }

  // Vérifier si la zone est valide (pas de croisement des limites)
  const zoneExists = maxX > minX && maxY > minY;

  // Vérifier si la position actuelle du joueur est dans la zone valide
  // Avec une petite tolérance pour gérer l'arrondi des pixels
  const checkTolerance = 5;

  const xCheck = player.position.x >= (minX - checkTolerance) && player.position.x <= (maxX + checkTolerance);
  const yCheck = player.position.y >= (minY - checkTolerance) && player.position.y <= (maxY + checkTolerance);

  const isValid = zoneExists && xCheck && yCheck;

  console.log(`🏐 Position validation for ${player.name} (pos ${player.courtPosition}):`, {
    playerPos: player.position,
    zone: { minX, maxX, minY, maxY },
    zoneExists,
    xCheck,
    yCheck,
    isValid
  });

  return { minX, maxX, minY, maxY, isValid };
}

/**
 * Ancienne fonction maintenue pour compatibilité
 */
export function getPositionConstraints(
  player: Player,
  allPlayers: Player[]
): PositionConstraint[] {
  // Cette fonction n'est plus utilisée mais maintenue pour éviter les erreurs
  return [];
}

/**
 * Vérifie si toutes les contraintes d'un joueur sont respectées
 */
export function areConstraintsValid(constraints: PositionConstraint[]): boolean {
  return constraints.every(c => c.isValid);
}
