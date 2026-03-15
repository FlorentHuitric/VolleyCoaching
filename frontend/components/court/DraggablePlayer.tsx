'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Player, useCourtStore } from '@/hooks/useCourtStore';
import { getPositionAbbreviation, getPositionColor } from '@/utils/volleyballUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DraggablePlayerProps {
  player: Player;
  scale?: number;
}

export default function DraggablePlayer({ player, scale = 1 }: DraggablePlayerProps) {
  const { displayMode } = useCourtStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: player.id,
    data: player,
  });

  console.log(`Player ${player.name} rendered:`, { isDragging, transform });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const isFlipped = displayMode === 'positions';

  // Filtrer les attributs problématiques pour l'hydratation
  const { 'aria-describedby': _, ...safeAttributes } = attributes;

  // Couleur basée sur le mode d'affichage
  const currentColor = isFlipped ? getPositionColor(player.volleyballPosition) : (player.color || '#3B82F6');

  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={{
              position: 'absolute',
              left: player.position.x,
              top: player.position.y,
              transform: `translate(-50%, -50%) ${style.transform || ''}`,
              zIndex: isDragging ? 1000 : 25,
              opacity: isDragging ? 0.5 : 1,
              transition: isDragging ? 'none' : 'left 0.8s ease, top 0.8s ease',
              width: '48px',
              height: '48px',
              cursor: 'grab',
              userSelect: 'none',
              touchAction: 'none',
              perspective: '1000px',
            }}
            {...listeners}
            {...safeAttributes}
            onPointerDown={() => console.log('Pointer down on', player.name)}
            suppressHydrationWarning={true}
          >
      {/* 3D Flip Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Front Side - Avatar or Jersey Number */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: player.color || '#3B82F6',
            border: `3px solid ${(player.color || '#3B82F6')}CC`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
          }}
        >
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
              onError={(e) => {
                // Fallback to jersey number if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.textContent = player.jerseyNumber.toString();
                }
              }}
            />
          ) : (
            player.jerseyNumber
          )}
        </div>

        {/* Back Side - Position Abbreviation */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: getPositionColor(player.volleyballPosition),
            border: `3px solid ${getPositionColor(player.volleyballPosition)}CC`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {getPositionAbbreviation(player.volleyballPosition)}
        </div>
      </div>
    </div>
  </TooltipTrigger>
  <TooltipContent side="top" className="bg-gray-900 text-white px-3 py-2">
    <div className="text-sm font-medium">{player.name}</div>
    <div className="text-xs text-gray-300">
      Position {player.courtPosition} • {getPositionAbbreviation(player.volleyballPosition)}
    </div>
  </TooltipContent>
</Tooltip>
</TooltipProvider>
  );
}