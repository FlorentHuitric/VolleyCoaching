'use client';

import { useState, useEffect } from 'react';
import { Exercise, ExerciseResult, EvaluationSession } from '@/types/exercises';
import { PlayerProfile, SkillRating } from '@/types/player';
import { EXERCICES_EVALUATION, TEMPLATES_EVALUATION_POSITION } from '@/data/exercices-evaluation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, CheckCircle, Clock, Target, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';

interface ExerciseEvaluationFormProps {
  player: PlayerProfile;
  onComplete: (session: EvaluationSession) => void;
  onCancel: () => void;
}

interface ExerciseStepProps {
  exercise: Exercise;
  onComplete: (result: ExerciseResult) => void;
  onBack: () => void;
  playerId: string;
}

function ExerciseStep({ exercise, onComplete, onBack, playerId }: ExerciseStepProps) {
  const [resultats, setResultats] = useState<Record<string, number | boolean>>({});
  const [commentaires, setCommentaires] = useState('');
  const [conditions, setConditions] = useState({
    surface: 'parquet' as const,
    ballon: 'officiel' as const,
    temperature: 20,
    humidite: 50
  });

  const calculerNote = (): SkillRating => {
    // Logique de calcul basée sur le barème de notation
    const mesurePrincipale = exercise.mesures[0];
    const valeur = resultats[mesurePrincipale.nom] as number;

    if (!valeur) return 1;

    const { baremeNotation } = exercise;

    if (valeur >= baremeNotation.excellent.min && valeur <= baremeNotation.excellent.max) {
      return baremeNotation.excellent.note;
    }
    if (valeur >= baremeNotation.bon.min && valeur <= baremeNotation.bon.max) {
      return baremeNotation.bon.note;
    }
    if (valeur >= baremeNotation.moyen.min && valeur <= baremeNotation.moyen.max) {
      return baremeNotation.moyen.note;
    }
    return baremeNotation.faible.note;
  };

  const handleSubmit = () => {
    const result: ExerciseResult = {
      exerciceId: exercise.id,
      playerId,
      dateExecution: new Date(),
      resultats,
      noteCalculee: calculerNote(),
      commentaires: commentaires || undefined,
      conditions
    };
    onComplete(result);
  };

  const getNoteColor = (note: SkillRating) => {
    if (note >= 9) return 'text-purple-600 bg-purple-100';
    if (note >= 7) return 'text-green-600 bg-green-100';
    if (note >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const notePreview = calculerNote();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête de l'exercice */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-blue-600" />
                <span>{exercise.nom}</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{exercise.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{exercise.dureeMinutes} min</span>
              </Badge>
              <Badge className={`px-3 py-1 ${getNoteColor(notePreview)}`}>
                Note: {notePreview}/10
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Matériel requis:</h4>
              <div className="flex flex-wrap gap-2">
                {exercise.materielRequis.map((materiel, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {materiel}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Procédure:</h4>
              <ol className="space-y-2">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saisie des résultats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saisie des Résultats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercise.mesures.map((mesure, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mesure.nom}
                  <span className="text-gray-500 dark:text-gray-400 ml-2">({mesure.unite})</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{mesure.description}</p>

                {mesure.typeValeur === 'boolean' ? (
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={mesure.nom}
                        value="true"
                        onChange={() => setResultats(prev => ({ ...prev, [mesure.nom]: true }))}
                        className="mr-2"
                      />
                      Oui
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={mesure.nom}
                        value="false"
                        onChange={() => setResultats(prev => ({ ...prev, [mesure.nom]: false }))}
                        className="mr-2"
                      />
                      Non
                    </label>
                  </div>
                ) : (
                  <input
                    type="number"
                    min={mesure.valeurMin}
                    max={mesure.valeurMax}
                    step={mesure.typeValeur === 'temps' ? 0.1 : 1}
                    value={typeof resultats[mesure.nom] === "number" ? resultats[mesure.nom] as number : 0}
                    onChange={(e) => setResultats(prev => ({
                      ...prev,
                      [mesure.nom]: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`${mesure.valeurMin || 0} - ${mesure.valeurMax || 100}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Conditions d'évaluation */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Conditions d'évaluation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Surface</label>
                <select
                  value={conditions.surface}
                  onChange={(e) => setConditions(prev => ({ ...prev, surface: e.target.value as any }))}
                  className="w-full text-sm px-2 py-1 border rounded"
                >
                  <option value="parquet">Parquet</option>
                  <option value="synthetique">Synthétique</option>
                  <option value="exterieur">Extérieur</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Ballon</label>
                <select
                  value={conditions.ballon}
                  onChange={(e) => setConditions(prev => ({ ...prev, ballon: e.target.value as any }))}
                  className="w-full text-sm px-2 py-1 border rounded"
                >
                  <option value="officiel">Officiel</option>
                  <option value="entrainement">Entraînement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Température (°C)</label>
                <input
                  type="number"
                  value={conditions.temperature}
                  onChange={(e) => setConditions(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                  className="w-full text-sm px-2 py-1 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Humidité (%)</label>
                <input
                  type="number"
                  value={conditions.humidite}
                  onChange={(e) => setConditions(prev => ({ ...prev, humidite: parseInt(e.target.value) }))}
                  className="w-full text-sm px-2 py-1 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Commentaires (optionnel)
            </label>
            <textarea
              value={commentaires}
              onChange={(e) => setCommentaires(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Observations techniques, points d'amélioration..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Barème de notation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Barème de Notation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg border">
              <div className="text-purple-600 font-bold">9-10</div>
              <div className="text-sm text-purple-800">Excellent</div>
              <div className="text-xs text-purple-600">
                {exercise.baremeNotation.excellent.min}-{exercise.baremeNotation.excellent.max}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border">
              <div className="text-green-600 font-bold">7-8</div>
              <div className="text-sm text-green-800">Bon</div>
              <div className="text-xs text-green-600">
                {exercise.baremeNotation.bon.min}-{exercise.baremeNotation.bon.max}
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border">
              <div className="text-yellow-600 font-bold">5-6</div>
              <div className="text-sm text-yellow-800">Moyen</div>
              <div className="text-xs text-yellow-600">
                {exercise.baremeNotation.moyen.min}-{exercise.baremeNotation.moyen.max}
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border">
              <div className="text-red-600 font-bold">3-4</div>
              <div className="text-sm text-red-800">Faible</div>
              <div className="text-xs text-red-600">
                {exercise.baremeNotation.faible.min}-{exercise.baremeNotation.faible.max}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(resultats).length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Valider l'Exercice
        </Button>
      </div>
    </div>
  );
}

export default function ExerciseEvaluationForm({ player, onComplete, onCancel }: ExerciseEvaluationFormProps) {
  const [currentStep, setCurrentStep] = useState<'selection' | 'exercise' | 'summary'>('selection');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedResults, setCompletedResults] = useState<ExerciseResult[]>([]);
  const [session, setSession] = useState<EvaluationSession>({
    id: `eval_${Date.now()}`,
    playerId: player.id,
    evaluateurId: 'coach1',
    dateDebut: new Date(),
    exercicesRealises: [],
    recommandations: [],
    prochainObjectifs: []
  });

  // Template suggéré pour la position du joueur
  const template = TEMPLATES_EVALUATION_POSITION.find(t => t.position === player.primaryPosition);
  const exercicesDisponibles = EXERCICES_EVALUATION.filter(e =>
    e.positionsApplicables.includes(player.primaryPosition)
  );

  useEffect(() => {
    if (template) {
      setSelectedExercises(template.exercicesObligatoires);
    }
  }, [template]);

  const handleExerciseComplete = (result: ExerciseResult) => {
    const newResults = [...completedResults, result];
    setCompletedResults(newResults);

    if (currentExerciseIndex < selectedExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Tous les exercices terminés, passer au résumé
      const finalSession: EvaluationSession = {
        ...session,
        dateFin: new Date(),
        exercicesRealises: newResults,
        noteGlobale: Math.round(
          newResults.reduce((sum, r) => sum + r.noteCalculee, 0) / newResults.length
        ) as SkillRating,
        recommandations: ['Continuer le travail technique', 'Améliorer les points faibles identifiés'],
        prochainObjectifs: ['Progresser sur les exercices en-dessous de 7/10']
      };
      setSession(finalSession);
      setCurrentStep('summary');
    }
  };

  if (currentStep === 'exercise') {
    const currentExercise = EXERCICES_EVALUATION.find(e => e.id === selectedExercises[currentExerciseIndex]);
    if (!currentExercise) return null;

    return (
      <ExerciseStep
        exercise={currentExercise}
        onComplete={handleExerciseComplete}
        onBack={() => {
          if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev - 1);
          } else {
            setCurrentStep('selection');
          }
        }}
        playerId={player.id}
      />
    );
  }

  if (currentStep === 'summary') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-gold-600" />
              <span>Résumé d'Évaluation - {player.firstName} {player.lastName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">{session.noteGlobale}/10</div>
              <div className="text-lg text-gray-700">Note Globale</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Résultats par Exercice</h4>
                <div className="space-y-2">
                  {completedResults.map((result, idx) => {
                    const exercise = EXERCICES_EVALUATION.find(e => e.id === result.exerciceId);
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">{exercise?.nom}</span>
                        <Badge className={`${result.noteCalculee >= 7 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {result.noteCalculee}/10
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recommandations</h4>
                <div className="space-y-2">
                  {session.recommandations.map((rec, idx) => (
                    <div key={idx} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button onClick={() => onComplete(session)} className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Enregistrer l'Évaluation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Étape de sélection des exercices
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <PlayCircle className="h-6 w-6 text-blue-600" />
            <span>Évaluation par Exercices - {player.firstName} {player.lastName}</span>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Position: {player.primaryPosition} • Durée estimée: {template?.dureeEstimeeMinutes || 60} minutes
          </p>
        </CardHeader>
      </Card>

      {template && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Suggéré: {template.nom}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-3 text-green-700">Exercices Obligatoires</h4>
                <div className="space-y-2">
                  {template.exercicesObligatoires.map(exerciceId => {
                    const exercice = EXERCICES_EVALUATION.find(e => e.id === exerciceId);
                    return exercice && (
                      <div key={exerciceId} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                        <span className="text-sm font-medium">{exercice.nom}</span>
                        <Badge variant="outline" className="text-xs">{exercice.dureeMinutes} min</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3 text-blue-700">Exercices Optionnels</h4>
                <div className="space-y-2">
                  {template.exercicesOptionels.map(exerciceId => {
                    const exercice = EXERCICES_EVALUATION.find(e => e.id === exerciceId);
                    const isSelected = selectedExercises.includes(exerciceId);
                    return exercice && (
                      <div
                        key={exerciceId}
                        className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedExercises(prev => prev.filter(id => id !== exerciceId));
                          } else {
                            setSelectedExercises(prev => [...prev, exerciceId]);
                          }
                        }}
                      >
                        <span className="text-sm font-medium">{exercice.nom}</span>
                        <Badge variant="outline" className="text-xs">{exercice.dureeMinutes} min</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          onClick={() => setCurrentStep('exercise')}
          disabled={selectedExercises.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Commencer l'Évaluation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
