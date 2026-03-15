'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle2, Circle, Video, HelpCircle, MapPin, Plus, Trash2 } from 'lucide-react';

/**
 * Game Intelligence Test Form
 * 
 * Évalue l'intelligence de jeu, la compréhension tactique et la conscience du terrain.
 * 
 * Structure du test:
 * - Partie 1: Analyse vidéo (5 clips courts, identification erreurs/opportunités)
 * - Partie 2: Questions tactiques avancées (10 questions QCM)
 * - Partie 3: Court awareness test (évaluation positionnement et vision de jeu)
 * 
 * Durée: 30 minutes
 * 
 * Standards:
 * - Elite: Score total >85%, temps moyen <20s, awareness >4.0
 * - Advanced: Score 75-85%, temps 20-30s, awareness 3.5-4.0
 * - Good: Score 65-75%, temps 30-45s, awareness 3.0-3.5
 * - Developing: Score <65%, temps >45s, awareness <3.0
 */

interface VideoAnalysisQuestion {
  id: string;
  clipDescription: string;
  question: string;
  correctAnswer: string;
  playerAnswer: string;
  isCorrect: boolean;
  responseTime: number; // seconds
}

interface TacticalQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  playerOption: number;
  isCorrect: boolean;
  responseTime: number;
}

interface GameIntelligenceTestFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// Predefined video analysis scenarios
const VIDEO_SCENARIOS = [
  {
    id: 'reception_positioning',
    clipDescription: 'Réception en W - Service flottant zone 1',
    question: 'Quelle est l\'erreur principale de positionnement ?',
    correctAnswer: 'Le joueur avant-gauche est trop proche de la ligne, laissant un trou zone 2',
  },
  {
    id: 'blocking_timing',
    clipDescription: 'Attaque rapide tempo 1 - Central',
    question: 'Pourquoi le bloc est-il inefficace ?',
    correctAnswer: 'Le central bloque en retard, le timing du saut n\'est pas synchronisé avec l\'attaquant',
  },
  {
    id: 'setter_decision',
    clipDescription: 'Passe après réception moyenne - 3 options',
    question: 'Quelle aurait été la meilleure décision tactique ?',
    correctAnswer: 'Jouer la pipe (attaque arrière) car le bloc adverse est fixé devant',
  },
  {
    id: 'defense_coverage',
    clipDescription: 'Défense après bloc - Balle rebondie',
    question: 'Quel joueur a manqué sa responsabilité de couverture ?',
    correctAnswer: 'Le libéro qui n\'a pas protégé la zone derrière le bloc central',
  },
  {
    id: 'transition_attack',
    clipDescription: 'Contre-attaque après défense - Système 5-1',
    question: 'Quelle opportunité tactique n\'a pas été exploitée ?',
    correctAnswer: 'L\'attaquant diagonal était libre (1v0) mais n\'a pas été servi',
  },
];

// Predefined tactical questions
const TACTICAL_QUESTIONS = [
  {
    id: 'tq1',
    question: 'En rotation 1 (passeur avant-droit), quelle est la meilleure stratégie offensive ?',
    options: [
      'Privilégier les attaques extérieures pour éviter le passeur',
      'Jouer des tempos rapides au centre pour surprendre',
      'Utiliser le pipe et le diagonal pour jouer derrière le passeur',
      'Faire des services tactiques courts pour désorganiser',
    ],
    correctOption: 2,
  },
  {
    id: 'tq2',
    question: 'Face à une équipe avec 2 bloqueurs dominants au centre, quelle adaptation tactique ?',
    options: [
      'Jouer principalement en zone 4 (pointe gauche)',
      'Multiplier les attaques rapides tempo 1 pour fixer le bloc',
      'Privilégier les attaques hautes pour éviter le bloc',
      'Faire des feintes et dumpings de second toucher',
    ],
    correctOption: 1,
  },
  {
    id: 'tq3',
    question: 'Votre équipe perd 20-23 au 5ème set. Quelle stratégie défensive adopter ?',
    options: [
      'Bloc agressif en anticipation pour créer des points directs',
      'Défense basse en couverture pour relancer chaque balle',
      'Bloc lecture avec libéro décalé sur attaquant fort',
      'Pression maximale au service quitte à prendre des risques',
    ],
    correctOption: 2,
  },
  {
    id: 'tq4',
    question: 'En tant que passeur, comment gérer une réception parfaite en zone 3 ?',
    options: [
      'Toujours jouer l\'attaquant le plus fort (zone 4)',
      'Lire le bloc adverse et exploiter le 1v1 ou le trou',
      'Faire une feinte de second toucher pour surprendre',
      'Jouer systématiquement le central en tempo 1',
    ],
    correctOption: 1,
  },
  {
    id: 'tq5',
    question: 'L\'adversaire sert toujours sur votre passeur. Comment s\'adapter ?',
    options: [
      'Le passeur doit reculer pour avoir plus de temps',
      'Système 4-2 avec deux passeurs pour faciliter',
      'Passeur en pointe de réception, libéro couvre derrière',
      'Les attaquants doivent compenser avec courses plus profondes',
    ],
    correctOption: 3,
  },
  {
    id: 'tq6',
    question: 'Quel est le meilleur moment pour demander un temps mort ?',
    options: [
      'Après avoir perdu 3 points consécutifs',
      'Quand l\'adversaire a le momentum et fait un run de 4-0',
      'Avant un service important (match point)',
      'Juste avant le changement de côté technique (8ème point)',
    ],
    correctOption: 1,
  },
  {
    id: 'tq7',
    question: 'En défense de ligne, où doit se positionner le libéro face à une attaque ligne ?',
    options: [
      'Contre la ligne, collé au bloqueur',
      '1-2m de la ligne, légèrement en retrait',
      'Au centre du terrain pour couvrir le diagonal',
      'Sur la ligne mais 3m en retrait du filet',
    ],
    correctOption: 1,
  },
  {
    id: 'tq8',
    question: 'Qu\'est-ce qu\'une attaque "combo" efficace en système 5-1 ?',
    options: [
      'Deux attaquants frappent en même temps',
      'Central + pointe qui se croisent pour fixer le bloc',
      'Attaque suivie immédiatement d\'une contre-attaque',
      'Feinte de passeur puis attaque rapide',
    ],
    correctOption: 1,
  },
  {
    id: 'tq9',
    question: 'Comment identifier la rotation faible de l\'adversaire ?',
    options: [
      'Quand leur passeur est au filet (rotations 1, 2, 3)',
      'Quand leur meilleur attaquant est en arrière (rotation 4, 5, 6)',
      'Quand leur libéro est en réception',
      'Après un temps mort de l\'adversaire',
    ],
    correctOption: 1,
  },
  {
    id: 'tq10',
    question: 'En bloc de fermeture (commit), quel est le risque principal ?',
    options: [
      'Le passeur peut faire une feinte et marquer',
      'Un autre attaquant peut être libre (1v0)',
      'Le bloc peut être trop bas ou mal placé',
      'La défense arrière est découverte',
    ],
    correctOption: 1,
  },
];

export default function GameIntelligenceTestForm({
  onComplete,
  onCancel,
  initialData,
}: GameIntelligenceTestFormProps) {
  const [currentSection, setCurrentSection] = useState<'video' | 'tactical' | 'awareness'>('video');
  
  // Video Analysis State
  const [videoAnswers, setVideoAnswers] = useState<VideoAnalysisQuestion[]>(
    initialData?.videoAnswers || []
  );
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoAnswer, setVideoAnswer] = useState('');
  const [videoStartTime, setVideoStartTime] = useState(0);

  // Tactical Questions State
  const [tacticalAnswers, setTacticalAnswers] = useState<TacticalQuestion[]>(
    initialData?.tacticalAnswers || []
  );
  const [currentTacticalIndex, setCurrentTacticalIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [tacticalStartTime, setTacticalStartTime] = useState(0);

  // Court Awareness State
  const [courtAwareness, setCourtAwareness] = useState<number>(initialData?.courtAwareness || 3);
  const [visionRating, setVisionRating] = useState<number>(initialData?.visionRating || 3);
  const [awarenessNotes, setAwarenessNotes] = useState(initialData?.awarenessNotes || '');

  const currentVideo = VIDEO_SCENARIOS[currentVideoIndex];
  const currentTactical = TACTICAL_QUESTIONS[currentTacticalIndex];

  // Initialize timestamps client-side only to avoid hydration mismatch
  useEffect(() => {
    setVideoStartTime(Date.now());
    setTacticalStartTime(Date.now());
  }, []);

  // Video Analysis Handlers
  const handleVideoSubmit = () => {
    if (!videoAnswer.trim()) return;

    const responseTime = Math.round((Date.now() - videoStartTime) / 1000);
    
    // Simple similarity check (coach will verify correctness manually)
    const isCorrect = videoAnswer.toLowerCase().includes(currentVideo.correctAnswer.toLowerCase().slice(0, 20));

    const newAnswer: VideoAnalysisQuestion = {
      id: currentVideo.id,
      clipDescription: currentVideo.clipDescription,
      question: currentVideo.question,
      correctAnswer: currentVideo.correctAnswer,
      playerAnswer: videoAnswer.trim(),
      isCorrect,
      responseTime,
    };

    setVideoAnswers([...videoAnswers, newAnswer]);
    setVideoAnswer('');
    
    if (currentVideoIndex < VIDEO_SCENARIOS.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setVideoStartTime(Date.now());
    } else {
      setCurrentSection('tactical');
      setTacticalStartTime(Date.now());
    }
  };

  // Tactical Questions Handlers
  const handleTacticalSubmit = () => {
    if (selectedOption === -1) return;

    const responseTime = Math.round((Date.now() - tacticalStartTime) / 1000);
    const isCorrect = selectedOption === currentTactical.correctOption;

    const newAnswer: TacticalQuestion = {
      id: currentTactical.id,
      question: currentTactical.question,
      options: currentTactical.options,
      correctOption: currentTactical.correctOption,
      playerOption: selectedOption,
      isCorrect,
      responseTime,
    };

    setTacticalAnswers([...tacticalAnswers, newAnswer]);
    setSelectedOption(-1);

    if (currentTacticalIndex < TACTICAL_QUESTIONS.length - 1) {
      setCurrentTacticalIndex(currentTacticalIndex + 1);
      setTacticalStartTime(Date.now());
    } else {
      setCurrentSection('awareness');
    }
  };

  // Final Submit
  const handleFinalSubmit = () => {
    // Calculate metrics
    const videoCorrect = videoAnswers.filter(v => v.isCorrect).length;
    const videoScore = (videoCorrect / videoAnswers.length) * 100;
    const avgVideoTime = videoAnswers.reduce((sum, v) => sum + v.responseTime, 0) / videoAnswers.length;

    const tacticalCorrect = tacticalAnswers.filter(t => t.isCorrect).length;
    const tacticalScore = (tacticalCorrect / tacticalAnswers.length) * 100;
    const avgTacticalTime = tacticalAnswers.reduce((sum, t) => sum + t.responseTime, 0) / tacticalAnswers.length;

    const totalScore = (videoScore * 0.4) + (tacticalScore * 0.6); // Tactical weighted more
    const avgResponseTime = (avgVideoTime + avgTacticalTime) / 2;

    // Rating based on standards
    let intelligenceRating = 1;
    if (totalScore >= 85 && avgResponseTime <= 20 && courtAwareness >= 4.0) {
      intelligenceRating = 10; // Elite
    } else if (totalScore >= 80 && avgResponseTime <= 25 && courtAwareness >= 3.8) {
      intelligenceRating = 9;
    } else if (totalScore >= 75 && avgResponseTime <= 30 && courtAwareness >= 3.5) {
      intelligenceRating = 8; // Advanced
    } else if (totalScore >= 70 && avgResponseTime <= 35 && courtAwareness >= 3.2) {
      intelligenceRating = 7;
    } else if (totalScore >= 65 && avgResponseTime <= 45 && courtAwareness >= 3.0) {
      intelligenceRating = 6; // Good
    } else if (totalScore >= 60) {
      intelligenceRating = 5;
    } else if (totalScore >= 55) {
      intelligenceRating = 4;
    } else if (totalScore >= 50) {
      intelligenceRating = 3;
    } else if (totalScore >= 40) {
      intelligenceRating = 2;
    } else {
      intelligenceRating = 1;
    }

    const testData = {
      testId: 'game_intelligence',
      category: 'MENTAL',
      videoAnswers,
      tacticalAnswers,
      courtAwareness,
      visionRating,
      awarenessNotes,
      metrics: {
        videoScore: parseFloat(videoScore.toFixed(1)),
        tacticalScore: parseFloat(tacticalScore.toFixed(1)),
        totalScore: parseFloat(totalScore.toFixed(1)),
        averageResponseTime: Math.round(avgResponseTime),
        courtAwarenessRating: courtAwareness,
        intelligenceRating,
      },
      completedAt: new Date().toISOString(),
    };

    onComplete(testData);
  };

  const canSubmitVideo = videoAnswer.trim().length > 10;
  const canSubmitTactical = selectedOption !== -1;
  const canSubmitFinal = videoAnswers.length === VIDEO_SCENARIOS.length && 
                         tacticalAnswers.length === TACTICAL_QUESTIONS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Test d&apos;Intelligence de Jeu
          </CardTitle>
          <CardDescription>
            Évaluation de la compréhension tactique, analyse vidéo et conscience du terrain.
            Durée: 30 minutes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4">
              <Badge variant={currentSection === 'video' ? 'default' : videoAnswers.length === VIDEO_SCENARIOS.length ? 'secondary' : 'outline'}>
                <Video className="h-3 w-3 mr-1" />
                Vidéos {videoAnswers.length}/{VIDEO_SCENARIOS.length}
              </Badge>
              <Badge variant={currentSection === 'tactical' ? 'default' : tacticalAnswers.length === TACTICAL_QUESTIONS.length ? 'secondary' : 'outline'}>
                <HelpCircle className="h-3 w-3 mr-1" />
                Tactique {tacticalAnswers.length}/{TACTICAL_QUESTIONS.length}
              </Badge>
              <Badge variant={currentSection === 'awareness' ? 'default' : 'outline'}>
                <MapPin className="h-3 w-3 mr-1" />
                Awareness
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Video Analysis */}
      {currentSection === 'video' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5" />
              Analyse Vidéo {currentVideoIndex + 1}/{VIDEO_SCENARIOS.length}
            </CardTitle>
            <CardDescription>{currentVideo.clipDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed">
              <p className="text-sm text-gray-600 text-center">
                📹 [Vidéo simulée : {currentVideo.clipDescription}]
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                Dans un environnement réel, afficher le clip vidéo ici
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {currentVideo.question}
              </label>
              <textarea
                value={videoAnswer}
                onChange={(e) => setVideoAnswer(e.target.value)}
                placeholder="Analysez la situation et expliquez ce que vous observez..."
                className="w-full p-3 border rounded-lg text-sm h-24 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 caractères requis
              </p>
            </div>

            <Button
              onClick={handleVideoSubmit}
              disabled={!canSubmitVideo}
              className="w-full"
              size="lg"
            >
              {currentVideoIndex < VIDEO_SCENARIOS.length - 1 ? 'Suivant' : 'Terminer les vidéos'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 2: Tactical Questions */}
      {currentSection === 'tactical' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Question Tactique {currentTacticalIndex + 1}/{TACTICAL_QUESTIONS.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900">{currentTactical.question}</p>
            </div>

            <div className="space-y-2">
              {currentTactical.options.map((option, index) => (
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

            <Button
              onClick={handleTacticalSubmit}
              disabled={!canSubmitTactical}
              className="w-full"
              size="lg"
            >
              {currentTacticalIndex < TACTICAL_QUESTIONS.length - 1 ? 'Question suivante' : 'Terminer les questions'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Court Awareness */}
      {currentSection === 'awareness' && (
        <>
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Évaluation de la Conscience du Terrain
              </CardTitle>
              <CardDescription className="text-purple-700">
                Évaluation par le coach de la vision de jeu et du positionnement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-900">
                  Court Awareness (Conscience du terrain) - 1 à 5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={courtAwareness === rating ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setCourtAwareness(rating)}
                      className="flex-1"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  Capacité à lire le jeu, anticiper les mouvements, se positionner correctement
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-900">
                  Vision périphérique et 3D - 1 à 5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={visionRating === rating ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setVisionRating(rating)}
                      className="flex-1"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  Voir le bloc, les coéquipiers, les espaces vides simultanément
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-900">
                  Notes d&apos;observation
                </label>
                <textarea
                  value={awarenessNotes}
                  onChange={(e) => setAwarenessNotes(e.target.value)}
                  placeholder="Points forts en vision de jeu, axes d'amélioration..."
                  className="w-full p-3 border rounded-lg text-sm h-24 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {videoAnswers.length > 0 && tacticalAnswers.length > 0 && (
            <Card className="border-gray-300">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Résumé du Test</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {((videoAnswers.filter(v => v.isCorrect).length / videoAnswers.length) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-600">Analyse Vidéo</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {((tacticalAnswers.filter(t => t.isCorrect).length / tacticalAnswers.length) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-600">Questions Tactiques</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {courtAwareness.toFixed(1)}/5
                    </p>
                    <p className="text-xs text-gray-600">Court Awareness</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Actions */}
      {currentSection === 'awareness' && (
        <div className="flex gap-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={handleFinalSubmit}
            disabled={!canSubmitFinal}
            className="flex-1"
            size="lg"
          >
            Terminer le test
          </Button>
        </div>
      )}

      {/* Standards Reference */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4">
          <h4 className="text-xs font-semibold mb-2 text-gray-700">📊 Standards de Référence</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Elite:</span> Score &gt;85%, Temps &lt;20s, Awareness &gt;4.0
            </div>
            <div>
              <span className="font-medium">Advanced:</span> Score 75-85%, Temps 20-30s, Awareness 3.5-4.0
            </div>
            <div>
              <span className="font-medium">Good:</span> Score 65-75%, Temps 30-45s, Awareness 3.0-3.5
            </div>
            <div>
              <span className="font-medium">Developing:</span> Score &lt;65%, Temps &gt;45s, Awareness &lt;3.0
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
