'use client';

import { Player } from '@/hooks/useCourtStore';
import { getValidPositionZone } from '@/utils/positionValidation';

interface ValidPositionZoneProps {
  activePlayer: Player;
  allPlayers: Player[];
  courtBounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export default function ValidPositionZone({
  activePlayer,
  allPlayers,
  courtBounds,
}: ValidPositionZoneProps) {
  // Calculer la zone valide pour ce joueur
  const zone = getValidPositionZone(activePlayer, allPlayers, courtBounds);

  // S'assurer que la zone est valide
  const width = Math.max(0, zone.maxX - zone.minX);
  const height = Math.max(0, zone.maxY - zone.minY);

  if (width <= 0 || height <= 0) {
    // Zone invalide, ne rien afficher
    return null;
  }

  // La zone est verte si la position actuelle est valide, rouge sinon
  const isCurrentlyValid = zone.isValid;

  return (
    <div
      style={{
        position: 'absolute',
        left: zone.minX,
        top: zone.minY,
        width: width,
        height: height,
        backgroundColor: isCurrentlyValid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', // Vert si valide, rouge sinon
        border: `2px dashed ${isCurrentlyValid ? '#10B981' : '#EF4444'}`,
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 15,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Coin indicateur */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          fontSize: '10px',
          fontWeight: 'bold',
          color: isCurrentlyValid ? '#10B981' : '#EF4444',
          backgroundColor: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {isCurrentlyValid ? '✓ Zone valide' : '✗ Faute de position'}
      </div>
    </div>
  );
}
