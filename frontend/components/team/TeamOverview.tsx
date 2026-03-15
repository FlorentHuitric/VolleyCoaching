'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Users, Trophy, Calendar, TrendingUp } from 'lucide-react';

interface TeamData {
  id: string;
  name: string;
  description?: string;
  level: string;
  season?: string;
  avatar?: string;
  playerCount?: number;
  teamProgression?: number;
  createdAt: string;
}

interface TeamOverviewProps {
  team: TeamData;
  onEdit: () => void;
}

export function TeamOverview({ team, onEdit }: TeamOverviewProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ELITE':
        return 'bg-purple-500';
      case 'SENIOR':
        return 'bg-blue-500';
      case 'JUNIOR':
        return 'bg-green-500';
      case 'YOUTH':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'ELITE':
        return 'Élite';
      case 'SENIOR':
        return 'Senior';
      case 'JUNIOR':
        return 'Junior';
      case 'YOUTH':
        return 'Jeunes';
      default:
        return level;
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Info Card */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={team.avatar} alt={team.name} />
                <AvatarFallback className="text-2xl">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-2">{team.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${getLevelColor(team.level)} text-white`}>
                    {getLevelLabel(team.level)}
                  </Badge>
                  {team.season && (
                    <Badge variant="outline">Saison {team.season}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </CardHeader>
        {team.description && (
          <CardContent>
            <p className="text-muted-foreground">{team.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Joueurs</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{team.playerCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">Niveau</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getLevelLabel(team.level)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Saison</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{team.season || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Progression</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${
              (team.teamProgression ?? 0) > 0
                ? 'text-green-500'
                : (team.teamProgression ?? 0) < 0
                  ? 'text-red-500'
                  : 'text-gray-500'
            }`}>
              {team.teamProgression !== undefined && team.teamProgression !== null
                ? `${team.teamProgression > 0 ? '+' : ''}${team.teamProgression}%`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
