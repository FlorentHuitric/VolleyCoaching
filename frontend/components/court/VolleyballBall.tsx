'use client';

import { useDraggable } from '@dnd-kit/core';

interface VolleyballBallProps {
  id: string;
  position: { x: number; y: number };
  scale?: number;
}

export default function VolleyballBall({ id, position, scale = 1 }: VolleyballBallProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id,
    data: { type: 'ball', position },
  });

  // Filtrer les attributs problématiques pour l'hydratation
  const { 'aria-describedby': _, ...safeAttributes } = attributes;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) ${transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : ''}`,
        zIndex: isDragging ? 1000 : 30,
        opacity: isDragging ? 0.7 : 1,
        transition: isDragging ? 'none' : 'left 0.3s ease, top 0.3s ease',
        width: `${32 * scale}px`,
        height: `${32 * scale}px`,
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      {...listeners}
      {...safeAttributes}
      suppressHydrationWarning={true}
    >
      {/* Volleyball avec design réaliste */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFF 0%, #E0E0E0 50%, #FFF 100%)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Lignes du ballon */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 32 32"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* Ligne verticale gauche */}
          <path
            d="M 8 4 Q 6 16 8 28"
            stroke="#1E40AF"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Ligne verticale droite */}
          <path
            d="M 24 4 Q 26 16 24 28"
            stroke="#1E40AF"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Ligne horizontale haut */}
          <path
            d="M 4 8 Q 16 6 28 8"
            stroke="#DC2626"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Ligne horizontale bas */}
          <path
            d="M 4 24 Q 16 26 28 24"
            stroke="#DC2626"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Emoji ballon simple */}
        <span style={{ fontSize: '20px', position: 'relative', zIndex: 1, opacity: 0.4 }}>
          🏐
        </span>
      </div>
    </div>
  );
}
