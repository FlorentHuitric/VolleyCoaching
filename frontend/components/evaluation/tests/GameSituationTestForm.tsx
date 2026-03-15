'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateGameSituationMetrics } from '@/utils/evaluationCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Brain, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * Game Situation Test Form
 * Evaluates tactical decision-making, court awareness, and adaptability
 * Presents game scenarios and evaluates player responses
 * Impacts: Mental.gameIntelligence, Technical.setting.decision
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles game situation evaluation
 * - Open/Closed: Extensible through props, closed for modification
 * - Interface Segregation: Clear separation of concerns
 * - Dependency Inversion: Depends on calculation utilities abstraction
 */

interface Scenario {
  situation: string;
  correctDecision: boolean;
  responseTime: number; // seconds
  reasoning: string;
}

interface GameSituationTestFormProps {
  initialData?: any;
  onComplete: (data: any) => void;
}

// Predefined game scenarios for volleyball
const GAME_SCENARIOS = [
  {
    id: 1,
    question: "Réception difficile, passe à 3m du filet. Quelle décision ?",
    options: ["Passe haute zone 4", "Passe rapide zone 3", "Passe arrière zone 1"],
    correctIndex: 0,
    explanation: "Avec une passe loin du filet, privilégier une attaque haute zone 4 pour laisser du temps"
  },
  {
    id: 2,
    question: "Score 24-23 en votre faveur, service adverse puissant. Quelle tactique défensive ?",
    options: ["Défense agressive près du filet", "Défense en retrait", "Formation normale"],
    correctIndex: 1,
    explanation: "En fin de set, sécuriser la réception avec une défense en retrait"
  },
  {
    id: 3,
    question: "Bloc adverse faible zone 2. Votre meilleur attaquant est zone 4. Quelle passe ?",
    options: ["Exploiter zone 4 (fort)", "Profiter zone 2 (faible)", "Varier zone 3"],
    correctIndex: 1,
    explanation: "Exploiter la faiblesse adverse même si votre attaquant fort est ailleurs"
  },
  {
    id: 4,
    question: "Temps mort adverse après 5 points d'affilée. Que faire au prochain jeu ?",
    options: ["Continuer même tactique", "Changer service", "Varier jeu"],
    correctIndex: 2,
    explanation: "Adversaire s'est adapté, il faut varier pour surprendre"
  },
  {
    id: 5,
    question: "Votre passeur en réception, mauvaise passe vers vous. Quelle action ?",
    options: ["Attaque risquée", "Passe haute sécurisée", "Freeball"],
    correctIndex: 2,
    explanation: "Sans passeur régulier, envoyer un freeball pour réorganiser"
  }
];

export default function GameSituationTestForm({ initialData, onComplete }: GameSituationTestFormProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [reasoning, setReasoning] = useState('');
  
  // Overall ratings
  const [awarenessRating, setAwarenessRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [communicationRating, setCommunicationRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [adaptabilityRating, setAdaptabilityRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showRatings, setShowRatings] = useState(false);

  const currentGameScenario = GAME_SCENARIOS[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex >= GAME_SCENARIOS.length - 1;

  const handleAnswerScenario = () => {
    if (selectedOption === null) {
      return toast.warning('Veuillez sélectionner une réponse');
    }

    const responseTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const correctDecision = selectedOption === currentGameScenario.correctIndex;

    const newScenario: Scenario = {
      situation: currentGameScenario.question,
      correctDecision,
      responseTime,
      reasoning: reasoning || 'Pas de justification fournie'
    };

    setScenarios([...scenarios, newScenario]);

    // Move to next scenario or show ratings
    if (isLastScenario) {
      setShowRatings(true);
    } else {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setSelectedOption(null);
      setReasoning('');
      setStartTime(Date.now());
    }
  };

  const handlePreviousScenario = () => {
    if (currentScenarioIndex > 0) {
      // Remove last scenario and go back
      setScenarios(scenarios.slice(0, -1));
      setCurrentScenarioIndex(currentScenarioIndex - 1);
      setSelectedOption(null);
      setReasoning('');
      setStartTime(Date.now());
      setShowRatings(false);
    }
  };

  const metrics = scenarios.length > 0 ? calculateGameSituationMetrics({
    testId: 'game_situation',
    category: 'tactical',
    scenarios,
    awarenessRating,
    communicationRating,
    adaptabilityRating
  }) : null;

  const handleComplete = () => {
    if (scenarios.length < 5) {
      return toast.warning('Veuillez répondre à tous les scénarios');
    }
    if (!showRatings) {
      return toast.warning('Veuillez compléter les évaluations globales');
    }

    onComplete({
      testId: 'game_situation',
      category: 'tactical',
      scenarios,
      awarenessRating,
      communicationRating,
      adaptabilityRating
    });
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-purple-50 dark:bg-purple-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>📋 Protocole: Évaluation Tactique & Prise de Décision</span>
          </h3>
          <div className="text-sm space-y-1 text-purple-800 dark:text-purple-200">
            <div><strong>Objectif:</strong> Évaluer la capacité à prendre des décisions tactiques rapides et correctes</div>
            <div><strong>Format:</strong> 5 scénarios de jeu avec choix multiples</div>
            <div><strong>Critères:</strong> Correction de la décision + Temps de réponse + Justification</div>
            <div><strong>Barème:</strong> 90%+ = Elite | 80-89% = Avancé | 70-79% = Bon | &lt;70% = À développer</div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-lg px-3 py-1">
          Scénario {currentScenarioIndex + 1} / {GAME_SCENARIOS.length}
        </Badge>
        {scenarios.length > 0 && metrics && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Score actuel: {metrics.correctDecisionRate.toFixed(0)}% ({scenarios.filter(s => s.correctDecision).length}/{scenarios.length})
          </div>
        )}
      </div>

      {/* Current Scenario */}
      {!showRatings && currentGameScenario && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold flex-1">{currentGameScenario.question}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {currentGameScenario.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedOption === index
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === index ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                    }`}>
                      {selectedOption === index && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <Label className="text-sm">💬 Justification (optionnel)</Label>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Expliquez votre raisonnement..."
                className="w-full mt-1 p-3 rounded-md border border-input bg-background min-h-[80px]"
              />
            </div>

            <div className="flex gap-2">
              {currentScenarioIndex > 0 && (
                <Button onClick={handlePreviousScenario} variant="outline">
                  ← Retour
                </Button>
              )}
              <Button 
                onClick={handleAnswerScenario} 
                disabled={selectedOption === null}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isLastScenario ? 'Terminer les scénarios' : 'Valider et continuer →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Ratings */}
      {showRatings && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Évaluations Globales (par l'entraîneur)</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Vision du jeu / Conscience de terrain</Label>
                <div className="flex items-center space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setAwarenessRating(rating as 1 | 2 | 3 | 4 | 5)}
                      className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                        awarenessRating === rating
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 font-bold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Communication sur le terrain</Label>
                <div className="flex items-center space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setCommunicationRating(rating as 1 | 2 | 3 | 4 | 5)}
                      className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                        communicationRating === rating
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 font-bold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Adaptabilité / Flexibilité tactique</Label>
                <div className="flex items-center space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setAdaptabilityRating(rating as 1 | 2 | 3 | 4 | 5)}
                      className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                        adaptabilityRating === rating
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 font-bold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handlePreviousScenario} variant="outline" className="w-full mt-4">
              ← Retour aux scénarios
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {scenarios.length > 0 && metrics && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Résultats Tactiques</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.correctDecisionRate.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 mt-1">Décisions Correctes</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.avgResponseTime.toFixed(1)}s</div>
                <div className="text-xs text-gray-500 mt-1">Temps Moyen</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{awarenessRating}/5</div>
                <div className="text-xs text-gray-500 mt-1">Vision Jeu</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.decisionRating}/10</div>
                <div className="text-xs text-gray-500 mt-1">Note Globale</div>
              </div>
            </div>

            {/* Scenario breakdown */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm mb-2">📋 Détail des scénarios</h4>
              {scenarios.map((scenario, index) => (
                <div key={index} className="flex items-center justify-between text-xs border-b pb-2">
                  <span className="flex-1">{scenario.situation.substring(0, 50)}...</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{scenario.responseTime.toFixed(1)}s</span>
                    {scenario.correctDecision ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button 
        onClick={handleComplete} 
        disabled={!showRatings || scenarios.length < 5}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50" 
        size="lg"
      >
        <TrendingUp className="h-5 w-5 mr-2" />
        {!showRatings 
          ? 'Complétez tous les scénarios'
          : 'Valider l\'évaluation tactique'
        }
      </Button>
    </div>
  );
}
