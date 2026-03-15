'use client';

import { useRef, useState, useEffect } from 'react';
import { useCourtStore, DrawingPath } from '@/hooks/useCourtStore';

interface DrawingCanvasProps {
  courtBounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  meterToPixel: (meters: number, isX: boolean) => number;
  pixelToMeter: (pixels: number, isX: boolean) => number;
}

export default function DrawingCanvas({ courtBounds, meterToPixel, pixelToMeter }: DrawingCanvasProps) {
  const { currentPhase, isDrawing, addDrawing } = useCourtStore();
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convertir en coordonnées mètres
    const meterX = pixelToMeter(x, true);
    const meterY = pixelToMeter(y, false);

    setIsDrawingPath(true);
    setCurrentPath([{ x: meterX, y: meterY }]);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !isDrawingPath) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convertir en coordonnées mètres
    const meterX = pixelToMeter(x, true);
    const meterY = pixelToMeter(y, false);

    setCurrentPath(prev => [...prev, { x: meterX, y: meterY }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isDrawingPath || currentPath.length < 2) {
      setIsDrawingPath(false);
      setCurrentPath([]);
      return;
    }

    // Sauvegarder le chemin
    const path: DrawingPath = {
      points: currentPath,
      color: '#EF4444', // Rouge par défaut
      width: 3,
    };

    addDrawing(path);
    setIsDrawingPath(false);
    setCurrentPath([]);
  };

  const handleMouseLeave = () => {
    if (isDrawingPath) {
      handleMouseUp();
    }
  };

  // Convertir les points de mètres en pixels pour l'affichage
  const pathToPixels = (path: DrawingPath) => {
    return path.points.map(p => ({
      x: meterToPixel(p.x, true),
      y: meterToPixel(p.y, false),
    }));
  };

  const pathToString = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isDrawing ? 'auto' : 'none',
        zIndex: isDrawing ? 50 : 10,
        cursor: isDrawing ? 'crosshair' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dessins sauvegardés */}
      {currentPhase.drawings.map((drawing, index) => {
        const pixelPoints = pathToPixels(drawing);
        return (
          <path
            key={index}
            d={pathToString(pixelPoints)}
            stroke={drawing.color}
            strokeWidth={drawing.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}

      {/* Dessin en cours */}
      {isDrawingPath && currentPath.length > 0 && (
        <path
          d={pathToString(pathToPixels({ points: currentPath, color: '#EF4444', width: 3 }))}
          stroke="#EF4444"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
      )}
    </svg>
  );
}
