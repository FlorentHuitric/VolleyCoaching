'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@apollo/client';
import { PlayerType } from '@/types/player';
import { UPDATE_PLAYER } from '@/graphql/mutations/players';

// Type alias for backward compatibility
type PlayerProfile = PlayerType;
import { TestBattery, EvaluationSession, EvaluationTest } from '@/types/evaluation-tests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  Circle,
  Activity,
  Zap,
  Target,
  Brain,
  Loader2
} from 'lucide-react';
import { useCreateEvaluationSession, useCompleteEvaluationSession } from '@/hooks/useEvaluations';
import VerticalJumpTestForm from './tests/VerticalJumpTestForm';
import SprintTestForm from './tests/SprintTestForm';
import AgilityTestForm from './tests/AgilityTestForm';
import EnduranceTestForm from './tests/EnduranceTestForm';
import ServingAccuracyTestForm from './tests/ServingAccuracyTestForm';
import PassingTestForm from './tests/PassingTestForm';
import SettingAccuracyTestForm from './tests/SettingAccuracyTestForm';
import AttackingTestForm from './tests/AttackingTestForm';
import BlockingTestForm from './tests/BlockingTestForm';
import DefenseTestForm from './tests/DefenseTestForm';
// New test forms - Phase 1
import SettingConsistencyTestForm from './tests/SettingConsistencyTestForm';
import AttackingPowerTestForm from './tests/AttackingPowerTestForm';
import GameSituationTestForm from './tests/GameSituationTestForm';
// New test forms - Phase 2 (Mental evaluations)
import MentalToughnessTestForm from './tests/MentalToughnessTestForm';
import GameIntelligenceTestForm from './tests/GameIntelligenceTestForm';
import LeadershipEvaluationForm from './tests/LeadershipEvaluationForm';
import CommunicationTestForm from './tests/CommunicationTestForm';

interface NewEvaluationWizardProps {
  player: PlayerProfile;
  battery: TestBattery;
  onClose: () => void;
}

export default function NewEvaluationWizard({
  player,
  battery,
  onClose
}: NewEvaluationWizardProps) {
  const [updatePlayer] = useMutation(UPDATE_PLAYER);
  const { createEvaluationSession, sessionId, loading: creatingSession } = useCreateEvaluationSession();
  const { completeEvaluationSession, loading: completingSession } = useCompleteEvaluationSession();
  
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [completedTests, setCompletedTests] = useState<Set<number>>(new Set());

  // Create session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const newSessionId = await createEvaluationSession(
          player.id,
          'current_coach', // TODO: Get from auth context
          battery.name
        );
        
        // Create local session state for tracking tests
        setSession({
          id: newSessionId || `temp-${Date.now()}`,
          playerId: player.id,
          evaluatorId: 'current_coach',
          date: new Date(),
          location: 'Training Facility',
          duration: battery.estimatedDuration,
          tests: [],
          coachNotes: '',
          strengths: [],
          weaknesses: [],
          recommendations: [],
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Failed to create evaluation session:', error);
        toast.error('Erreur lors de la création de la session d\'évaluation');
        onClose();
      }
    };

    initSession();
  }, []);

  const currentTestId = battery.requiredTests[currentTestIndex];
  const progress = ((completedTests.size) / battery.requiredTests.length) * 100;

  const handleTestComplete = (testData: EvaluationTest) => {
    if (!session) return;
    
    // Update session with new test
    const updatedSession = {
      ...session,
      tests: [...session.tests.filter(t => t.testId !== testData.testId), testData]
    };
    setSession(updatedSession);
    setCompletedTests(new Set([...completedTests, currentTestIndex]));
  };

  const handleNext = () => {
    if (currentTestIndex < battery.requiredTests.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTestIndex > 0) {
      setCurrentTestIndex(currentTestIndex - 1);
    }
  };

  const handleFinish = async () => {
    if (!session) return;

    try {
      // Prepare evaluation data from completed tests
      const evaluationData = {
        evaluationDate: new Date().toISOString(),
        notes: `Évaluation complétée avec la batterie ${battery.name}`,
        tests: session.tests // Include all test data
      };

      // Complete session via GraphQL
      const completedEvaluation = await completeEvaluationSession(
        session.id,
        evaluationData
      );

      // Update player's last evaluation date via GraphQL mutation
      await updatePlayer({
        variables: {
          id: player.id,
          input: {
            lastEvaluationDate: new Date().toISOString()
          }
        },
        refetchQueries: ['GetPlayer', 'GetPlayersByTeam']
      });

      toast.success(`Évaluation terminée avec ${session.tests.length} tests!`);
      onClose();
    } catch (error) {
      console.error('Failed to complete evaluation:', error);
      toast.error('Erreur lors de la finalisation de l\'évaluation');
    }
  };

  const canFinish = completedTests.size === battery.requiredTests.length;

  // Show loading while creating session
  if (creatingSession || !session) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Initialisation de l'évaluation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onClose} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Annuler l'évaluation
        </Button>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {player.firstName} {player.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {battery.name} • {battery.estimatedDuration} minutes
                </p>
              </div>
              <Badge className="text-lg px-4 py-2">
                {completedTests.size} / {battery.requiredTests.length} tests
              </Badge>
            </div>

            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Test Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Test List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {battery.requiredTests.map((testId, index) => {
                  const isCompleted = completedTests.has(index);
                  const isCurrent = index === currentTestIndex;

                  return (
                    <button
                      key={testId}
                      onClick={() => setCurrentTestIndex(index)}
                      className={`
                        w-full flex items-center space-x-2 p-3 rounded-lg text-left transition-all
                        ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500' : ''}
                        ${isCompleted && !isCurrent ? 'bg-green-50 dark:bg-green-900/20' : ''}
                        ${!isCompleted && !isCurrent ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {testId.replace(/_/g, ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Current Test */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getTestIcon(currentTestId)}
                  <span>{currentTestId.replace(/_/g, ' ')}</span>
                </CardTitle>
                <Badge variant="outline">
                  Test {currentTestIndex + 1} / {battery.requiredTests.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Render appropriate test form */}
              {renderTestForm(currentTestId, session, handleTestComplete)}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentTestIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>

                <div className="flex items-center space-x-2">
                  {currentTestIndex < battery.requiredTests.length - 1 ? (
                    <Button onClick={handleNext}>
                      Suivant
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      disabled={!canFinish || completingSession}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {completingSession ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Finalisation...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terminer l'évaluation
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper to get appropriate icon for test type
function getTestIcon(testId: string) {
  if (testId.includes('vertical') || testId.includes('sprint') || testId.includes('agility') || testId.includes('endurance')) {
    return <Zap className="h-5 w-5 text-orange-600" />;
  }
  if (testId.includes('serving') || testId.includes('attacking')) {
    return <Target className="h-5 w-5 text-red-600" />;
  }
  if (testId.includes('passing') || testId.includes('setting') || testId.includes('blocking') || testId.includes('defense')) {
    return <Activity className="h-5 w-5 text-blue-600" />;
  }
  return <Brain className="h-5 w-5 text-purple-600" />;
}

// Helper to render appropriate test form
function renderTestForm(
  testId: string,
  session: EvaluationSession,
  onComplete: (test: EvaluationTest) => void
) {
  const existingTest = session.tests.find(t => t.testId === testId);

  switch (testId) {
    case 'vertical_jump':
      return <VerticalJumpTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'sprint':
      return <SprintTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'agility':
      return <AgilityTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'endurance':
      return <EnduranceTestForm onComplete={onComplete as any} />;
    case 'serving_accuracy':
      return <ServingAccuracyTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'passing':
      return <PassingTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'setting_accuracy':
      return <SettingAccuracyTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'setting_consistency':
      return <SettingConsistencyTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'attacking':
      return <AttackingTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'attacking_power':
      return <AttackingPowerTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'blocking':
      return <BlockingTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'defense':
      return <DefenseTestForm initialData={existingTest as any} onComplete={onComplete} />;
    case 'game_situation':
      return <GameSituationTestForm initialData={existingTest as any} onComplete={onComplete} />;
    
    // Phase 2 - Mental tests
    case 'mental_toughness':
      return <MentalToughnessTestForm 
        initialData={existingTest as any} 
        onComplete={onComplete} 
        onCancel={() => onComplete({ testId: 'mental_toughness', category: 'MENTAL', results: {} } as any)} 
      />;
    
    case 'game_intelligence':
      return <GameIntelligenceTestForm 
        initialData={existingTest as any} 
        onComplete={onComplete} 
        onCancel={() => onComplete({ testId: 'game_intelligence', category: 'MENTAL', results: {} } as any)} 
      />;
    
    case 'leadership':
      return <LeadershipEvaluationForm 
        initialData={existingTest as any} 
        onComplete={onComplete} 
        onCancel={() => onComplete({ testId: 'leadership', category: 'MENTAL', results: {} } as any)} 
      />;
    
    case 'communication':
      return <CommunicationTestForm 
        initialData={existingTest as any} 
        onComplete={onComplete} 
        onCancel={() => onComplete({ testId: 'communication', category: 'MENTAL', results: {} } as any)} 
      />;
    
    default:
      return (
        <div className="p-8 text-center text-gray-500">
          <p>Formulaire pour {testId} en cours de développement</p>
          <Button onClick={() => onComplete({ testId, category: 'physical' } as any)} className="mt-4">
            Marquer comme complété (temporaire)
          </Button>
        </div>
      );
  }
}
