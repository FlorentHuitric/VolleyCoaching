'use client';

import { useRef, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';

interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  jerseyNumber: number;
  avatar?: string;
}

interface VolleyballCourtProps {
  players: Player[];
  onPlayerMove: (playerId: string, newPosition: { x: number; y: number }) => void;
}

export default function VolleyballCourt({ players, onPlayerMove }: VolleyballCourtProps) {
  const courtRef = useRef<SVGSVGElement>(null);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  // Dimensions officielles d'un terrain de volleyball (en mètres)
  const COURT_WIDTH = 18; // 18m de large
  const COURT_HEIGHT = 9; // 9m de long
  const SVG_WIDTH = 800; // Largeur SVG en pixels
  const SVG_HEIGHT = 400; // Hauteur SVG en pixels

  // Conversion mètres vers pixels
  const meterToPixel = (meters: number, isWidth: boolean) => {
    return isWidth
      ? (meters / COURT_WIDTH) * SVG_WIDTH
      : (meters / COURT_HEIGHT) * SVG_HEIGHT;
  };

  // Conversion pixels vers mètres (pour les coordonnées des joueurs)
  const pixelToMeter = (pixels: number, isWidth: boolean) => {
    return isWidth
      ? (pixels / SVG_WIDTH) * COURT_WIDTH
      : (pixels / SVG_HEIGHT) * COURT_HEIGHT;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const player = players.find(p => p.id === event.active.id);
    setActivePlayer(player || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePlayer(null);

    if (!event.over) return;

    const courtRect = courtRef.current?.getBoundingClientRect();
    if (!courtRect) return;

    // Calculer la nouvelle position en mètres
    const newX = pixelToMeter(event.delta.x, true);
    const newY = pixelToMeter(event.delta.y, false);

    const currentPlayer = players.find(p => p.id === event.active.id);
    if (currentPlayer) {
      onPlayerMove(event.active.id as string, {
        x: Math.max(0, Math.min(COURT_WIDTH, currentPlayer.position.x + newX)),
        y: Math.max(0, Math.min(COURT_HEIGHT, currentPlayer.position.y + newY))
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <h2 className="text-2xl font-bold text-gray-800">Terrain Tactique</h2>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-lg shadow-lg">
          <svg
            ref={courtRef}
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="border-4 border-gray-700"
          >
            {/* Fond du terrain */}
            <rect
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              fill="#D97706"
              opacity="0.1"
            />

            {/* Lignes de délimitation */}
            <rect
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              fill="none"
              stroke="#D97706"
              strokeWidth="3"
            />

            {/* Ligne centrale */}
            <line
              x1={SVG_WIDTH / 2}
              y1="0"
              x2={SVG_WIDTH / 2}
              y2={SVG_HEIGHT}
              stroke="#D97706"
              strokeWidth="3"
            />

            {/* Filet */}
            <line
              x1={SVG_WIDTH / 2}
              y1="0"
              x2={SVG_WIDTH / 2}
              y2={SVG_HEIGHT}
              stroke="#8B5A2B"
              strokeWidth="8"
              opacity="0.7"
            />

            {/* Zone d'attaque (3m de chaque côté) */}
            <line
              x1={meterToPixel(3, true)}
              y1="0"
              x2={meterToPixel(3, true)}
              y2={SVG_HEIGHT}
              stroke="#D97706"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <line
              x1={SVG_WIDTH - meterToPixel(3, true)}
              y1="0"
              x2={SVG_WIDTH - meterToPixel(3, true)}
              y2={SVG_HEIGHT}
              stroke="#D97706"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Zone de service */}
            <rect
              x={SVG_WIDTH - 50}
              y={SVG_HEIGHT / 2 - 25}
              width="40"
              height="50"
              fill="none"
              stroke="#D97706"
              strokeWidth="2"
            />

            {/* Positions des joueurs */}
            {players.map((player) => {
              const pixelX = meterToPixel(player.position.x, true);
              const pixelY = meterToPixel(player.position.y, false);

              return (
                <g
                  key={player.id}
                  style={{ cursor: 'grab' }}
                  transform={`translate(${pixelX}, ${pixelY})`}
                >
                  {/* Ombre du jeton */}
                  <circle
                    cx="2"
                    cy="2"
                    r="20"
                    fill="rgba(0,0,0,0.2)"
                  />

                  {/* Jeton du joueur */}
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    fill="#3B82F6"
                    stroke="#1E40AF"
                    strokeWidth="2"
                    className="hover:fill-blue-500 transition-colors"
                  />

                  {/* Numéro de maillot */}
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="white"
                  >
                    {player.jerseyNumber}
                  </text>

                  {/* Nom du joueur */}
                  <text
                    x="0"
                    y="35"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#374151"
                    fontWeight="medium"
                  >
                    {player.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <DragOverlay>
          {activePlayer ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-500 border-2 border-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {activePlayer.jerseyNumber}
              </div>
              <span className="text-sm text-gray-600 mt-1">{activePlayer.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Légende */}
      <div className="text-sm text-gray-600 max-w-2xl text-center">
        🏐 Terrain de volleyball réglementaire (18m × 9m) •
        Glissez-déposez les jetons pour positionner vos joueurs •
        Zone d'attaque en pointillés (3m)
      </div>
    </div>
  );
}