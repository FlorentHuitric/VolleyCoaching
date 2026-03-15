'use client';

import { useRef, useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable, PointerSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useCourtStore, Player } from '@/hooks/useCourtStore';
import { useLineup } from '@/hooks/useLineup';
import { useBenchPlayers } from '@/hooks/useBenchPlayers';
import DraggablePlayer from '@/components/court/DraggablePlayer';
import ValidPositionZone from '@/components/court/ValidPositionZone';
import PhaseControls from '@/components/court/PhaseControls';
import VolleyballBall from '@/components/court/VolleyballBall';
import DrawingCanvas from '@/components/court/DrawingCanvas';
import SubstitutionModal from '@/components/court/SubstitutionModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';

export default function InteractiveCourt() {
  const courtRef = useRef<HTMLDivElement>(null);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [lineupApplied, setLineupApplied] = useState(false);
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B' | null>(null);
  const {
    currentPhase,
    updatePlayerPosition,
    updateBallPosition,
    isRecording,
    applyLineupToPlayers,
    substitutePlayer,
  } = useCourtStore();

  // Load saved lineup
  const { currentLineup, isLoading: lineupLoading } = useLineup();

  // Load bench players
  const { benchPlayers, isLoading: benchLoading } = useBenchPlayers();

  // Apply saved lineup to store ONLY once on initial load
  useEffect(() => {
    if (lineupLoading || lineupApplied) return;

    if (!currentLineup || !currentPhase.players.length) {
      console.log('📋 No lineup to apply');
      setLineupApplied(true);
      return;
    }

    console.log('🏐 Applying saved lineup to store (ONCE):', currentLineup);
    applyLineupToPlayers(currentLineup, '#8B5CF6'); // Team A (violet)
    setLineupApplied(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLineup, lineupLoading]);

  // Configuration des sensors - ajoutons tous les types
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Dimensions du terrain en pixels - HORIZONTAL (18m de large, 9m de haut) - Better UX!
  const COURT_WIDTH = 800; // 18m -> 800px (horizontal layout)
  const COURT_HEIGHT = 400; // 9m -> 400px (fits better on screen)
  const MARGIN = 50; // Reduced margin for better space utilization

  // Conversion mètres vers pixels (terrain horizontal - proper volleyball layout)
  const meterToPixel = (meters: number, isWidth: boolean) => {
    return isWidth
      ? (meters / 18) * COURT_WIDTH + MARGIN  // X: 18m de large
      : (meters / 9) * COURT_HEIGHT + MARGIN; // Y: 9m de haut
  };

  // Conversion pixels vers mètres (terrain horizontal)
  const pixelToMeter = (pixels: number, isWidth: boolean) => {
    return isWidth
      ? ((pixels - MARGIN) / COURT_WIDTH) * 18  // X: 18m de large
      : ((pixels - MARGIN) / COURT_HEIGHT) * 9; // Y: 9m de haut
  };

  const { setNodeRef, isOver } = useDroppable({
    id: 'volleyball-court',
  });

  const handleDragStart = (event: DragStartEvent) => {
    console.log('DRAG START called!', event.active.id);
    const player = event.active.data.current as Player;
    setActivePlayer(player);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('DRAG END called!', event);
    setActivePlayer(null);

    const draggedData = event.active.data.current as any;
    if (!draggedData) {
      console.log('No dragged data');
      return;
    }

    // Convertir le delta de pixels en mètres (sans la marge car c'est un déplacement relatif)
    const deltaMetersX = ((event.delta.x || 0) / COURT_WIDTH) * 18;  // X: 18m de large
    const deltaMetersY = ((event.delta.y || 0) / COURT_HEIGHT) * 9; // Y: 9m de haut

    // Vérifier si c'est un ballon ou un joueur
    if (draggedData.type === 'ball') {
      // Gestion du ballon
      if (!currentPhase.ball) {
        console.log('No ball in current phase');
        return;
      }

      const newMeterX = currentPhase.ball.position.x + deltaMetersX;
      const newMeterY = currentPhase.ball.position.y + deltaMetersY;

      // Contraintes pour le ballon (peut aller sur tout le terrain + zones de service)
      const constrainedX = Math.max(-3, Math.min(21, newMeterX));
      const constrainedY = Math.max(-2, Math.min(11, newMeterY));

      console.log('Ball position update:', {
        originalPosition: currentPhase.ball.position,
        deltaPixels: event.delta,
        deltaMeters: { x: deltaMetersX, y: deltaMetersY },
        newPosition: { x: constrainedX, y: constrainedY }
      });

      updateBallPosition({
        x: constrainedX,
        y: constrainedY
      });
    } else {
      // Gestion du joueur
      const player = draggedData as Player;

      // ATTENTION: player.position contient maintenant des pixels !
      // Il faut récupérer la position originale en mètres depuis le store
      const originalPlayer = currentPhase.players.find(p => p.id === player.id);
      if (!originalPlayer) {
        console.log('Original player not found');
        return;
      }

      // Nouvelle position en mètres = position originale en mètres + delta en mètres
      const newMeterX = originalPlayer.position.x + deltaMetersX;
      const newMeterY = originalPlayer.position.y + deltaMetersY;

      // Contraintes élargies pour les prises d'élan (terrain horizontal)
      const constrainedX = Math.max(-3, Math.min(21, newMeterX)); // 18m + 3m de chaque côté
      const constrainedY = Math.max(-2, Math.min(11, newMeterY)); // 9m + 2m de chaque côté

      console.log('Correct position update:', {
        player: player.name,
        originalPosition: originalPlayer.position,
        deltaPixels: event.delta,
        deltaMeters: { x: deltaMetersX, y: deltaMetersY },
        newPosition: { x: constrainedX, y: constrainedY }
      });

      // Mettre à jour avec la position contrainte en mètres
      updatePlayerPosition(player.id, {
        x: constrainedX,
        y: constrainedY
      });
    }
  };

  const handleOpenSubstitutionModal = (team: 'A' | 'B') => {
    setSelectedTeam(team);
    setSubstitutionModalOpen(true);
  };

  const handleCloseSubstitutionModal = () => {
    setSubstitutionModalOpen(false);
    setSelectedTeam(null);
  };

  const handleSubstitute = (courtPlayerId: string, benchPlayerId: string) => {
    const benchPlayer = benchPlayers.find(p => p.id === benchPlayerId);
    if (!benchPlayer) {
      console.error('Bench player not found:', benchPlayerId);
      return;
    }

    substitutePlayer(courtPlayerId, benchPlayer);
  };

  // Filtrer les joueurs par équipe
  const teamAColor = '#8B5CF6';
  const teamBColor = '#10B981';
  const teamAPlayers = currentPhase.players.filter(p => p.color === teamAColor);
  const teamBPlayers = currentPhase.players.filter(p => p.color === teamBColor);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Phase Controls */}
      <PhaseControls />

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={(event) => console.log('DRAG MOVE', event.delta)}
        onDragCancel={() => console.log('DRAG CANCEL')}
        sensors={sensors}
      >
        <div
          ref={setNodeRef}
          className={`volleyball-court relative mx-auto ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''} rounded-lg shadow-xl transition-all duration-200 max-w-full`}
          style={{
            width: Math.min(COURT_WIDTH + (MARGIN * 2), window?.innerWidth ? window.innerWidth - 32 : 900),
            height: COURT_HEIGHT + (MARGIN * 2),
            aspectRatio: `${COURT_WIDTH + (MARGIN * 2)} / ${COURT_HEIGHT + (MARGIN * 2)}`,
          }}
        >
        <div ref={courtRef} className="relative w-full h-full overflow-hidden rounded-lg">
          {/* Fond du terrain */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 opacity-80" />

          {/* Terrain principal avec marge */}
          <div
            className="absolute bg-green-100 border-4 border-white"
            style={{
              left: MARGIN,
              top: MARGIN,
              width: COURT_WIDTH,
              height: COURT_HEIGHT,
            }}
          />

          {/* Zone centrale colorée (terrain horizontal - 6m au milieu) */}
          <div
            className="absolute bg-orange-300 opacity-60"
            style={{
              left: meterToPixel(6, true),
              top: MARGIN,
              width: meterToPixel(6, true) - MARGIN,
              height: COURT_HEIGHT,
            }}
          />

          {/* Lignes d'attaque (3m du filet de chaque côté) */}
          <div
            className="absolute bg-white"
            style={{
              left: meterToPixel(6, true), // 6m de gauche
              top: MARGIN,
              width: '3px',
              height: COURT_HEIGHT,
            }}
          />
          <div
            className="absolute bg-white"
            style={{
              left: meterToPixel(12, true), // 12m de gauche
              top: MARGIN,
              width: '3px',
              height: COURT_HEIGHT,
            }}
          />

          {/* Ligne centrale (filet) */}
          <div
            className="absolute bg-white z-10"
            style={{
              left: meterToPixel(9, true), // Milieu du terrain
              top: MARGIN,
              width: '4px',
              height: COURT_HEIGHT,
            }}
          />

          {/* Filet */}
          <div
            className="absolute bg-gradient-to-b from-amber-800 to-amber-900 opacity-80 shadow-lg z-20"
            style={{
              left: meterToPixel(9, true) - 6, // Milieu du terrain
              top: MARGIN,
              width: '12px',
              height: COURT_HEIGHT,
            }}
          />

          {/* Zones de service (derrière les lignes de fond) */}
          <div
            className="absolute border-2 border-dashed border-white opacity-60"
            style={{
              left: '10px',
              top: '50%',
              width: '30px',
              height: '60px',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            className="absolute border-2 border-dashed border-white opacity-60"
            style={{
              right: '10px',
              top: '50%',
              width: '30px',
              height: '60px',
              transform: 'translateY(-50%)',
            }}
          />

          {/* Bancs de touche - repositionnés pour terrain horizontal */}
          <div
            className="absolute bg-gray-200 border border-gray-400 rounded opacity-80 flex items-center justify-center text-xs font-bold text-gray-700"
            style={{
              left: '50%',
              top: '10px',
              width: '120px',
              height: '20px',
              transform: 'translateX(-50%)',
            }}
          >
            TABLE DE MARQUE
          </div>

          <button
            onClick={() => handleOpenSubstitutionModal('B')}
            className="absolute bg-emerald-100 border-2 border-emerald-400 rounded hover:bg-emerald-200 hover:border-emerald-500 transition-all hover:shadow-md flex items-center justify-center text-xs font-bold text-emerald-800 cursor-pointer z-30"
            style={{
              right: '20px',
              top: '10px',
              width: '80px',
              height: '20px',
            }}
            title="Cliquer pour effectuer un changement"
          >
            BANC B
          </button>

          <button
            onClick={() => handleOpenSubstitutionModal('A')}
            className="absolute bg-violet-100 border-2 border-violet-400 rounded hover:bg-violet-200 hover:border-violet-500 transition-all hover:shadow-md flex items-center justify-center text-xs font-bold text-violet-800 cursor-pointer z-30"
            style={{
              left: '20px',
              top: '10px',
              width: '80px',
              height: '20px',
            }}
            title="Cliquer pour effectuer un changement"
          >
            BANC A
          </button>

          {/* Indicateur d'enregistrement */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg animate-pulse z-30">
              <div className="w-3 h-3 bg-white rounded-full animate-ping" />
              <span className="font-medium text-sm">ENREGISTREMENT</span>
            </div>
          )}

          {/* Joueurs */}
          {currentPhase.players.map((player) => {
            const pixelX = meterToPixel(player.position.x, true);
            const pixelY = meterToPixel(player.position.y, false);

            return (
              <DraggablePlayer
                key={player.id}
                player={{
                  ...player,
                  position: { x: pixelX, y: pixelY } // Position en pixels pour le rendu
                }}
              />
            );
          })}

          {/* Ballon de volleyball */}
          {currentPhase.ball && (
            <VolleyballBall
              id={currentPhase.ball.id}
              position={{
                x: meterToPixel(currentPhase.ball.position.x, true),
                y: meterToPixel(currentPhase.ball.position.y, false),
              }}
              scale={1}
            />
          )}

          {/* Zone de position valide pendant le drag */}
          {activePlayer && (() => {
            // Récupérer le joueur original depuis le store (avec positions en mètres)
            const originalPlayer = currentPhase.players.find(p => p.id === activePlayer.id);
            if (!originalPlayer) return null;

            // Convertir les positions en pixels pour le joueur actif
            const activePlayerPixels = {
              ...originalPlayer,
              position: {
                x: meterToPixel(originalPlayer.position.x, true),
                y: meterToPixel(originalPlayer.position.y, false),
              },
            };

            // Convertir les positions en pixels pour tous les joueurs
            const playersInPixels = currentPhase.players.map(p => ({
              ...p,
              position: {
                x: meterToPixel(p.position.x, true),
                y: meterToPixel(p.position.y, false),
              },
            }));

            return (
              <ValidPositionZone
                activePlayer={activePlayerPixels}
                allPlayers={playersInPixels}
                courtBounds={{
                  left: MARGIN,
                  top: MARGIN,
                  width: COURT_WIDTH,
                  height: COURT_HEIGHT,
                }}
              />
            );
          })()}

          {/* Canvas de dessin */}
          <DrawingCanvas
            courtBounds={{
              left: MARGIN,
              top: MARGIN,
              width: COURT_WIDTH,
              height: COURT_HEIGHT,
            }}
            meterToPixel={meterToPixel}
            pixelToMeter={pixelToMeter}
          />

          {/* Labels des zones - repositionnés pour terrain horizontal */}
          <div
            className="absolute text-xs font-bold text-violet-800 bg-violet-100/90 px-2 py-1 rounded shadow-sm"
            style={{
              left: meterToPixel(3, true),
              top: meterToPixel(4.5, false),
              transform: 'translate(-50%, -50%)',
            }}
          >
            ARRIÈRE A
          </div>
          <div
            className="absolute text-xs font-bold text-violet-800 bg-violet-100/90 px-2 py-1 rounded shadow-sm"
            style={{
              left: meterToPixel(7.5, true),
              top: meterToPixel(4.5, false),
              transform: 'translate(-50%, -50%)',
            }}
          >
            AVANT A
          </div>
          <div
            className="absolute text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-1 rounded shadow-sm"
            style={{
              left: meterToPixel(10.5, true),
              top: meterToPixel(4.5, false),
              transform: 'translate(-50%, -50%)',
            }}
          >
            AVANT B
          </div>
          <div
            className="absolute text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-1 rounded shadow-sm"
            style={{
              left: meterToPixel(15, true),
              top: meterToPixel(4.5, false),
              transform: 'translate(-50%, -50%)',
            }}
          >
            ARRIÈRE B
          </div>
        </div>

        {/* Légende du terrain */}
        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600 font-medium">
          🏐 Terrain officiel 18m × 9m • Lignes d'attaque à 3m du filet • Glissez-déposez les joueurs
        </div>
      </div>

      </DndContext>

      {/* Modale de substitution */}
      {selectedTeam && (
        <SubstitutionModal
          open={substitutionModalOpen}
          onClose={handleCloseSubstitutionModal}
          teamColor={selectedTeam === 'A' ? teamAColor : teamBColor}
          teamName={selectedTeam === 'A' ? 'Équipe A' : 'Équipe B'}
          playersOnCourt={selectedTeam === 'A' ? teamAPlayers : teamBPlayers}
          benchPlayers={benchPlayers}
          onSubstitute={handleSubstitute}
        />
      )}
    </div>
  );
}