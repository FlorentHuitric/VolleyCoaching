'use client';

import { TrainingSession } from '@/types/exercises';
import { getExerciseById } from '@/services/trainingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Users,
  Target,
  Play,
  Edit,
  Trash2,
  CheckCircle2,
  Circle
} from 'lucide-react';

interface TrainingSessionDisplayProps {
  session: TrainingSession;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkComplete?: () => void;
}

export default function TrainingSessionDisplay({
  session,
  onEdit,
  onDelete,
  onMarkComplete
}: TrainingSessionDisplayProps) {
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'warmup': return '🏃';
      case 'stretching': return '🧘';
      case 'technical': return '🎯';
      case 'intense': return '💥';
      case 'game': return '🏐';
      default: return '📋';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'warmup': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'stretching': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'technical': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'intense': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'game': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'advanced': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'expert': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card text-foreground border-border">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center space-x-2 mb-2">
                {session.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-300" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
                <CardTitle className="text-2xl">{session.name}</CardTitle>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{session.duration} minutes</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{session.playersIds.length} joueur(s)</span>
                </span>
              </div>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              {!session.completed && onMarkComplete && (
                <Button
                  onClick={onMarkComplete}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Marquer terminé
                </Button>
              )}
              {onEdit && (
                <Button
                  onClick={onEdit}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={onDelete}
                  size="sm"
                  variant="outline"
                  className="bg-red-500/20 border-red-300 text-white hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Difficulté</div>
            <Badge className={getDifficultyColor(session.difficulty)}>
              {({beginner:"Débutant",intermediate:"Intermédiaire",advanced:"Avancé",expert:"Expert"})[session.difficulty]}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phases</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {session.phases.length} phase(s)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Statut</div>
            <Badge
              className={
                session.completed
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
              }
            >
              {session.completed ? 'Terminé' : 'À venir'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Objectives */}
      {session.objectives && session.objectives.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2 text-gray-900 dark:text-gray-100">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Objectifs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {session.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Phases */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Déroulement de la séance</span>
        </h3>

        {[...session.phases]
          .sort((a, b) => a.order - b.order)
          .map((phase, phaseIdx) => (
            <Card
              key={phase.id}
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getPhaseIcon(phase.phase)}</div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        Phase {phaseIdx + 1}: {phase.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {phase.duration} minutes
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPhaseColor(phase.phase)}>
                    {phase.name}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {phase.exercises.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Créneau à préparer par le coach : aucun exercice adapté dans la bibliothèque.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {phase.exercises.map((phaseEx, exIdx) => {
                      const exercise = session.exerciseSnapshots?.[phaseEx.exerciseId] || getExerciseById(phaseEx.exerciseId);
                      if (!exercise) return null;

                      return (
                        <div
                          key={exIdx}
                          className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {exIdx + 1}. {exercise.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {exercise.description}
                              </p>
                              {exercise.execution&&<p className="mt-2 text-sm text-foreground">{exercise.execution}</p>}
                              {exercise.equipment.length>0&&<p className="mt-2 text-xs text-muted-foreground">Matériel : {exercise.equipment.join(', ')}</p>}
                              {exercise.media?.map(media=><a key={media.url} href={media.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center text-sm font-medium text-primary underline">Voir la vidéo de l’exercice ↗</a>)}
                              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {phaseEx.duration} min
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {phaseEx.groups&&phaseEx.groups>1?`${phaseEx.groups} ateliers d’environ ${Math.ceil(session.playersIds.length/phaseEx.groups)} joueurs`:`${session.playersIds.length} joueurs`}
                                </span>
                              </div>
                              {phaseEx.notes && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                                  💡 {phaseEx.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Notes */}
      {session.notes && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-200 mb-2">
              📝 Notes
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">{session.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
