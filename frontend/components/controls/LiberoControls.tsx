'use client';

import { useCourtStore } from '@/hooks/useCourtStore';
import { useBenchPlayers } from '@/hooks/useBenchPlayers';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LiberoControlsProps {
  teamColor: string; // '#8B5CF6' pour A, '#10B981' pour B
  teamName: string; // 'A' ou 'B'
}

export default function LiberoControls({ teamColor, teamName }: LiberoControlsProps) {
  const {
    currentPhase,
    liberoEnabled,
    liberoPlayerId,
    liberoReplacesVolleyballPosition,
    liberoTeamColor,
    toggleLibero,
    setLiberoPlayer,
    setLiberoReplacesVolleyballPosition,
  } = useCourtStore();

  // Récupérer les joueurs du banc (pas sur le terrain)
  const { benchPlayers, isLoading } = useBenchPlayers();

  // Vérifier si le libéro est actif pour cette équipe
  const isLiberoActiveForThisTeam = liberoEnabled && liberoTeamColor === teamColor;

  const handleToggleLibero = () => {
    toggleLibero(teamColor);
  };

  const handleSelectLibero = (benchPlayerId: string) => {
    // Trouver le joueur du banc sélectionné
    const benchPlayer = benchPlayers.find(p => p.id === benchPlayerId);
    if (benchPlayer) {
      // Stocker tout le joueur du banc, pas seulement l'ID
      setLiberoPlayer(benchPlayerId, benchPlayer, teamColor);
    }
  };

  const handleSelectVolleyballPosition = (vPosition: string) => {
    setLiberoReplacesVolleyballPosition(vPosition as any);
  };

  const borderColor = teamColor === '#8B5CF6' ? 'border-violet-200' : 'border-emerald-200';
  const bgColor = teamColor === '#8B5CF6' ? 'bg-violet-50' : 'bg-emerald-50';
  const textColor = teamColor === '#8B5CF6' ? 'text-violet-800' : 'text-emerald-800';
  const darkBgColor = teamColor === '#8B5CF6' ? 'dark:bg-violet-900/30' : 'dark:bg-emerald-900/30';

  return (
    <div className={`space-y-3 ${bgColor} ${darkBgColor} ${borderColor} border rounded-lg p-3`}>
      {/* Header avec checkbox */}
      <div className="flex items-center space-x-3">
        <Checkbox
          id={`libero-${teamName}`}
          checked={isLiberoActiveForThisTeam}
          onCheckedChange={handleToggleLibero}
        />
        <Label
          htmlFor={`libero-${teamName}`}
          className={`flex items-center space-x-2 cursor-pointer ${textColor} font-medium`}
        >
          <Shield className="h-4 w-4" />
          <span>Libéro Équipe {teamName}</span>
        </Label>
      </div>

      {/* Sélections (visible uniquement si activé) */}
      {isLiberoActiveForThisTeam && (
        <div className="space-y-3 pl-6">
          {/* Message si pas de joueurs sur le banc */}
          {benchPlayers.length === 0 && !isLoading && (
            <div className="flex items-start space-x-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 rounded p-2">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Aucun joueur disponible sur le banc. Ajoutez des joueurs à votre équipe.</span>
            </div>
          )}

          {/* Sélection du joueur libéro */}
          {benchPlayers.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600 dark:text-gray-400">
                Joueur Libéro (du banc)
              </Label>
              <Select
                value={liberoPlayerId || undefined}
                onValueChange={handleSelectLibero}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Sélectionner un joueur" />
                </SelectTrigger>
                <SelectContent>
                  {benchPlayers.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jerseyNumber} {player.firstName} {player.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sélection du poste volleyball remplacé */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Remplace les joueurs du poste
            </Label>
            <Select
              value={liberoReplacesVolleyballPosition || undefined}
              onValueChange={handleSelectVolleyballPosition}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Sélectionner un poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MIDDLE_BLOCKER">Central (MB)</SelectItem>
                <SelectItem value="OUTSIDE_HITTER">Attaquant Réceptionneur (OH)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Indicateur de configuration complète */}
          {liberoPlayerId && liberoReplacesVolleyballPosition && (
            <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded p-2">
              <Check className="h-3 w-3" />
              <span>Configuration complète</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
