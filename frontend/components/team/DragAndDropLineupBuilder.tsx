'use client';

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { PlayerProfile } from '@/types/player-evaluation';
import { VolleyballPosition } from '@/hooks/useCourtStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Save, Users, Target } from 'lucide-react';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';

interface LineupPosition {
  courtPosition: number;
  position: VolleyballPosition;
  player?: PlayerProfile;
}

interface DragAndDropLineupBuilderProps {
  availablePlayers: PlayerProfile[];
  onSaveLineup: (lineup: LineupPosition[]) => void;
  initialLineup?: LineupPosition[];
}

// Single Responsibility: Court position component
const CourtPosition = ({
  position,
  player,
  courtPosition
}: {
  position: VolleyballPosition;
  player?: PlayerProfile;
  courtPosition: number;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `position-${courtPosition}`,
    data: { type: 'position', position, courtPosition }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative w-20 h-20 rounded-lg border-2 border-dashed transition-all duration-200
        ${isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
        ${player ? 'bg-white dark:bg-gray-800 border-solid' : 'bg-gray-50 dark:bg-gray-900'}
      `}
    >
      {player ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-1">
          <Avatar className="w-10 h-10">
            <AvatarImage src={player.avatar} />
            <AvatarFallback className="text-xs bg-blue-600 text-white font-bold">
              {player.jerseyNumber}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium mt-1 truncate w-full text-center">
            {player.firstName || 'Joueur'}
          </span>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className={`w-8 h-8 rounded-full ${getPositionColor(position)} flex items-center justify-center`}>
            <span className="text-xs font-bold text-white">
              {getPositionAbbreviation(position)}
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-1">Pos {courtPosition}</span>
        </div>
      )}
    </div>
  );
};

// Single Responsibility: Draggable player component
const DraggablePlayer = ({
  player,
  isDragging
}: {
  player: PlayerProfile;
  isDragging?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging: dragging } = useDraggable({
    id: `player-${player.id}`,
    data: { type: 'player', player }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 bg-white dark:bg-gray-800 rounded-lg border cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-md min-w-0 w-full
        ${dragging || isDragging ? 'opacity-50 shadow-lg' : 'opacity-100'}
      `}
    >
      <div className="flex items-center space-x-3 min-w-0 w-full">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={player.avatar} />
          <AvatarFallback>
            {player.firstName?.[0] || '?'}{player.lastName?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-sm font-medium truncate">
            {player.firstName || 'Prénom'} {player.lastName || 'Nom'}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {getPositionAbbreviation(player.technicalProfile?.primaryPosition || player.primaryPosition || 'OUTSIDE_HITTER')}
            </Badge>
            <span className="text-xs text-gray-500 flex-shrink-0">
              #{player.jerseyNumber || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Open/Closed Principle: Extendable court layout
const VolleyballCourt = ({
  lineup,
  onPositionUpdate
}: {
  lineup: LineupPosition[];
  onPositionUpdate: (courtPosition: number, player?: PlayerProfile) => void;
}) => {
  /**
   * POSITIONS OFFICIELLES VOLLEYBALL
   * Basées sur rotation anti-horaire standard
   * Coordonnées converties du système VolleyballCourt (mètres -> %)
   *
   *        FILET
   *   ═══════════════
   *   [4]  [3]  [2]    <- Zone avant
   *
   *   [5]  [6]  [1]    <- Zone arrière
   */
  const courtLayout = [
    // Zone avant (proche du filet, ~22% depuis le haut)
    { position: 4, top: '22%', left: '25%' },  // Avant-gauche (Outside Hitter)
    { position: 3, top: '22%', left: '50%' },  // Avant-centre (Middle Blocker)
    { position: 2, top: '22%', left: '75%' },  // Avant-droit (Opposite)

    // Zone arrière (~78% depuis le haut)
    { position: 5, top: '78%', left: '25%' },  // Arrière-gauche (Outside Hitter)
    { position: 6, top: '78%', left: '50%' },  // Arrière-centre (Libero)
    { position: 1, top: '78%', left: '75%' },  // Arrière-droit (Setter/Serveur)
  ] as const;

  return (
    <div className="relative w-full h-80 bg-gradient-to-b from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border-2 border-orange-300 dark:border-orange-700">
      {/* Net */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white transform -translate-y-1/2 shadow-md" />
      <div className="absolute top-1/2 left-1/2 w-1 h-8 bg-white transform -translate-x-1/2 -translate-y-1/2 shadow-md" />

      {/* Court positions */}
      {courtLayout.map(({ position, top, left }) => {
        const lineupPos = lineup.find(l => l.courtPosition === position);
        return (
          <div
            key={position}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ top, left }}
          >
            <CourtPosition
              courtPosition={position}
              position={lineupPos?.position || 'OUTSIDE_HITTER'}
              player={lineupPos?.player}
            />
          </div>
        );
      })}
    </div>
  );
};

export default function DragAndDropLineupBuilder({
  availablePlayers,
  onSaveLineup,
  initialLineup = []
}: DragAndDropLineupBuilderProps) {
  const [lineup, setLineup] = useState<LineupPosition[]>(initialLineup.length > 0 ? initialLineup : [
    { courtPosition: 1, position: 'MIDDLE_BLOCKER' },  // Middle Blocker
    { courtPosition: 2, position: 'OPPOSITE' },        // Opposite
    { courtPosition: 3, position: 'OUTSIDE_HITTER' },  // Wing Smasher
    { courtPosition: 4, position: 'MIDDLE_BLOCKER' },  // Middle Blocker
    { courtPosition: 5, position: 'SETTER' },          // Passeur
    { courtPosition: 6, position: 'OUTSIDE_HITTER' },  // Wing Smasher
  ]);

  const [activePlayer, setActivePlayer] = useState<PlayerProfile | null>(null);

  // Dependency Inversion: Use callbacks for flexible event handling
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'player') {
      setActivePlayer(active.data.current.player);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);

    if (!over || !active.data.current) return;

    // Player dropped on court position
    if (over.data.current?.type === 'position' && active.data.current?.type === 'player') {
      const player = active.data.current.player as PlayerProfile;
      const courtPosition = over.data.current.courtPosition as number;

      setLineup(prev => prev.map(pos =>
        pos.courtPosition === courtPosition
          ? { ...pos, player }
          : { ...pos, player: pos.player?.id === player.id ? undefined : pos.player }
      ));
    }
  }, []);

  const handleSave = useCallback(() => {
    onSaveLineup(lineup);
  }, [lineup, onSaveLineup]);

  const assignedPlayerIds = new Set(lineup.map(pos => pos.player?.id).filter(Boolean));
  const unassignedPlayers = availablePlayers.filter(player => !assignedPlayerIds.has(player.id));

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Players */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Joueurs disponibles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden">
              {unassignedPlayers.map(player => (
                <DraggablePlayer key={player.id} player={player} />
              ))}
              {unassignedPlayers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Tous les joueurs sont assignés
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Court */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Composition du terrain</span>
              </CardTitle>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
                disabled={lineup.some(pos => !pos.player)}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <VolleyballCourt
              lineup={lineup}
              onPositionUpdate={(courtPosition, player) => {
                setLineup(prev => prev.map(pos =>
                  pos.courtPosition === courtPosition ? { ...pos, player } : pos
                ));
              }}
            />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {lineup.map(pos => (
                <div key={pos.courtPosition} className="text-sm">
                  <span className="font-medium">Position {pos.courtPosition}:</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {pos.player ? `${pos.player.firstName || 'Prénom'} ${pos.player.lastName || 'Nom'}` : 'Libre'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePlayer && <DraggablePlayer player={activePlayer} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}