'use client';

import { useState, useMemo } from 'react';
import { TrainingExercise, ExerciseFilters as IExerciseFilters } from '@/types/exercises';
import { TRAINING_EXERCISES } from '@/data/exercises';
import { filterExercises } from '@/services/trainingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ExerciseFilters from './ExerciseFilters';
import { Clock, Users, ChevronRight, Target, TrendingUp, Award } from 'lucide-react';

interface ExerciseLibraryProps {
  onExerciseSelect?: (exercise: TrainingExercise) => void;
  availablePlayerCount?: number;
  selectionMode?: boolean;
}

export default function ExerciseLibrary({
  onExerciseSelect,
  availablePlayerCount,
  selectionMode = false
}: ExerciseLibraryProps) {
  const [filters, setFilters] = useState<IExerciseFilters>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    return filterExercises(TRAINING_EXERCISES, filters);
  }, [filters]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical': return '💪';
      case 'technical': return '🎯';
      case 'tactical': return '🧠';
      case 'mental': return '🧘';
      default: return '📋';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ExerciseFilters
        filters={filters}
        onFiltersChange={setFilters}
        availablePlayerCount={availablePlayerCount}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {filteredExercises.length} exercice{filteredExercises.length !== 1 ? 's' : ''} trouvé{filteredExercises.length !== 1 ? 's' : ''}
        </h3>
      </div>

      {/* Exercise list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredExercises.map(exercise => (
          <Card
            key={exercise.id}
            className={`transition-all hover:shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${
              expandedId === exercise.id ? 'ring-2 ring-blue-500 dark:ring-blue-600' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                      {exercise.name}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.description}</p>
                </div>
                {selectionMode && onExerciseSelect && (
                  <Button
                    onClick={() => onExerciseSelect(exercise)}
                    size="sm"
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Ajouter
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Quick info badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                  {getDifficultyLabel(exercise.difficulty)}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {exercise.duration} min
                </Badge>
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                  <Users className="h-3 w-3 mr-1" />
                  {exercise.minPlayers}-{exercise.maxPlayers} joueurs
                </Badge>
              </div>

              {/* Skills improved */}
              {Object.entries(exercise.improvesSkills).filter(([, value]) => value && value >= 7).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Améliore fortement:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(exercise.improvesSkills)
                      .filter(([, value]) => value && value >= 7)
                      .map(([skill, value]) => {
                        const skillNames: Record<string, string> = {
                          serving: 'Service',
                          passing: 'Passe',
                          setting: 'Passe décisive',
                          attacking: 'Attaque',
                          blocking: 'Contre',
                          defense: 'Défense',
                          verticalJump: 'Détente',
                          speed: 'Vitesse',
                          agility: 'Agilité',
                          endurance: 'Endurance',
                          coordination: 'Coordination',
                          gameReading: 'Lecture de jeu'
                        };
                        return (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                          >
                            {skillNames[skill]} (+{value})
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {exercise.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Expand button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedId(expandedId === exercise.id ? null : exercise.id)}
                className="w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {expandedId === exercise.id ? 'Masquer les détails' : 'Voir les détails'}
                <ChevronRight
                  className={`h-4 w-4 ml-1 transition-transform ${
                    expandedId === exercise.id ? 'rotate-90' : ''
                  }`}
                />
              </Button>

              {/* Expanded content */}
              {expandedId === exercise.id && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  {/* Setup */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                      📐 Installation
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{exercise.setup}</p>
                  </div>

                  {/* Execution */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                      ▶️ Exécution
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{exercise.execution}</p>
                  </div>

                  {/* Coaching points */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                      💡 Points clés
                    </h5>
                    <ul className="list-disc list-inside space-y-1">
                      {exercise.coachingPoints.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Variations */}
                  {exercise.variations && exercise.variations.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                        🔄 Variations
                      </h5>
                      <ul className="list-disc list-inside space-y-1">
                        {exercise.variations.map((variation, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                            {variation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Equipment */}
                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                      🛠️ Matériel requis
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {exercise.equipment.map(item => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Success contract */}
                  {exercise.successContract && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                      <h5 className="font-semibold text-sm mb-1 text-yellow-900 dark:text-yellow-200 flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        Contrat de réussite
                      </h5>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        {exercise.successContract.description}
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        <Target className="h-3 w-3 inline mr-1" />
                        Target: {exercise.successContract.target}
                      </p>
                    </div>
                  )}

                  {/* Failure penalty */}
                  {exercise.failurePenalty && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                      <h5 className="font-semibold text-sm mb-1 text-red-900 dark:text-red-200">
                        ⚠️ Pénalités en cas d'échec
                      </h5>
                      <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                        {exercise.failurePenalty.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.failurePenalty.examples.map((penalty, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700"
                          >
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

        {filteredExercises.length === 0 && (
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Aucun exercice ne correspond à vos critères de recherche.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Essayez de modifier vos filtres pour voir plus de résultats.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
