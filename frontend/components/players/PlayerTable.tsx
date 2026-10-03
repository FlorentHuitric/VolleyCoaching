'use client';

import { PlayerProfile } from '@/types/player';
import { getPositionAbbreviation } from '@/utils/volleyballUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Edit,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  Eye
} from 'lucide-react';

interface PlayerTableProps {
  players: PlayerProfile[];
  onViewPlayer: (player: PlayerProfile) => void;
  onEditPlayer: (player: PlayerProfile) => void;
  onEvaluatePlayer: (player: PlayerProfile) => void;
  onExerciseEvaluation: (player: PlayerProfile) => void;
}

export default function PlayerTable({
  players,
  onViewPlayer,
  onEditPlayer,
  onEvaluatePlayer,
  onExerciseEvaluation
}: PlayerTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'injured':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'suspended':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getContractBadge = (level: string) => {
    const colors = {
      starter: 'bg-green-100 text-green-800 border-green-200',
      rotation: 'bg-blue-100 text-blue-800 border-blue-200',
      development: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      trial: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[level.toLowerCase() as keyof typeof colors] || colors.trial;
  };

  const getRatingTrend = (current: number, potential: number) => {
    const diff = potential - current;
    if (diff > 1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (diff < -1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 min-w-[760px] border-b bg-gray-50 dark:bg-gray-800 font-medium text-sm text-gray-700 dark:text-gray-300">
          <div className="col-span-3">Joueur</div>
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-1 text-center">Note</div>
          <div className="col-span-1 text-center">Pot</div>
          <div className="col-span-2">Contrat</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {players.map((player) => (
            <div
              key={player.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              {/* Joueur Info */}
              <div className="col-span-3 flex items-center space-x-3">
                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                  <AvatarImage
                    src={player.avatar || undefined}
                    alt={`${player.firstName} ${player.lastName}`}
                  />
                  <AvatarFallback className="text-sm font-bold">
                    {player.firstName[0]}{player.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {player.firstName} {player.lastName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {player.jerseyNumber == null ? 'N° à renseigner' : `#${player.jerseyNumber}`}
                    {player.assessmentKind === 'ESTIMATED' && <span className="block text-xs">Notes provisoires</span>}
                  </p>
                </div>
              </div>

              {/* Position */}
              <div className="col-span-1 flex items-center justify-center">
                <Badge variant="outline" className="text-xs">
                  {getPositionAbbreviation(player.primaryPosition)}
                </Badge>
              </div>

              {/* Note actuelle */}
              <div className="col-span-1 flex items-center justify-center">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-lg">
                    {player.currentEvaluation?.overallRating || '-'}
                  </span>
                  {player.currentEvaluation && getRatingTrend(
                    player.currentEvaluation.overallRating,
                    player.currentEvaluation.potentialRating
                  )}
                </div>
              </div>

              {/* Potentiel */}
              <div className="col-span-1 flex items-center justify-center">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {player.currentEvaluation?.potentialRating || '-'}
                </span>
              </div>

              {/* Contrat */}
              <div className="col-span-2 flex items-center">
                <Badge className={`text-xs ${getContractBadge(player.contractLevel)}`}>
                  {player.contractLevel.charAt(0).toUpperCase() + player.contractLevel.slice(1)}
                </Badge>
              </div>

              {/* Statut */}
              <div className="col-span-2 flex items-center space-x-2">
                {getStatusIcon(player.status)}
                <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                  {player.status === 'ACTIVE' ? 'Actif' :
                   player.status === 'INJURED' ? 'Blessé' :
                   player.status === 'SUSPENDED' ? 'Suspendu' : 'Inactif'}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Voir la fiche" onClick={() => onViewPlayer(player)}
                  className="h-8 w-8 p-0 opacity-100 transition-opacity"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Modifier le joueur" onClick={() => onEditPlayer(player)}
                  className="h-8 w-8 p-0 opacity-100 transition-opacity"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Évaluer le joueur" onClick={() => onEvaluatePlayer(player)}
                  className="h-8 w-8 p-0 opacity-100 transition-opacity text-purple-600"
                >
                  <Target className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MoreHorizontal className="w-8 h-8" />
              </div>
              <p>Aucun joueur trouvé</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}