'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Volume2, Eye, Ear, CheckCircle2, Circle } from 'lucide-react';

/**
 * Communication Test Form
 * 
 * Évalue les compétences de communication du joueur :
 * - Efficacité verbale (clarté, volume, timing)
 * - Communication non-verbale (langage corporel, signaux)
 * - Écoute active (compréhension et exécution des instructions)
 * - Résolution de conflits (2 scénarios de communication difficile)
 * 
 * Durée: 15 minutes
 * 
 * Standards:
 * - Elite: Verbal >4.0, Non-verbal >4.0, Écoute >4.0, Conflits 100%
 * - Advanced: Verbal 3.5-4.0, Non-verbal 3.5-4.0, Écoute 3.5-4.0, Conflits 50-100%
 * - Good: Verbal 3.0-3.5, Non-verbal 3.0-3.5, Écoute 3.0-3.5, Conflits 50%
 * - Developing: Verbal <3.0, Non-verbal <3.0, Écoute <3.0, Conflits 0%
 */

interface VerbalCommunication {
  clarity: number; // 1-5
  volume: number; // 1-5
  timing: number; // 1-5
  positivity: number; // 1-5
}

interface NonVerbalCommunication {
  bodyLanguage: number; // 1-5
  eyeContact: number; // 1-5
  gestures: number; // 1-5
  facialExpressions: number; // 1-5
}

interface ActiveListening {
  comprehension: number; // 1-5
  retention: number; // 1-5
  feedback: number; // 1-5
  adaptation: number; // 1-5
}

interface ConflictScenario {
  id: string;
  situation: string;
  options: string[];
  correctOption: number;
  playerOption: number;
  isCorrect: boolean;
}

interface CommunicationTestFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// Conflict resolution scenarios
const CONFLICT_SCENARIOS = [
  {
    id: 'cs1',
    situation: 'Un coéquipier vous reproche publiquement une erreur technique pendant le match. Vous n\'êtes pas d\'accord avec sa critique.',
    question: 'Quelle est la meilleure réponse de communication ?',
    options: [
      'Ignorer complètement pour ne pas créer de conflit',
      'Lui répondre immédiatement pour défendre votre position',
      'Reconnaître son point de vue calmement, proposer d\'en discuter après le match',
      'Dire "tu as raison" même si vous n\'êtes pas d\'accord',
    ],
    correctOption: 2,
  },
  {
    id: 'cs2',
    situation: 'L\'entraîneur vous donne des instructions tactiques complexes pendant un temps mort. Vous n\'avez pas tout compris.',
    question: 'Comment communiquer efficacement dans cette situation ?',
    options: [
      'Faire semblant d\'avoir compris pour ne pas paraître incompétent',
      'Demander à un coéquipier de vous expliquer après',
      'Poser des questions de clarification immédiatement pour confirmer votre compréhension',
      'Appliquer ce que vous avez compris et improviser le reste',
    ],
    correctOption: 2,
  },
];

export default function CommunicationTestForm({
  onComplete,
  onCancel,
  initialData,
}: CommunicationTestFormProps) {
  const [currentSection, setCurrentSection] = useState<'verbal' | 'nonverbal' | 'listening' | 'conflicts'>('verbal');

  // Verbal Communication State
  const [verbal, setVerbal] = useState<VerbalCommunication>(
    initialData?.verbal || {
      clarity: 3,
      volume: 3,
      timing: 3,
      positivity: 3,
    }
  );

  // Non-Verbal Communication State
  const [nonVerbal, setNonVerbal] = useState<NonVerbalCommunication>(
    initialData?.nonVerbal || {
      bodyLanguage: 3,
      eyeContact: 3,
      gestures: 3,
      facialExpressions: 3,
    }
  );

  // Active Listening State
  const [listening, setListening] = useState<ActiveListening>(
    initialData?.listening || {
      comprehension: 3,
      retention: 3,
      feedback: 3,
      adaptation: 3,
    }
  );

  // Conflict Scenarios State
  const [scenarios, setScenarios] = useState<ConflictScenario[]>(
    initialData?.scenarios || []
  );
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number>(-1);

  const currentScenario = CONFLICT_SCENARIOS[currentScenarioIndex];

  // Handlers
  const updateVerbal = (key: keyof VerbalCommunication, value: number) => {
    setVerbal(prev => ({ ...prev, [key]: value }));
  };

  const updateNonVerbal = (key: keyof NonVerbalCommunication, value: number) => {
    setNonVerbal(prev => ({ ...prev, [key]: value }));
  };

  const updateListening = (key: keyof ActiveListening, value: number) => {
    setListening(prev => ({ ...prev, [key]: value }));
  };

  const handleScenarioSubmit = () => {
    if (selectedOption === -1) return;

    const newScenario: ConflictScenario = {
      id: currentScenario.id,
      situation: currentScenario.situation,
      options: currentScenario.options,
      correctOption: currentScenario.correctOption,
      playerOption: selectedOption,
      isCorrect: selectedOption === currentScenario.correctOption,
    };

    setScenarios([...scenarios, newScenario]);
    setSelectedOption(-1);

    if (currentScenarioIndex < CONFLICT_SCENARIOS.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    }
  };

  const handleFinalSubmit = () => {
    // Calculate metrics
    const verbalAvg = (verbal.clarity + verbal.volume + verbal.timing + verbal.positivity) / 4;
    const nonVerbalAvg = (nonVerbal.bodyLanguage + nonVerbal.eyeContact + nonVerbal.gestures + nonVerbal.facialExpressions) / 4;
    const listeningAvg = (listening.comprehension + listening.retention + listening.feedback + listening.adaptation) / 4;
    
    const conflictCorrect = scenarios.filter(s => s.isCorrect).length;
    const conflictScore = (conflictCorrect / scenarios.length) * 100;

    // Overall communication rating
    const overallAvg = (verbalAvg + nonVerbalAvg + listeningAvg) / 3;

    // Communication rating based on standards
    let communicationRating = 1;
    if (verbalAvg >= 4.0 && nonVerbalAvg >= 4.0 && listeningAvg >= 4.0 && conflictScore === 100) {
      communicationRating = 10; // Elite
    } else if (verbalAvg >= 3.8 && nonVerbalAvg >= 3.8 && listeningAvg >= 3.8 && conflictScore >= 50) {
      communicationRating = 9;
    } else if (verbalAvg >= 3.5 && nonVerbalAvg >= 3.5 && listeningAvg >= 3.5 && conflictScore >= 50) {
      communicationRating = 8; // Advanced
    } else if (verbalAvg >= 3.2 && nonVerbalAvg >= 3.2 && listeningAvg >= 3.2) {
      communicationRating = 7;
    } else if (verbalAvg >= 3.0 && nonVerbalAvg >= 3.0 && listeningAvg >= 3.0 && conflictScore >= 50) {
      communicationRating = 6; // Good
    } else if (verbalAvg >= 2.7 && nonVerbalAvg >= 2.7) {
      communicationRating = 5;
    } else if (verbalAvg >= 2.5 && nonVerbalAvg >= 2.5) {
      communicationRating = 4;
    } else if (verbalAvg >= 2.2) {
      communicationRating = 3;
    } else if (verbalAvg >= 2.0) {
      communicationRating = 2;
    } else {
      communicationRating = 1;
    }

    const testData = {
      testId: 'communication',
      category: 'MENTAL',
      verbal,
      nonVerbal,
      listening,
      scenarios,
      metrics: {
        verbalAverage: parseFloat(verbalAvg.toFixed(2)),
        nonVerbalAverage: parseFloat(nonVerbalAvg.toFixed(2)),
        listeningAverage: parseFloat(listeningAvg.toFixed(2)),
        conflictScore: parseFloat(conflictScore.toFixed(1)),
        overallAverage: parseFloat(overallAvg.toFixed(2)),
        communicationRating,
      },
      completedAt: new Date().toISOString(),
    };

    onComplete(testData);
  };

  const canSubmitScenario = selectedOption !== -1;
  const canSubmitFinal = scenarios.length === CONFLICT_SCENARIOS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            Test de Communication
          </CardTitle>
          <CardDescription>
            Évaluation complète des compétences de communication : verbale, non-verbale, écoute, conflits
            Durée: 15 minutes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4">
              <Badge variant={currentSection === 'verbal' ? 'default' : 'secondary'}>
                <Volume2 className="h-3 w-3 mr-1" />
                Verbale
              </Badge>
              <Badge variant={currentSection === 'nonverbal' ? 'default' : 'secondary'}>
                <Eye className="h-3 w-3 mr-1" />
                Non-verbale
              </Badge>
              <Badge variant={currentSection === 'listening' ? 'default' : 'secondary'}>
                <Ear className="h-3 w-3 mr-1" />
                Écoute
              </Badge>
              <Badge variant={currentSection === 'conflicts' ? 'default' : scenarios.length === CONFLICT_SCENARIOS.length ? 'secondary' : 'outline'}>
                <MessageSquare className="h-3 w-3 mr-1" />
                Conflits {scenarios.length}/{CONFLICT_SCENARIOS.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Verbal Communication */}
      {currentSection === 'verbal' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Communication Verbale
            </CardTitle>
            <CardDescription>
              Évaluation de l&apos;efficacité de la communication parlée pendant entraînements et matchs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clarity */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Clarté du message</label>
                <p className="text-xs text-gray-500">Messages clairs, concis et compréhensibles</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={verbal.clarity === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateVerbal('clarity', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Volume et projection</label>
                <p className="text-xs text-gray-500">Parle assez fort pour être entendu, projette sa voix</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={verbal.volume === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateVerbal('volume', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Timing de la communication</label>
                <p className="text-xs text-gray-500">Communique au bon moment (pas trop tôt, pas trop tard)</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={verbal.timing === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateVerbal('timing', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Positivity */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Positivité du langage</label>
                <p className="text-xs text-gray-500">Utilise un langage constructif et encourageant</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={verbal.positivity === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateVerbal('positivity', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={() => setCurrentSection('nonverbal')} className="w-full" size="lg">
              Continuer vers Communication Non-verbale
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 2: Non-Verbal Communication */}
      {currentSection === 'nonverbal' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Communication Non-verbale
            </CardTitle>
            <CardDescription>
              Évaluation du langage corporel, signaux visuels et expressions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Body Language */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Langage corporel</label>
                <p className="text-xs text-gray-500">Posture ouverte, confiance, énergie positive</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={nonVerbal.bodyLanguage === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateNonVerbal('bodyLanguage', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Eye Contact */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Contact visuel</label>
                <p className="text-xs text-gray-500">Maintient le contact visuel, regarde ses coéquipiers</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={nonVerbal.eyeContact === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateNonVerbal('eyeContact', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Gestures */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Gestes et signaux</label>
                <p className="text-xs text-gray-500">Utilise des gestes clairs, signaux de main efficaces</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={nonVerbal.gestures === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateNonVerbal('gestures', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Facial Expressions */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Expressions faciales</label>
                <p className="text-xs text-gray-500">Expressions appropriées, sourit, encourage visuellement</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={nonVerbal.facialExpressions === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateNonVerbal('facialExpressions', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentSection('verbal')} className="flex-1">
                Retour
              </Button>
              <Button onClick={() => setCurrentSection('listening')} className="flex-1" size="lg">
                Continuer vers Écoute Active
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Active Listening */}
      {currentSection === 'listening' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ear className="h-5 w-5" />
              Écoute Active
            </CardTitle>
            <CardDescription>
              Évaluation de la capacité à écouter, comprendre et agir sur les informations reçues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comprehension */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Compréhension</label>
                <p className="text-xs text-gray-500">Comprend rapidement les instructions et informations</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={listening.comprehension === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateListening('comprehension', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Retention */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Rétention</label>
                <p className="text-xs text-gray-500">Retient et se souvient des informations importantes</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={listening.retention === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateListening('retention', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Feedback et clarification</label>
                <p className="text-xs text-gray-500">Pose des questions pour confirmer sa compréhension</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={listening.feedback === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateListening('feedback', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Adaptation */}
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium">Adaptation et exécution</label>
                <p className="text-xs text-gray-500">Adapte son jeu selon les consignes reçues</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant={listening.adaptation === value ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => updateListening('adaptation', value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentSection('nonverbal')} className="flex-1">
                Retour
              </Button>
              <Button onClick={() => setCurrentSection('conflicts')} className="flex-1" size="lg">
                Continuer vers Résolution de Conflits
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Conflict Resolution Scenarios */}
      {currentSection === 'conflicts' && scenarios.length < CONFLICT_SCENARIOS.length && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Scénario de Communication {currentScenarioIndex + 1}/{CONFLICT_SCENARIOS.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="font-medium text-orange-900 mb-2">Situation :</p>
              <p className="text-sm text-orange-800">{currentScenario.situation}</p>
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
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${selectedOption === index ? 'text-green-500' : 'text-gray-400'}`}>
                        {selectedOption === index ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              {currentScenarioIndex === 0 && (
                <Button variant="outline" onClick={() => setCurrentSection('listening')} className="flex-1">
                  Retour
                </Button>
              )}
              <Button
                onClick={handleScenarioSubmit}
                disabled={!canSubmitScenario}
                className="flex-1"
                size="lg"
              >
                {currentScenarioIndex < CONFLICT_SCENARIOS.length - 1 ? 'Scénario suivant' : 'Terminer les scénarios'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary & Final Submit */}
      {currentSection === 'conflicts' && canSubmitFinal && (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Résumé de l&apos;Évaluation Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {((verbal.clarity + verbal.volume + verbal.timing + verbal.positivity) / 4).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">Verbale</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {((nonVerbal.bodyLanguage + nonVerbal.eyeContact + nonVerbal.gestures + nonVerbal.facialExpressions) / 4).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">Non-verbale</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">
                    {((listening.comprehension + listening.retention + listening.feedback + listening.adaptation) / 4).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">Écoute</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {((scenarios.filter(s => s.isCorrect).length / scenarios.length) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-600">Conflits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleFinalSubmit} className="flex-1" size="lg">
              Terminer le test
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
              <span className="font-medium">Elite:</span> Verbal &gt;4.0, Non-verbal &gt;4.0, Écoute &gt;4.0, Conflits 100%
            </div>
            <div>
              <span className="font-medium">Advanced:</span> Verbal 3.5-4.0, Non-verbal 3.5-4.0, Écoute 3.5-4.0, Conflits 50-100%
            </div>
            <div>
              <span className="font-medium">Good:</span> Verbal 3.0-3.5, Non-verbal 3.0-3.5, Écoute 3.0-3.5, Conflits 50%
            </div>
            <div>
              <span className="font-medium">Developing:</span> Verbal &lt;3.0, Non-verbal &lt;3.0, Écoute &lt;3.0, Conflits 0%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
