'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_TEAMS } from '@/graphql/queries/teams';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Team {
  id: string;
  name: string;
  level: string;
  playerCount?: number;
}

interface TeamSelectorProps {
  currentTeamId: string | null;
  onTeamChange: (teamId: string) => void;
  onCreateTeam?: () => void;
}

export function TeamSelector({
  currentTeamId,
  onTeamChange,
  onCreateTeam,
}: TeamSelectorProps) {
  const { data, loading, error } = useQuery(GET_MY_TEAMS);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (error) {
    console.error('Error fetching teams:', error);
    return null;
  }

  const teams: Team[] = data?.myTeams || [];

  if (teams.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Aucune équipe
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentTeamId || ""} onValueChange={onTeamChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sélectionner une équipe" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              <div className="flex items-center justify-between w-full">
                <span>{team.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({team.playerCount || 0} joueurs)
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {onCreateTeam && (
        <Button onClick={onCreateTeam} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle équipe
        </Button>
      )}
    </div>
  );
}
