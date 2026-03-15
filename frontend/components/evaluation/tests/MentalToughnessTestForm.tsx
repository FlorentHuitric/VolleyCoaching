'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Timer, Plus, Trash2 } from 'lucide-react';

/**
 * Mental Toughness Test Form
 * 
 * Évalue la capacité du joueur à performer sous pression et à gérer ses émotions.
 * 
 * Structure du test:
 * - 5 scénarios de pression simulés (situations de match critiques)
 * - Pour chaque scénario: performance rating (1-5) + temps de récupération émotionnelle
 * - Contrôle émotionnel global (échelle 1-5)
 * - Notes d'observation du coach
 * 
 * Durée: 40 minutes
 * 
 * Standards:
 * - Elite: Performance moyenne >4.0, récupération <30s, contrôle émotionnel >4.0
 * - Advanced: Performance 3.5-4.0, récupération 30-60s, contrôle 3.5-4.0
 * - Good: Performance 3.0-3.5, récupération 60-90s, contrôle 3.0-3.5
 * - Developing: Performance <3.0, récupération >90s, contrôle <3.0
 */

interface PressureScenario {
  id: string;
  situation: string;
  description: string;
  performanceRating: number; // 1-5 scale
  recoveryTime: number; // seconds
  emotionalResponse: string; // observation notes
}

interface MentalToughnessTestFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const PRESSURE_SCENARIOS = [
  {
    id: 'match_point_against',
    situation: 'Match point contre vous (24-25)',
    description: 'Service décisif pour sauver le match. Simuler la pression et observer la performance.',
  },
  {
    id: 'comeback_needed',
    situation: 'Retard important (10-18 au 5ème set)',
    description: 'Équipe démoralisée, besoin de leadership. Observer la réaction et l\'engagement.',
  },
  {
    id: 'after_major_error',
    situation: 'Après une erreur coûteuse (ace manqué)',
    description: 'Vient de faire une erreur qui a coûté un set. Comment réagit-il au point suivant ?',
  },
  {
    id: 'hostile_environment',
    situation: 'Environnement hostile (arbitre contesté)',
    description: 'Décision arbitrale défavorable. Capacité à rester concentré malgré la frustration.',
  },
  {
    id: 'final_pressure',
    situation: 'Finale de tournoi (tie-break 14-14)',
    description: 'Action décisive en finale. Maximum de pression et d\'attentes.',
  },
];

export default function MentalToughnessTestForm({
  onComplete,
  onCancel,
  initialData,
}: MentalToughnessTestFormProps) {
  const [scenarios, setScenarios] = useState<PressureScenario[]>(
    initialData?.scenarios || []
  );
  const [overallEmotionalControl, setOverallEmotionalControl] = useState<number>(
    initialData?.overallEmotionalControl || 3
  );
  const [generalNotes, setGeneralNotes] = useState(initialData?.generalNotes || '');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  // État du scénario en cours d'évaluation
  const [performanceRating, setPerformanceRating] = useState(3);
  const [recoveryTime, setRecoveryTime] = useState(60);
  const [emotionalResponse, setEmotionalResponse] = useState('');

  const currentScenario = PRESSURE_SCENARIOS[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === PRESSURE_SCENARIOS.length - 1;

  const handleAddScenario = () => {
    if (!currentScenario) return;

    const newScenario: PressureScenario = {
      id: currentScenario.id,
      situation: currentScenario.situation,
      description: currentScenario.description,
      performanceRating,
      recoveryTime,
      emotionalResponse: emotionalResponse.trim(),
    };

    setScenarios([...scenarios, newScenario]);

    // Réinitialiser le formulaire
    setPerformanceRating(3);
    setRecoveryTime(60);
    setEmotionalResponse('');

    // Passer au scénario suivant ou terminer
    if (!isLastScenario) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    }
  };

  const handleRemoveScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (scenarios.length < 3) {
      toast.warning('Veuillez évaluer au moins 3 scénarios de pression');
      return;
    }

    // Calcul des métriques
    const avgPerformance = scenarios.reduce((sum, s) => sum + s.performanceRating, 0) / scenarios.length;
    const avgRecoveryTime = scenarios.reduce((sum, s) => sum + s.recoveryTime, 0) / scenarios.length;

    // Rating global basé sur les standards
    let mentalToughnessRating = 0;
    if (avgPerformance >= 4.0 && avgRecoveryTime <= 30 && overallEmotionalControl >= 4.0) {
      mentalToughnessRating = 5; // Elite
    } else if (avgPerformance >= 3.5 && avgRecoveryTime <= 60 && overallEmotionalControl >= 3.5) {
      mentalToughnessRating = 4; // Advanced
    } else if (avgPerformance >= 3.0 && avgRecoveryTime <= 90 && overallEmotionalControl >= 3.0) {
      mentalToughnessRating = 3; // Good
    } else if (avgPerformance >= 2.5 && avgRecoveryTime <= 120 && overallEmotionalControl >= 2.5) {
      mentalToughnessRating = 2; // Developing
    } else {
      mentalToughnessRating = 1; // Needs Improvement
    }

    const testData = {
      testId: 'mental_toughness',
      category: 'MENTAL',
      scenarios,
      overallEmotionalControl,
      generalNotes,
      metrics: {
        averagePerformance: parseFloat(avgPerformance.toFixed(2)),
        averageRecoveryTime: Math.round(avgRecoveryTime),
        emotionalControl: overallEmotionalControl,
        mentalToughnessRating,
        scenariosEvaluated: scenarios.length,
      },
      completedAt: new Date().toISOString(),
    };

    onComplete(testData);
  };

  const canAddScenario = performanceRating > 0 && recoveryTime > 0;
  const allScenariosEvaluated = scenarios.length === PRESSURE_SCENARIOS.length;
  const canSubmit = scenarios.length >= 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Test de Résilience Mentale
          </CardTitle>
          <CardDescription>
            Évaluation de la capacité à performer sous pression et à gérer ses émotions.
            Durée: 40 minutes • Minimum: 3 scénarios sur 5
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 text-blue-900">📋 Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Créer 5 situations de match à haute pression (simulées ou observées en match réel)</li>
            <li>Pour chaque scénario, évaluer la performance du joueur (1-5) et son temps de récupération émotionnelle</li>
            <li>Observer et noter les réactions émotionnelles (langage corporel, communication, focus)</li>
            <li>Évaluer le contrôle émotionnel global sur l&apos;ensemble du test</li>
            <li>Minimum 3 scénarios requis pour validation</li>
          </ul>
        </CardContent>
      </Card>

      {/* Scénarios évalués */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scénarios Évalués ({scenarios.length}/5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scenarios.map((scenario, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">{scenario.situation}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 ml-6">
                      <span>Performance: {scenario.performanceRating}/5</span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        Récupération: {scenario.recoveryTime}s
                      </span>
                    </div>
                    {scenario.emotionalResponse && (
                      <p className="text-xs text-gray-500 mt-1 ml-6 italic">
                        &quot;{scenario.emotionalResponse}&quot;
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveScenario(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire scénario actuel */}
      {!allScenariosEvaluated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Scénario {currentScenarioIndex + 1}/5: {currentScenario?.situation}
            </CardTitle>
            <CardDescription>{currentScenario?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Performance Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Performance sous pression (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={performanceRating === rating ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setPerformanceRating(rating)}
                    className="flex-1"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                1 = Performance très affectée • 5 = Performance excellente malgré la pression
              </p>
            </div>

            {/* Recovery Time */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Temps de récupération émotionnelle (secondes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="180"
                  step="10"
                  value={recoveryTime}
                  onChange={(e) => setRecoveryTime(parseInt(e.target.value))}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[60px] justify-center">
                  {recoveryTime}s
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Temps pour retrouver son niveau normal après le stress
              </p>
            </div>

            {/* Emotional Response Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Observations de la réaction émotionnelle
              </label>
              <textarea
                value={emotionalResponse}
                onChange={(e) => setEmotionalResponse(e.target.value)}
                placeholder="Ex: Langage corporel positif, reste concentré, communique bien avec l'équipe..."
                className="w-full p-3 border rounded-lg text-sm h-20 resize-none"
              />
            </div>

            <Button
              onClick={handleAddScenario}
              disabled={!canAddScenario}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter ce scénario
              {!isLastScenario && ' et passer au suivant'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Évaluation globale */}
      {scenarios.length >= 3 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">Évaluation Globale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Emotional Control */}
            <div>
              <label className="block text-sm font-medium mb-2 text-purple-900">
                Contrôle émotionnel global (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={overallEmotionalControl === rating ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setOverallEmotionalControl(rating)}
                    className="flex-1"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Évaluation générale de la capacité à gérer ses émotions sur l&apos;ensemble du test
              </p>
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-sm font-medium mb-2 text-purple-900">
                Notes générales (optionnel)
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Points forts, axes d'amélioration, recommandations..."
                className="w-full p-3 border rounded-lg text-sm h-24 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {scenarios.length > 0 && (
        <Card className="border-gray-300">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {(scenarios.reduce((sum, s) => sum + s.performanceRating, 0) / scenarios.length).toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">Performance Moyenne</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(scenarios.reduce((sum, s) => sum + s.recoveryTime, 0) / scenarios.length)}s
                </p>
                <p className="text-xs text-gray-600">Récupération Moyenne</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {overallEmotionalControl.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">Contrôle Émotionnel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1"
          size="lg"
        >
          Terminer le test
          {!canSubmit && ` (${3 - scenarios.length} scénarios minimum requis)`}
        </Button>
      </div>

      {/* Standards Reference */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4">
          <h4 className="text-xs font-semibold mb-2 text-gray-700">📊 Standards de Référence</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Elite:</span> Perf &gt;4.0, Récup &lt;30s, Contrôle &gt;4.0
            </div>
            <div>
              <span className="font-medium">Advanced:</span> Perf 3.5-4.0, Récup 30-60s, Contrôle 3.5-4.0
            </div>
            <div>
              <span className="font-medium">Good:</span> Perf 3.0-3.5, Récup 60-90s, Contrôle 3.0-3.5
            </div>
            <div>
              <span className="font-medium">Developing:</span> Perf &lt;3.0, Récup &gt;90s, Contrôle &lt;3.0
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
