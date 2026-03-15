'use client';

import { useState } from 'react';
import { useCourtStore, DisplayMode } from '@/hooks/useCourtStore';
import { Play, Pause, Square, RotateCcw, Save, Download, Users, Timer, RefreshCw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TacticalControls() {
  const {
    currentPhase,
    isRecording,
    isReplaying,
    replayTime,
    displayMode,
    startRecording,
    stopRecording,
    startReplay,
    stopReplay,
    clearMovements,
    savePhase,
    setDisplayMode,
    rotateTeamPositions,
  } = useCourtStore();

  const [phaseName, setPhaseName] = useState(currentPhase.name);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSavePhase = () => {
    if (phaseName.trim()) {
      savePhase(phaseName);
      setShowSaveDialog(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Toggle flip des jetons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Vue des Jetons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle simple */}
          <div className="flex items-center justify-center space-x-3 p-3">
            <Badge variant={displayMode === 'default' ? 'default' : 'secondary'} className="text-xs">
              🏐 Avatar/N°
            </Badge>
            <Switch
              checked={displayMode === 'positions'}
              onCheckedChange={(checked) => setDisplayMode(checked ? 'positions' : 'default')}
            />
            <Badge variant={displayMode === 'positions' ? 'default' : 'secondary'} className="text-xs">
              🏐 Postes
            </Badge>
          </div>

          {/* Légende des postes si activé */}
          {displayMode === 'positions' && (
            <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center">
                  🏐 Postes volleyball
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-amber-500"></div>
                    <Badge variant="secondary" className="text-xs"><strong>S</strong> - Passeur</Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                    <Badge variant="secondary" className="text-xs"><strong>WS</strong> - Att. pointe</Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                    <Badge variant="secondary" className="text-xs"><strong>MB</strong> - Central</Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-violet-500"></div>
                    <Badge variant="secondary" className="text-xs"><strong>Op</strong> - Diagonal</Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-emerald-500"></div>
                    <Badge variant="secondary" className="text-xs"><strong>L</strong> - Libéro</Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-gray-500"></div>
                    <Badge variant="secondary" className="text-xs"><strong>DS</strong> - Spécialiste</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Rotation des équipes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <RotateCw className="mr-2 h-5 w-5" />
            Rotation des Équipes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => rotateTeamPositions('#8B5CF6')}
              variant="outline"
              size="sm"
              className="bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-800"
            >
              <RotateCw className="mr-1 h-4 w-4" />
              Rotation Équipe A
            </Button>
            <Button
              onClick={() => rotateTeamPositions('#10B981')}
              variant="outline"
              size="sm"
              className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
            >
              <RotateCw className="mr-1 h-4 w-4" />
              Rotation Équipe B
            </Button>
          </div>
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-3">
              <div className="text-xs text-amber-800 dark:text-amber-200">
                💡 <strong>Rotation:</strong> Les joueurs tournent dans le sens horaire (1→2→3→4→5→6→1)
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Informations de la phase */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Users className="mr-2 h-5 w-5" />
            Phase Tactique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nom de la phase
            </label>
            <input
              type="text"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
              placeholder="Ex: Formation défensive"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800">
              <CardContent className="p-3">
                <div className="font-medium text-violet-800 dark:text-violet-200 text-sm">Équipe A</div>
                <div className="text-violet-700 dark:text-violet-300 text-lg font-bold">
                  {currentPhase.players.filter(p => p.color === '#8B5CF6').length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-3">
                <div className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">Équipe B</div>
                <div className="text-emerald-700 dark:text-emerald-300 text-lg font-bold">
                  {currentPhase.players.filter(p => p.color === '#10B981').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <div className="font-medium text-sm">Mouvements enregistrés</div>
              <Badge variant="secondary" className="mt-1">
                {currentPhase.movements.length} mouvements
              </Badge>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Contrôles d'enregistrement */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Timer className="mr-2 h-5 w-5" />
            Enregistrement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Boutons principaux */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              className={isRecording ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {isRecording ? (
                <>
                  <Square className="mr-1 h-4 w-4" />
                  Arrêter
                </>
              ) : (
                <>
                  <Play className="mr-1 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>

            <Button
              onClick={clearMovements}
              disabled={currentPhase.movements.length === 0}
              variant="secondary"
              size="sm"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Statut d'enregistrement */}
          {isRecording && (
            <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <CardContent className="p-3">
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mr-2"></div>
                  <Badge variant="destructive" className="animate-pulse">
                    Enregistrement en cours...
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Contrôles de replay */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Play className="mr-2 h-5 w-5" />
            Replay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={isReplaying ? stopReplay : startReplay}
              disabled={currentPhase.movements.length === 0}
              variant="outline"
              size="sm"
            >
              {isReplaying ? (
                <>
                  <Pause className="mr-1 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1 h-4 w-4" />
                  Replay
                </>
              )}
            </Button>

            <Card className="bg-muted/50">
              <CardContent className="p-2 flex items-center justify-center">
                <Badge variant="secondary" className="font-mono text-xs">
                  {formatTime(replayTime)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Timeline du replay */}
          {currentPhase.movements.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Timeline</label>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{
                    width: `${Math.min(100, (replayTime / 30000) * 100)}%`
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {currentPhase.movements.length} mouvements • 30s max
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions de sauvegarde */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Save className="mr-2 h-5 w-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => setShowSaveDialog(true)}
            className="w-full"
            size="sm"
          >
            <Save className="mr-1 h-4 w-4" />
            Sauvegarder Phase
          </Button>

          <Button
            onClick={() => {
              // Export vers JSON
              const data = JSON.stringify(currentPhase, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${currentPhase.name}.json`;
              a.click();
            }}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Download className="mr-1 h-4 w-4" />
            Exporter JSON
          </Button>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-800">📊 Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Total joueurs:</span>
            <Badge variant="secondary">{currentPhase.players.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Mouvements:</span>
            <Badge variant="secondary">{currentPhase.movements.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Durée estimée:</span>
            <Badge variant="secondary" className="font-mono">
              {currentPhase.movements.length > 0
                ? formatTime(Math.max(...currentPhase.movements.map(m => m.timestamp)) || 0)
                : '0:00'
              }
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de sauvegarde */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 w-96 max-w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Sauvegarder la phase</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nom de la phase
              </label>
              <input
                type="text"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground font-medium"
                placeholder="Nom de la phase tactique"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowSaveDialog(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSavePhase}
                disabled={!phaseName.trim()}
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}