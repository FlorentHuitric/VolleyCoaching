'use client';

import { useRef, useState } from 'react';

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
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

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

  const movePlayer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!activePlayerId || !courtRef.current) return;
    const bounds=courtRef.current.getBoundingClientRect();
    onPlayerMove(activePlayerId,{
      x:Math.max(0,Math.min(COURT_WIDTH,(event.clientX-bounds.left)/bounds.width*COURT_WIDTH)),
      y:Math.max(0,Math.min(COURT_HEIGHT,(event.clientY-bounds.top)/bounds.height*COURT_HEIGHT)),
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-3 sm:p-6 w-full min-w-0">
      <h2 className="text-2xl font-bold text-gray-800">Terrain Tactique</h2>

        <div className="relative w-full max-w-[864px] overflow-x-auto bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-8 rounded-lg shadow-lg">
          <svg
            ref={courtRef}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full min-w-[640px] h-auto border-4 border-gray-700"
            onPointerMove={movePlayer}
            onPointerUp={() => setActivePlayerId(null)}
            onPointerCancel={() => setActivePlayerId(null)}
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
                  style={{ cursor: 'grab', touchAction:'none' }}
                  transform={`translate(${pixelX}, ${pixelY})`}
                  onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);setActivePlayerId(player.id)}}
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
                    r="26"
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

      {/* Légende */}
      <div className="text-sm text-gray-600 max-w-2xl text-center">
        🏐 Terrain de volleyball réglementaire (18m × 9m) •
        Glissez-déposez les jetons pour positionner vos joueurs •
        Zone d'attaque en pointillés (3m)
      </div>
    </div>
  );
}
