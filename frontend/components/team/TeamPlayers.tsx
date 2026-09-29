'use client';
import type { VolleyballPosition } from '@/hooks/useCourtStore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import Link from 'next/link';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';

interface SimplePlayer {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  primaryPosition?: VolleyballPosition;
  currentRating?: number;
}

interface TeamPlayersProps {
  players: SimplePlayer[];
  onAddPlayer: () => void;
}

export function TeamPlayers({ players, onAddPlayer }: TeamPlayersProps) {
  const getRatingColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Joueurs de l'équipe</h2>
        <Button onClick={onAddPlayer} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un joueur
        </Button>
      </div>

      {players.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucun joueur dans cette équipe
            </p>
            <Button onClick={onAddPlayer} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier joueur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar} alt={`${player.firstName} ${player.lastName}`} />
                      <AvatarFallback>
                        {player.firstName[0]}{player.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {player.firstName} {player.lastName}
                      </CardTitle>
                      {player.primaryPosition && (
                        <Badge
                          variant="outline"
                          className={`mt-1 ${getPositionColor(player.primaryPosition)}`}
                        >
                          {getPositionAbbreviation(player.primaryPosition)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Note globale
                    </span>
                    <span className={`text-2xl font-bold ${getRatingColor(player.currentRating)}`}>
                      {player.currentRating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
