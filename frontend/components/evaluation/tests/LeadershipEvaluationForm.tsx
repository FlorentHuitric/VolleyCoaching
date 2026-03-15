'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Eye, Award, CheckCircle2, Circle } from 'lucide-react';

/**
 * Leadership Evaluation Form
 * 
 * Évalue les qualités de leadership du joueur à travers :
 * - Peer ratings (évaluation par les coéquipiers)
 * - Coach observations (grille d'observation)
 * - Scénarios de décision leadership
 * 
 * Durée: 20 minutes
 * 
 * Standards:
 * - Elite: Peer avg >4.0, Coach >4.0, Scénarios >85%
 * - Advanced: Peer 3.5-4.0, Coach 3.5-4.0, Scénarios 75-85%
 * - Good: Peer 3.0-3.5, Coach 3.0-3.5, Scénarios 65-75%
 * - Developing: Peer <3.0, Coach <3.0, Scénarios <65%
 */

interface PeerRating {
  dimension: string;
  rating: number; // 1-5
}

interface CoachObservation {
  item: string;
  rating: number; // 1-5
}

interface LeadershipScenario {
  id: string;
  situation: string;
  options: string[];
  correctOption: number;
  playerOption: number;
  isCorrect: boolean;
}

interface LeadershipEvaluationFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// Peer rating dimensions
const PEER_DIMENSIONS = [
  {
    id: 'motivation',
    label: 'Motivation d\'équipe',
    description: 'Capacité à motiver et énergiser les coéquipiers',
  },
  {
    id: 'communication',
    label: 'Communication positive',
    description: 'Communique de manière constructive et encourageante',
  },
  {
    id: 'example',
    label: 'Montre l\'exemple',
    description: 'Démontre les bonnes attitudes et comportements',
  },
  {
    id: 'accountability',
    label: 'Responsabilité',
    description: 'Prend ses responsabilités, admet ses erreurs',
  },
  {
    id: 'trust',
    label: 'Confiance',
    description: 'Les coéquipiers lui font confiance dans les moments critiques',
  },
];

// Coach observation items
const COACH_OBSERVATIONS = [
  {
    id: 'vocal_leadership',
    label: 'Leadership vocal',
    description: 'Parle fort et clair, guide l\'équipe verbalement',
  },
  {
    id: 'body_language',
    label: 'Langage corporel positif',
    description: 'Posture confiante, encourage visuellement',
  },
  {
    id: 'tactical_guidance',
    label: 'Guidage tactique',
    description: 'Donne des instructions tactiques pendant le jeu',
  },
  {
    id: 'conflict_resolution',
    label: 'Résolution de conflits',
    description: 'Gère les tensions et conflits dans l\'équipe',
  },
  {
    id: 'decision_making',
    label: 'Prise de décision',
    description: 'Prend des décisions rapides et justes sous pression',
  },
  {
    id: 'work_ethic',
    label: 'Éthique de travail',
    description: 'Travaille dur, ne baisse jamais les bras',
  },
  {
    id: 'composure',
    label: 'Sang-froid',
    description: 'Reste calme dans les moments de stress',
  },
  {
    id: 'adaptability',
    label: 'Adaptabilité',
    description: 'S\'adapte aux changements de situation',
  },
  {
    id: 'mentoring',
    label: 'Mentorat',
    description: 'Aide les jeunes joueurs à progresser',
  },
  {
    id: 'team_first',
    label: 'Esprit d\'équipe',
    description: 'Privilégie toujours le collectif à l\'individuel',
  },
];

// Leadership decision scenarios
const LEADERSHIP_SCENARIOS = [
  {
    id: 'ls1',
    situation: 'Votre équipe vient de perdre 3 points consécutifs. Un coéquipier est visiblement frustré et critique l\'arbitre.',
    question: 'Quelle est la meilleure action de leadership ?',
    options: [
      'Ignorer la situation, ce n\'est pas mon problème',
      'Rejoindre la critique de l\'arbitre pour montrer la solidarité',
      'Calmer le coéquipier, recentrer l\'équipe sur le prochain point',
      'Demander au coach d\'intervenir',
    ],
    correctOption: 2,
  },
  {
    id: 'ls2',
    situation: 'Un jeune joueur vient de faire une erreur coûteuse (ace manqué). Il a l\'air dévasté.',
    question: 'Comment réagir en tant que leader ?',
    options: [
      'Ne rien dire pour ne pas attirer l\'attention sur l\'erreur',
      'Lui dire "c\'est pas grave" mais avec un ton frustré',
      'L\'encourager verbalement et physiquement (tape dans le dos), rappeler qu\'on croit en lui',
      'Expliquer tactiquement ce qu\'il aurait dû faire différemment',
    ],
    correctOption: 2,
  },
  {
    id: 'ls3',
    situation: 'L\'entraîneur fait une substitution que vous trouvez tactiquement discutable. Vous êtes le capitaine.',
    question: 'Quelle est la réaction appropriée ?',
    options: [
      'Contester la décision devant l\'équipe pour montrer mon désaccord',
      'Accepter la décision, encourager le joueur entrant à donner le maximum',
      'Demander discrètement à l\'entraîneur de reconsidérer',
      'Montrer ma frustration pour que l\'entraîneur comprenne son erreur',
    ],
    correctOption: 1,
  },
  {
    id: 'ls4',
    situation: 'Deux coéquipiers se disputent pendant le match sur une responsabilité défensive non assumée.',
    question: 'Comment intervenir efficacement ?',
    options: [
      'Laisser l\'entraîneur gérer, ce n\'est pas mon rôle',
      'Prendre parti pour celui qui a raison',
      'Stopper la dispute immédiatement, rappeler qu\'on règle ça après le match, focus sur le jeu',
      'Identifier le coupable et le recadrer publiquement',
    ],
    correctOption: 2,
  },
  {
    id: 'ls5',
    situation: 'Votre équipe mène 2 sets à 0 et commence à relâcher l\'intensité au 3ème set (mène 15-10 mais baisse de niveau).',
    question: 'Quel leadership exercer ?',
    options: [
      'Profiter de l\'avance pour se reposer, garder de l\'énergie',
      'Rassembler l\'équipe pendant un temps mort ou changement de côté, rappeler l\'objectif de finir en 3 sets',
      'Critiquer les coéquipiers qui relâchent pour les réveiller',
      'Attendre que le coach fasse un discours motivant',
    ],
    correctOption: 1,
  },
];

export default function LeadershipEvaluationForm({
  onComplete,
  onCancel,
  initialData,
}: LeadershipEvaluationFormProps) {
  const [currentSection, setCurrentSection] = useState<'peer' | 'coach' | 'scenarios'>('peer');

  // Peer Ratings State
  const [peerRatings, setPeerRatings] = useState<PeerRating[]>(
    initialData?.peerRatings || PEER_DIMENSIONS.map(d => ({ dimension: d.id, rating: 3 }))
  );

  // Coach Observations State
  const [coachObservations, setCoachObservations] = useState<CoachObservation[]>(
    initialData?.coachObservations || COACH_OBSERVATIONS.map(o => ({ item: o.id, rating: 3 }))
  );

  // Leadership Scenarios State
  const [scenarios, setScenarios] = useState<LeadershipScenario[]>(
    initialData?.scenarios || []
  );
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number>(-1);

  const currentScenario = LEADERSHIP_SCENARIOS[currentScenarioIndex];

  // Handlers
  const updatePeerRating = (dimension: string, rating: number) => {
    setPeerRatings(prev =>
      prev.map(p => (p.dimension === dimension ? { ...p, rating } : p))
    );
  };

  const updateCoachObservation = (item: string, rating: number) => {
    setCoachObservations(prev =>
      prev.map(o => (o.item === item ? { ...o, rating } : o))
    );
  };

  const handleScenarioSubmit = () => {
    if (selectedOption === -1) return;

    const newScenario: LeadershipScenario = {
      id: currentScenario.id,
      situation: currentScenario.situation,
      options: currentScenario.options,
      correctOption: currentScenario.correctOption,
      playerOption: selectedOption,
      isCorrect: selectedOption === currentScenario.correctOption,
    };

    setScenarios([...scenarios, newScenario]);
    setSelectedOption(-1);

    if (currentScenarioIndex < LEADERSHIP_SCENARIOS.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    }
  };

  const handleFinalSubmit = () => {
    // Calculate metrics
    const peerAvg = peerRatings.reduce((sum, p) => sum + p.rating, 0) / peerRatings.length;
    const coachAvg = coachObservations.reduce((sum, o) => sum + o.rating, 0) / coachObservations.length;
    const scenarioCorrect = scenarios.filter(s => s.isCorrect).length;
    const scenarioScore = (scenarioCorrect / scenarios.length) * 100;

    // Leadership rating based on standards
    let leadershipRating = 1;
    if (peerAvg >= 4.0 && coachAvg >= 4.0 && scenarioScore >= 85) {
      leadershipRating = 10; // Elite
    } else if (peerAvg >= 3.8 && coachAvg >= 3.8 && scenarioScore >= 80) {
      leadershipRating = 9;
    } else if (peerAvg >= 3.5 && coachAvg >= 3.5 && scenarioScore >= 75) {
      leadershipRating = 8; // Advanced
    } else if (peerAvg >= 3.2 && coachAvg >= 3.2 && scenarioScore >= 70) {
      leadershipRating = 7;
    } else if (peerAvg >= 3.0 && coachAvg >= 3.0 && scenarioScore >= 65) {
      leadershipRating = 6; // Good
    } else if (peerAvg >= 2.7 && coachAvg >= 2.7 && scenarioScore >= 60) {
      leadershipRating = 5;
    } else if (peerAvg >= 2.5 && coachAvg >= 2.5 && scenarioScore >= 50) {
      leadershipRating = 4;
    } else if (peerAvg >= 2.2) {
      leadershipRating = 3;
    } else if (peerAvg >= 2.0) {
      leadershipRating = 2;
    } else {
      leadershipRating = 1;
    }

    const testData = {
      testId: 'leadership',
      category: 'MENTAL',
      peerRatings,
      coachObservations,
      scenarios,
      metrics: {
        peerAverage: parseFloat(peerAvg.toFixed(2)),
        coachAverage: parseFloat(coachAvg.toFixed(2)),
        scenarioScore: parseFloat(scenarioScore.toFixed(1)),
        leadershipRating,
      },
      completedAt: new Date().toISOString(),
    };

    onComplete(testData);
  };

  const canSubmitScenario = selectedOption !== -1;
  const canSubmitFinal = scenarios.length === LEADERSHIP_SCENARIOS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Évaluation du Leadership
          </CardTitle>
          <CardDescription>
            Évaluation complète des qualités de leader : peer ratings, observations coach, décisions
            Durée: 20 minutes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4">
              <Badge variant={currentSection === 'peer' ? 'default' : 'secondary'}>
                <Star className="h-3 w-3 mr-1" />
                Peer Ratings
              </Badge>
              <Badge variant={currentSection === 'coach' ? 'default' : 'secondary'}>
                <Eye className="h-3 w-3 mr-1" />
                Coach Observations
              </Badge>
              <Badge variant={currentSection === 'scenarios' ? 'default' : scenarios.length === LEADERSHIP_SCENARIOS.length ? 'secondary' : 'outline'}>
                <Award className="h-3 w-3 mr-1" />
                Scénarios {scenarios.length}/{LEADERSHIP_SCENARIOS.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Peer Ratings */}
      {currentSection === 'peer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Évaluations par les Coéquipiers
            </CardTitle>
            <CardDescription>
              Ces notes représentent la perception des coéquipiers (peuvent être collectées via questionnaire anonyme)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {PEER_DIMENSIONS.map((dimension) => {
              const rating = peerRatings.find(p => p.dimension === dimension.id)?.rating || 3;
              return (
                <div key={dimension.id} className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium">{dimension.label}</label>
                    <p className="text-xs text-gray-500">{dimension.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant={rating === value ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => updatePeerRating(dimension.id, value)}
                        className="flex-1"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}

            <Button onClick={() => setCurrentSection('coach')} className="w-full" size="lg">
              Continuer vers les Observations Coach
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 2: Coach Observations */}
      {currentSection === 'coach' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Observations de l&apos;Entraîneur
            </CardTitle>
            <CardDescription>
              Évaluation basée sur vos observations pendant entraînements et matchs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {COACH_OBSERVATIONS.map((observation) => {
              const rating = coachObservations.find(o => o.item === observation.id)?.rating || 3;
              return (
                <div key={observation.id} className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium">{observation.label}</label>
                    <p className="text-xs text-gray-500">{observation.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant={rating === value ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => updateCoachObservation(observation.id, value)}
                        className="flex-1"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentSection('peer')} className="flex-1">
                Retour
              </Button>
              <Button onClick={() => setCurrentSection('scenarios')} className="flex-1" size="lg">
                Continuer vers les Scénarios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Leadership Scenarios */}
      {currentSection === 'scenarios' && scenarios.length < LEADERSHIP_SCENARIOS.length && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Scénario de Leadership {currentScenarioIndex + 1}/{LEADERSHIP_SCENARIOS.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="font-medium text-amber-900 mb-2">Situation :</p>
              <p className="text-sm text-amber-800">{currentScenario.situation}</p>
            </div>

            <div>
              <p className="font-medium mb-3">{currentScenario.question}</p>
              <div className="space-y-2">
                {currentScenario.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${selectedOption === index ? 'text-blue-500' : 'text-gray-400'}`}>
                        {selectedOption === index ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              {currentScenarioIndex > 0 && (
                <Button variant="outline" onClick={() => setCurrentSection('coach')} className="flex-1">
                  Retour
                </Button>
              )}
              <Button
                onClick={handleScenarioSubmit}
                disabled={!canSubmitScenario}
                className="flex-1"
                size="lg"
              >
                {currentScenarioIndex < LEADERSHIP_SCENARIOS.length - 1 ? 'Scénario suivant' : 'Terminer les scénarios'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary & Final Submit */}
      {currentSection === 'scenarios' && canSubmitFinal && (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Résumé de l&apos;Évaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {(peerRatings.reduce((sum, p) => sum + p.rating, 0) / peerRatings.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">Peer Ratings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {(coachObservations.reduce((sum, o) => sum + o.rating, 0) / coachObservations.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">Coach Observations</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {((scenarios.filter(s => s.isCorrect).length / scenarios.length) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-600">Scénarios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleFinalSubmit} className="flex-1" size="lg">
              Terminer l&apos;évaluation
            </Button>
          </div>
        </>
      )}

      {/* Standards Reference */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4">
          <h4 className="text-xs font-semibold mb-2 text-gray-700">📊 Standards de Référence</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Elite:</span> Peer &gt;4.0, Coach &gt;4.0, Scénarios &gt;85%
            </div>
            <div>
              <span className="font-medium">Advanced:</span> Peer 3.5-4.0, Coach 3.5-4.0, Scénarios 75-85%
            </div>
            <div>
              <span className="font-medium">Good:</span> Peer 3.0-3.5, Coach 3.0-3.5, Scénarios 65-75%
            </div>
            <div>
              <span className="font-medium">Developing:</span> Peer &lt;3.0, Coach &lt;3.0, Scénarios &lt;65%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
