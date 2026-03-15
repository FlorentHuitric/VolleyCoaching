'use client';

import { useState } from 'react';
import { PlayerType } from '@/types/player';

// Type alias for backward compatibility
type PlayerProfile = PlayerType;
import { EvaluationSession } from '@/types/evaluation-tests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useEvaluationHistory } from '@/hooks/useEvaluations';
import {
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface EvaluationHistoryProps {
  players: PlayerProfile[];
}

export default function EvaluationHistory({ players }: EvaluationHistoryProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // Get evaluation history for selected player or all players
  const { data: historyData, loading, error } = useEvaluationHistory(
    selectedPlayerId !== 'all' ? selectedPlayerId : players[0]?.id || ''
  );

  // If "all" selected, we'd need to query multiple players - for now just show message
  const evaluations = selectedPlayerId === 'all' 
    ? [] 
    : (historyData?.evaluationHistory || []);

  const sortedSessions = [...evaluations].sort((a, b) =>
    new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
  );

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Filtrer par joueur:</label>
            <select
              className="p-2 border rounded-md bg-white dark:bg-gray-800"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
            >
              <option value="all">Tous les joueurs</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.firstName} {player.lastName}
                </option>
              ))}
            </select>
            <Badge variant="outline" className="ml-auto">
              {sortedSessions.length} évaluation(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Chargement de l'historique...</span>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center text-red-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <p>Erreur lors du chargement de l'historique</p>
            <p className="text-sm mt-2">{error.message}</p>
          </CardContent>
        </Card>
      ) : selectedPlayerId === 'all' ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Sélectionnez un joueur pour voir son historique</p>
          </CardContent>
        </Card>
      ) : sortedSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Aucune évaluation trouvée</p>
            <p className="text-sm mt-2">Commencez par créer une nouvelle évaluation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map(session => {
            const player = players.find(p => p.id === session.playerId);
            if (!player) return null;

            const isExpanded = expandedSessions.has(session.id);
            const statusColors = {
              draft: 'bg-gray-100 text-gray-800',
              in_progress: 'bg-blue-100 text-blue-800',
              completed: 'bg-green-100 text-green-800'
            };

            return (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={player.avatar || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white font-bold">
                          {player.jerseyNumber}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {player.firstName} {player.lastName}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {session.duration > 0 && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{session.duration} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[session.status as keyof typeof statusColors]}>
                        {session.status === 'draft' && 'Brouillon'}
                        {session.status === 'in_progress' && 'En cours'}
                        {session.status === 'completed' && 'Terminée'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSession(session.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    {/* Tests Completed */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tests réalisés ({session.tests.length}):</h4>
                      <div className="flex flex-wrap gap-2">
                        {session.tests.map((test: any, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {test.testId.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Coach Notes */}
                    {session.coachNotes && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notes de l'entraîneur:</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          {session.coachNotes}
                        </p>
                      </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    {(session.strengths.length > 0 || session.weaknesses.length > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        {session.strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">
                              ✅ Points forts:
                            </h4>
                            <ul className="text-sm space-y-1">
                              {session.strengths.map((strength: string, idx: number) => (
                                <li key={idx} className="text-gray-600 dark:text-gray-400">
                                  • {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {session.weaknesses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-orange-700 dark:text-orange-400">
                              ⚠️ À améliorer:
                            </h4>
                            <ul className="text-sm space-y-1">
                              {session.weaknesses.map((weakness: string, idx: number) => (
                                <li key={idx} className="text-gray-600 dark:text-gray-400">
                                  • {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    {session.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Recommandations:</span>
                        </h4>
                        <ul className="text-sm space-y-1">
                          {session.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
