'use client';

import { useState } from 'react';
import { useCourtStore, PhaseType } from '@/hooks/useCourtStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Pencil, Eraser } from 'lucide-react';
import { Input } from '@/components/ui/input';

const phaseTypeLabels: Record<PhaseType, string> = {
  service: '🏐 Service',
  reception: '📥 Réception',
  attack: '⚡ Attaque',
  defense: '🛡️ Défense',
  transition: '🔄 Formation',
};

export default function PhaseControls() {
  const {
    currentPhase,
    currentPhaseIndex,
    phases,
    nextPhase,
    previousPhase,
    duplicateCurrentPhase,
    deleteCurrentPhase,
    renameCurrentPhase,
    isDrawing,
    toggleDrawing,
    clearDrawings,
  } = useCourtStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const canGoPrevious = currentPhaseIndex > 0;
  const canGoNext = currentPhaseIndex < phases.length - 1;
  const canDelete = phases.length > 0;

  const handleRename = () => {
    if (isRenaming && newName.trim()) {
      renameCurrentPhase(newName.trim());
      setIsRenaming(false);
      setNewName('');
    } else {
      setNewName(currentPhase.name);
      setIsRenaming(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName('');
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={previousPhase}
          disabled={!canGoPrevious}
          className="h-9 w-9 p-0"
          title="Phase précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Nom de la phase */}
        <div className="flex items-center gap-2 min-w-[250px]">
          {isRenaming ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleRename}
              className="h-8 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {phaseTypeLabels[currentPhase.type]}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentPhase.name}
              </span>
            </>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={nextPhase}
          disabled={!canGoNext}
          className="h-9 w-9 p-0"
          title="Phase suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Outils de dessin */}
        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300 dark:border-gray-600">
          <Button
            size="sm"
            variant={isDrawing ? "default" : "outline"}
            onClick={toggleDrawing}
            className={`h-9 w-9 p-0 ${isDrawing ? 'bg-red-600 hover:bg-red-700' : ''}`}
            title="Mode dessin (activer/désactiver)"
          >
            <Pencil className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={clearDrawings}
            className="h-9 w-9 p-0"
            title="Effacer tous les dessins de cette phase"
          >
            <Eraser className="h-3 w-3" />
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRename}
          className="h-9 flex items-center gap-1"
          title="Renommer la phase"
        >
          <Edit2 className="h-3 w-3" />
          <span className="text-xs">Renommer</span>
        </Button>

        <Button
          size="sm"
          variant="default"
          onClick={duplicateCurrentPhase}
          className="h-9 flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
          title="Créer une nouvelle phase (duplique la phase actuelle)"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs font-medium">Nouvelle phase</span>
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={deleteCurrentPhase}
          disabled={!canDelete}
          className="h-9 w-9 p-0"
          title="Supprimer la phase actuelle"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Compteur */}
      {phases.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium min-w-[60px] text-right">
          {currentPhaseIndex + 1}/{phases.length}
        </div>
      )}
    </div>
  );
}
