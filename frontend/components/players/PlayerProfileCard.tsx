'use client';

import { PlayerProfile } from '@/types/player';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Minus, Activity, Brain, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlayerProfileCardProps {
  player: PlayerProfile;
  compact?: boolean;
}

export default function PlayerProfileCard({ player, compact = false }: PlayerProfileCardProps) {
  const router = useRouter();
  const currentEval = player.currentEvaluation;

  if (!currentEval) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No evaluation data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getContractColor = (level: string) => {
    switch (level) {
      case 'starter': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rotation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'development': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'trial': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'injured': return 'bg-red-500';
      case 'suspended': return 'bg-orange-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 7) return 'text-green-600 dark:text-green-400';
    if (rating >= 5) return 'text-yellow-600 dark:text-yellow-400';
    if (rating >= 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 9) return 'bg-purple-100 dark:bg-purple-900/30';
    if (rating >= 7) return 'bg-green-100 dark:bg-green-900/30';
    if (rating >= 5) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (rating >= 3) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <Card
      className="w-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm cursor-pointer"
      onClick={() => router.push(`/players/${player.id}`)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          {/* Player Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage
                  src={player.avatar || undefined}
                  alt={`${player.firstName} ${player.lastName}`}
                />
                <AvatarFallback
                  className={`text-lg font-bold text-white`}
                  style={{ backgroundColor: getPositionColor(player.primaryPosition) }}
                >
                  {player.firstName[0]}{player.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getStatusColor(player.status)} border-2 border-white shadow-sm`} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {player.firstName} {player.lastName}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-xs font-medium"
                  style={{
                    backgroundColor: getPositionColor(player.primaryPosition) + '20',
                    color: getPositionColor(player.primaryPosition),
                    borderColor: getPositionColor(player.primaryPosition) + '40'
                  }}
                >
                  #{player.jerseyNumber} • {getPositionAbbreviation(player.primaryPosition)}
                </Badge>
                <Badge className={`text-xs ${getContractColor(player.contractLevel)}`}>
                  {player.contractLevel.charAt(0).toUpperCase() + player.contractLevel.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Overall Ratings */}
          <div className="text-right">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getRatingColor(currentEval.overallRating)}`}>
                  {currentEval.overallRating}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Overall</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getRatingColor(currentEval.potentialRating)}`}>
                  {currentEval.potentialRating}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Potential</div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!compact && (
          <>
            {/* Skills Overview */}
            <div className="grid grid-cols-3 gap-4">
              {/* Technical Skills */}
              <div className={`p-4 rounded-xl ${getRatingBg(7)} border border-opacity-20`}>
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">7.2</span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Technical</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Serving • Passing • Setting</div>
              </div>

              {/* Physical Attributes */}
              <div className={`p-4 rounded-xl ${getRatingBg(8)} border border-opacity-20`}>
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">8.1</span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Physical</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Power • Speed • Jump</div>
              </div>

              {/* Mental Attributes */}
              <div className={`p-4 rounded-xl ${getRatingBg(6)} border border-opacity-20`}>
                <div className="flex items-center justify-between mb-2">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">6.5</span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Mental</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">IQ • Leadership • Focus</div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {currentEval.strengths.slice(0, 3).map((strength, idx) => (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md border border-green-200 dark:border-green-800">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <TrendingDown className="h-4 w-4 text-orange-600 mr-2" />
                  Development Areas
                </h4>
                <div className="space-y-2">
                  {currentEval.improvementAreas.slice(0, 3).map((area, idx) => (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-md border border-orange-200 dark:border-orange-800">
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Notes */}
            {currentEval.notes && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coach Notes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {currentEval.notes}
                </p>
              </div>
            )}
          </>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
            Updated {new Date(currentEval.evaluationDate).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
