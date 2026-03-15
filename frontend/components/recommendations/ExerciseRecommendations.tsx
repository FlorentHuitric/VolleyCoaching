'use client';

import { PlayerType } from '@/types/player';
import { ExerciseRecommendation } from '@/types/exercises';
import { getRecommendationsForPlayer } from '@/services/recommendationService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Clock, Users, Target, TrendingUp, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ExerciseRecommendationsProps {
  player: PlayerType;
  limit?: number;
}

export default function ExerciseRecommendations({
  player,
  limit = 5
}: ExerciseRecommendationsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const recommendations = getRecommendationsForPlayer(player, limit);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>Aucune recommandation disponible pour le moment.</p>
          <p className="text-sm mt-1">Complétez une évaluation pour obtenir des recommandations personnalisées.</p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'Priorité haute';
      case 'medium': return 'Priorité moyenne';
      case 'low': return 'Complémentaire';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical': return '💪';
      case 'technical': return '🎯';
      case 'tactical': return '🧠';
      case 'mental': return '🧘';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Award className="h-5 w-5 text-blue-600" />
          <span>Exercices recommandés</span>
        </h3>
        <Badge variant="outline" className="text-xs">
          {recommendations.length} exercices
        </Badge>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec: ExerciseRecommendation) => (
          <Card
            key={rec.exercise.id}
            className={`transition-all ${
              expanded === rec.exercise.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{getCategoryIcon(rec.exercise.category)}</span>
                    <h4 className="font-semibold text-base">{rec.exercise.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rec.exercise.description}
                  </p>
                </div>
                <Badge className={`${getPriorityColor(rec.priority)} text-white ml-2`}>
                  {getPriorityLabel(rec.priority)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              {/* Quick Info */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className={getDifficultyColor(rec.exercise.difficulty)}>
                  {rec.exercise.difficulty === 'beginner' && '🟢 Débutant'}
                  {rec.exercise.difficulty === 'intermediate' && '🟡 Intermédiaire'}
                  {rec.exercise.difficulty === 'advanced' && '🟠 Avancé'}
                  {rec.exercise.difficulty === 'expert' && '🔴 Expert'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {rec.exercise.duration} min
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {rec.exercise.minPlayers}-{rec.exercise.maxPlayers} joueurs
                </Badge>
              </div>

              {/* Reason */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Pourquoi cet exercice?</strong> {rec.reason}
                </p>
              </div>

              {/* Targeted Weaknesses */}
              {rec.targetedWeaknesses.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Cible:</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.targetedWeaknesses.map((weakness) => (
                      <Badge key={weakness} variant="outline" className="text-xs bg-red-50 text-red-700 dark:bg-red-900/20">
                        <Target className="h-3 w-3 mr-1" />
                        {weakness.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Improvement */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
                <p className="text-sm text-green-900 dark:text-green-200 flex items-start">
                  <TrendingUp className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Progression attendue:</strong> {rec.expectedImprovement}</span>
                </p>
              </div>

              {/* Expand/Collapse Details */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(expanded === rec.exercise.id ? null : rec.exercise.id)}
                className="w-full"
              >
                {expanded === rec.exercise.id ? 'Masquer les détails' : 'Voir les détails'}
                <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expanded === rec.exercise.id ? 'rotate-90' : ''}`} />
              </Button>

              {/* Expanded Details */}
              {expanded === rec.exercise.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Setup */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2">📐 Installation</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rec.exercise.setup}</p>
                  </div>

                  {/* Execution */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2">▶️ Exécution</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rec.exercise.execution}</p>
                  </div>

                  {/* Coaching Points */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2">💡 Points clés</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {rec.exercise.coachingPoints.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Variations */}
                  {rec.exercise.variations && rec.exercise.variations.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2">🔄 Variations</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.exercise.variations.map((variation, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{variation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Equipment */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2">🛠️ Matériel requis</h5>
                    <div className="flex flex-wrap gap-2">
                      {rec.exercise.equipment.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Success Contract */}
                  {rec.exercise.successContract && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-sm mb-1 text-yellow-900 dark:text-yellow-200">
                        🎯 Contrat de réussite
                      </h5>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        {rec.exercise.successContract.description}
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        Target: {rec.exercise.successContract.target}
                      </p>
                    </div>
                  )}

                  {/* Failure Penalty */}
                  {rec.exercise.failurePenalty && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      <h5 className="font-semibold text-sm mb-1 text-red-900 dark:text-red-200">
                        ⚠️ Pénalités en cas d'échec
                      </h5>
                      <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                        {rec.exercise.failurePenalty.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rec.exercise.failurePenalty.examples.map((penalty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-red-100 dark:bg-red-900/40">
                            {penalty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
