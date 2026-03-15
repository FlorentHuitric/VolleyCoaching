'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Plus,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Brain,
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { TEST_BATTERIES, TestBattery } from '@/types/evaluation-tests';
import { PlayerType } from '@/types/player';

// Type alias for backward compatibility
type PlayerProfile = PlayerType;
import { useEvaluationHistory } from '@/hooks/useEvaluations';
import NewEvaluationWizard from './NewEvaluationWizard';
import EvaluationHistory from './EvaluationHistory';

export default function EvaluationDashboard() {
  const { currentTeamId } = useTeam();
  
  // Fetch players via Apollo Client
  const { data, loading: playersLoading, refetch } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId
  });
  
  const players: PlayerProfile[] = data?.playersByTeam || [];
  
  const [activeTab, setActiveTab] = useState('new');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<TestBattery | null>(null);

  // Refetch players when team changes
  useEffect(() => {
    if (currentTeamId) {
      refetch();
    }
  }, [currentTeamId, refetch]);

  const handleStartEvaluation = (player: PlayerProfile, battery: TestBattery) => {
    setSelectedPlayer(player);
    setSelectedBattery(battery);
  };

  const handleCloseWizard = () => {
    setSelectedPlayer(null);
    setSelectedBattery(null);
  };

  // Show message if no team selected
  if (!currentTeamId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">Aucune équipe sélectionnée</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Veuillez sélectionner une équipe dans le menu en haut à droite pour commencer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show wizard if player and battery selected
  if (selectedPlayer && selectedBattery) {
    return (
      <NewEvaluationWizard
        player={selectedPlayer}
        battery={selectedBattery}
        onClose={handleCloseWizard}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <ClipboardCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Centre d'Évaluation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Évaluez vos joueurs avec des tests standardisés et suivez leur progression
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouvelle Évaluation</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Historique</span>
          </TabsTrigger>
          <TabsTrigger value="batteries" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Batteries de Tests</span>
          </TabsTrigger>
        </TabsList>

        {/* New Evaluation */}
        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Sélectionnez un joueur à évaluer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Chargement des joueurs...</span>
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun joueur disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map(player => (
                    <PlayerEvaluationCard
                      key={player.id}
                      player={player}
                      onStartEvaluation={handleStartEvaluation}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <EvaluationHistory players={players} />
        </TabsContent>

        {/* Test Batteries */}
        <TabsContent value="batteries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span>Batteries de Tests Disponibles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEST_BATTERIES.map(battery => (
                  <TestBatteryCard key={battery.id} battery={battery} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface PlayerEvaluationCardProps {
  player: PlayerProfile;
  onStartEvaluation: (player: PlayerProfile, battery: TestBattery) => void;
}

function PlayerEvaluationCard({ player, onStartEvaluation }: PlayerEvaluationCardProps) {
  const [selectedBattery, setSelectedBattery] = useState<string>('');

  // Get evaluation history from GraphQL
  const { data: historyData, loading } = useEvaluationHistory(player.id);
  const evaluations = historyData?.evaluationHistory || [];
  const lastEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;

  // Get recommended battery based on position
  const recommendedBatteries = TEST_BATTERIES.filter(
    b => b.positions.includes(player.primaryPosition) || b.positions.includes('ALL')
  );

  const handleStart = () => {
    const battery = TEST_BATTERIES.find(b => b.id === selectedBattery);
    if (battery) {
      onStartEvaluation(player, battery);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={player.avatar || undefined} />
            <AvatarFallback className="bg-blue-600 text-white font-bold">
              {player.jerseyNumber}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {player.firstName} {player.lastName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {player.primaryPosition} • #{player.jerseyNumber}
            </p>
            <Badge variant="outline" className="mt-1">
              Note: {player.currentEvaluation?.overallRating || 'N/A'}
            </Badge>
          </div>
        </div>

        {lastEval && (
          <div className="text-xs text-gray-500 mb-3 flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              Dernière éval: {new Date(lastEval.evaluationDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Batterie de tests:</label>
          <select
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-sm"
            value={selectedBattery}
            onChange={(e) => setSelectedBattery(e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {recommendedBatteries.map(battery => (
              <option key={battery.id} value={battery.id}>
                {battery.name} ({battery.estimatedDuration}min)
              </option>
            ))}
          </select>
        </div>

        <Button
          className="w-full mt-3"
          onClick={handleStart}
          disabled={!selectedBattery}
        >
          <Plus className="h-4 w-4 mr-2" />
          Démarrer l'évaluation
        </Button>
      </CardContent>
    </Card>
  );
}

interface TestBatteryCardProps {
  battery: TestBattery;
}

function TestBatteryCard({ battery }: TestBatteryCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    elite: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const useCaseLabels = {
    initial_assessment: 'Évaluation Initiale',
    progress_check: 'Suivi de Progression',
    season_start: 'Début de Saison',
    tryout: 'Tryout',
    injury_recovery: 'Retour de Blessure'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{battery.name}</CardTitle>
          <Badge className={difficultyColors[battery.difficulty]}>
            {battery.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {battery.description}
        </p>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Activity className="h-4 w-4 text-gray-500" />
            <span>{battery.estimatedDuration} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4 text-gray-500" />
            <span>{battery.requiredTests.length} tests</span>
          </div>
        </div>

        <div>
          <Badge variant="outline" className="text-xs">
            {useCaseLabels[battery.useCase]}
          </Badge>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Tests inclus:
          </p>
          <div className="flex flex-wrap gap-1">
            {battery.requiredTests.map(testId => (
              <Badge key={testId} variant="secondary" className="text-xs">
                {testId.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Postes recommandés:
          </p>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {battery.positions.join(', ')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
