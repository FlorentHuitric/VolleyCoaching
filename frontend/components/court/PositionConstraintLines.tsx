'use client';

import { Player } from '@/hooks/useCourtStore';
import { PositionConstraint } from '@/utils/positionValidation';

interface PositionConstraintLinesProps {
  activePlayer: Player;
  constraints: PositionConstraint[];
}

export default function PositionConstraintLines({
  activePlayer,
  constraints,
}: PositionConstraintLinesProps) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {constraints.map((constraint, index) => {
        const color = constraint.isValid ? '#10B981' : '#EF4444'; // Vert si valide, rouge sinon

        return (
          <line
            key={`constraint-${index}`}
            x1={activePlayer.position.x}
            y1={activePlayer.position.y}
            x2={constraint.reference.position.x}
            y2={constraint.reference.position.y}
            stroke={color}
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}
