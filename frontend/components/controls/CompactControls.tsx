'use client';

import { useState } from 'react';
import { useCourtStore } from '@/hooks/useCourtStore';
import {
  Play,
  Pause,
  Square,
  RotateCw,
  Settings,
  X,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LiberoControls from './LiberoControls';

export default function CompactControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    currentPhase,
    isRecording,
    displayMode,
    startRecording,
    stopRecording,
    rotateTeamPositions,
    setDisplayMode,
  } = useCourtStore();

  const teamACount = currentPhase.players.filter(p => p.color === '#8B5CF6').length;
  const teamBCount = currentPhase.players.filter(p => p.color === '#10B981').length;

  if (!isExpanded) {
    return (
      <div className="flex flex-col gap-2">
        {/* Compact FAB */}
        <Card className="shadow-xl border-2 border-white/20 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
          <CardContent className="p-3">
            <Button
              onClick={() => setIsExpanded(true)}
              size="sm"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              Contrôles
            </Button>
          </CardContent>
        </Card>

        {/* Quick rotation buttons */}
        <div className="flex flex-col gap-1">
          <Button
            onClick={() => rotateTeamPositions('#8B5CF6')}
            size="sm"
            variant="outline"
            className="bg-violet-100 hover:bg-violet-200 border-violet-300 text-violet-800 shadow-md"
          >
            <RotateCw className="h-3 w-3 mr-1" />
            A
          </Button>
          <Button
            onClick={() => rotateTeamPositions('#10B981')}
            size="sm"
            variant="outline"
            className="bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800 shadow-md"
          >
            <RotateCw className="h-3 w-3 mr-1" />
            B
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-72 md:w-80 shadow-2xl border-2 border-white/20 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 max-h-[80vh] overflow-y-auto">
      <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">🎛️ Contrôles</span>
          </div>
          <Button
            onClick={() => setIsExpanded(false)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Team info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-violet-50 dark:bg-violet-900/30 rounded-lg p-2 text-center">
            <div className="text-xs text-violet-700 dark:text-violet-300 font-medium">Équipe A</div>
            <div className="text-lg font-bold text-violet-800 dark:text-violet-200">{teamACount}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-2 text-center">
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Équipe B</div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{teamBCount}</div>
          </div>
        </div>

        {/* Recording controls */}
        <div className="space-y-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-600 hover:bg-green-700'
            } text-white shadow-md`}
            size="sm"
          >
            {isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Arrêter
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>

          {isRecording && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <span className="text-xs text-red-700 dark:text-red-300 font-medium">
                  Enregistrement en cours
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rotation controls */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Rotation</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => rotateTeamPositions('#8B5CF6')}
              variant="outline"
              size="sm"
              className="bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-800"
            >
              <RotateCw className="mr-1 h-3 w-3" />
              Équipe A
            </Button>
            <Button
              onClick={() => rotateTeamPositions('#10B981')}
              variant="outline"
              size="sm"
              className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
            >
              <RotateCw className="mr-1 h-3 w-3" />
              Équipe B
            </Button>
          </div>
        </div>

        {/* Libero controls */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Système Libéro</div>
          <div className="space-y-2">
            <LiberoControls teamColor="#8B5CF6" teamName="A" />
            <LiberoControls teamColor="#10B981" teamName="B" />
          </div>
        </div>

        {/* Display mode toggle */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Affichage</div>
          <Button
            onClick={() => setDisplayMode(displayMode === 'default' ? 'positions' : 'default')}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {displayMode === 'default' ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Voir postes
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Voir numéros
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400">Mouvements:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {currentPhase.movements.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}