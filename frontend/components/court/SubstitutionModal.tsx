'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, X } from 'lucide-react';
import { Player } from '@/hooks/useCourtStore';
import { BenchPlayer } from '@/hooks/useBenchPlayers';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';

interface SubstitutionModalProps {
  open: boolean;
  onClose: () => void;
  teamColor: string;
  teamName: string;
  playersOnCourt: Player[];
  benchPlayers: BenchPlayer[];
  onSubstitute: (courtPlayerId: string, benchPlayerId: string) => void;
}

export default function SubstitutionModal({
  open,
  onClose,
  teamColor,
  teamName,
  playersOnCourt,
  benchPlayers,
  onSubstitute,
}: SubstitutionModalProps) {
  const [selectedCourtPlayer, setSelectedCourtPlayer] = useState<Player | null>(null);
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState<BenchPlayer | null>(null);

  const handleSubstitute = () => {
    if (!selectedCourtPlayer || !selectedBenchPlayer) return;

    onSubstitute(selectedCourtPlayer.id, selectedBenchPlayer.id);

    // Reset selection
    setSelectedCourtPlayer(null);
    setSelectedBenchPlayer(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedCourtPlayer(null);
    setSelectedBenchPlayer(null);
    onClose();
  };

  const canSubstitute = selectedCourtPlayer && selectedBenchPlayer;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Changement de joueur - {teamName}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un joueur sur le terrain et un joueur sur le banc pour effectuer un changement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Joueurs sur le terrain */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teamColor }}
              />
              Joueurs sur le terrain ({playersOnCourt.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {playersOnCourt.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedCourtPlayer(player)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedCourtPlayer?.id === player.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback className="text-xs">
                      #{player.jerseyNumber}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{player.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="px-1 py-0 text-xs"
                        style={{
                          backgroundColor: getPositionColor(player.volleyballPosition),
                          borderColor: getPositionColor(player.volleyballPosition),
                          color: 'white'
                        }}
                      >
                        {getPositionAbbreviation(player.volleyballPosition)}
                      </Badge>
                      <span>Pos {player.courtPosition}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Flèche d'échange */}
          {canSubstitute && (
            <div className="flex justify-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                <ArrowLeftRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          )}

          {/* Joueurs sur le banc */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-gray-400" />
              Joueurs sur le banc ({benchPlayers.length})
            </h3>
            {benchPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                Aucun joueur disponible sur le banc
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {benchPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedBenchPlayer(player)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedBenchPlayer?.id === player.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback className="text-xs">
                        #{player.jerseyNumber}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        <Badge
                          variant="outline"
                          className="px-1 py-0 text-xs"
                        >
                          {player.primaryPosition}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCourtPlayer && selectedBenchPlayer ? (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  ✓ Prêt à échanger {selectedCourtPlayer.name} ↔ {selectedBenchPlayer.firstName} {selectedBenchPlayer.lastName}
                </span>
              ) : (
                <span>
                  Sélectionnez 1 joueur sur le terrain et 1 joueur sur le banc
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
              <Button
                onClick={handleSubstitute}
                disabled={!canSubstitute}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Effectuer le changement
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
