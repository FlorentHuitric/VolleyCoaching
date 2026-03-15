'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  AlertTriangle, 
  Target,
  Activity,
  Brain,
  Zap,
  Users,
  CheckCircle2,
  XCircle,
  Circle
} from 'lucide-react';
import { 
  PlayerPosition,
  getPositionWeights,
  calculatePositionWeightedScore,
  analyzePositionProfile,
  getTrainingPriorities,
  SkillCategory
} from '@/utils/positionWeights';

interface ProDashboardProps {
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  evaluationData: {
    sessionId: string;
    date: Date;
    testScores: Record<string, number>; // testId -> score (1-10)
    testDetails: Record<string, any>; // testId -> full test data
  };
  historicalData?: Array<{
    date: Date;
    testScores: Record<string, number>;
  }>;
}

/**
 * Professional Player Evaluation Dashboard
 * Provides comprehensive analytics with 3 views:
 * 1. Individual Profile (this component)
 * 2. Team Comparison (separate component)
 * 3. Temporal Evolution (separate component)
 */
export default function ProPlayerDashboard({
  playerId,
  playerName,
  position,
  evaluationData,
  historicalData = []
}: ProDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'recommendations'>('overview');

  // Calculate position-weighted metrics
  const analysis = useMemo(() => 
    analyzePositionProfile(evaluationData.testScores, position),
    [evaluationData.testScores, position]
  );

  const trainingPriorities = useMemo(() => 
    getTrainingPriorities(evaluationData.testScores, position),
    [evaluationData.testScores, position]
  );

  const positionWeights = getPositionWeights(position);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    const categories = ['Physique', 'Technique', 'Tactique', 'Mental'];
    const testScores = evaluationData.testScores;

    // Categorize tests
    const physical = ['vertical_jump', 'sprint', 'agility', 'endurance'];
    const technical = ['serving_accuracy', 'passing', 'setting_accuracy', 'attacking', 'blocking', 'defense'];
    const tactical = ['game_situation'];
    const mental = ['mental_toughness', 'game_intelligence', 'leadership', 'communication'];

    const calculateAvg = (tests: string[]) => {
      const scores = tests.filter(t => testScores[t] !== undefined).map(t => testScores[t]);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    };

    return [
      { category: 'Physique', score: calculateAvg(physical), fullMark: 10 },
      { category: 'Technique', score: calculateAvg(technical), fullMark: 10 },
      { category: 'Tactique', score: calculateAvg(tactical), fullMark: 10 },
      { category: 'Mental', score: calculateAvg(mental), fullMark: 10 }
    ];
  }, [evaluationData.testScores]);

  // Prepare detailed bar chart data
  const barChartData = useMemo(() => {
    return Object.entries(evaluationData.testScores)
      .map(([testId, score]) => ({
        test: formatTestName(testId),
        score,
        benchmark: 7, // Elite benchmark
        testId
      }))
      .sort((a, b) => b.score - a.score);
  }, [evaluationData.testScores]);

  // Get rating badge
  const getRatingBadge = (score: number) => {
    if (score >= 9) return <Badge className="bg-purple-600">Elite</Badge>;
    if (score >= 7) return <Badge className="bg-blue-600">Avancé</Badge>;
    if (score >= 5) return <Badge className="bg-green-600">Bon</Badge>;
    return <Badge variant="destructive">Développement</Badge>;
  };

  // Get trend icon
  const getTrendIcon = (score: number, benchmark: number = 7) => {
    if (score >= benchmark) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= benchmark - 1) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{playerName}</CardTitle>
              <CardDescription>
                Évaluation Professionnelle Complète - {position.replace('_', ' ')}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {analysis.overallRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Note Globale</div>
              {getRatingBadge(analysis.overallRating)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="detailed">Analyse détaillée</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Profil Multidimensionnel
                </CardTitle>
                <CardDescription>
                  Performance dans les 4 dimensions clés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {radarData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                      <span className="font-bold">{item.score.toFixed(1)}/10</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Forces & Faiblesses
                </CardTitle>
                <CardDescription>
                  Analyse selon profil {position.replace('_', ' ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Strengths */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-green-600" />
                    Points Forts (Top 3)
                  </h4>
                  <div className="space-y-2">
                    {analysis.strengths.map((strength, idx) => (
                      <div
                        key={strength.test}
                        className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {formatTestName(strength.test)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {strength.importance}
                          </Badge>
                        </div>
                        <span className="font-bold text-green-700 dark:text-green-400">
                          {strength.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weaknesses */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Points à Améliorer (Top 3)
                  </h4>
                  <div className="space-y-2">
                    {analysis.weaknesses.map((weakness, idx) => (
                      <div
                        key={weakness.test}
                        className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">
                            {formatTestName(weakness.test)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {weakness.importance}
                          </Badge>
                        </div>
                        <span className="font-bold text-orange-700 dark:text-orange-400">
                          {weakness.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Catégorie</CardTitle>
              <CardDescription>
                Pondération spécifique pour {position.replace('_', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(positionWeights.categoryWeights).map(([category, weight]) => {
                  const categoryScore = radarData.find(
                    d => d.category.toLowerCase() === category
                  )?.score || 0;
                  
                  const icons = {
                    physical: Zap,
                    technical: Activity,
                    tactical: Brain,
                    mental: Users
                  };
                  const Icon = icons[category as keyof typeof icons];

                  return (
                    <Card key={category}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Icon className="w-8 h-8 text-blue-600" />
                          <div className="text-sm font-medium capitalize">
                            {category === 'physical' && 'Physique'}
                            {category === 'technical' && 'Technique'}
                            {category === 'tactical' && 'Tactique'}
                            {category === 'mental' && 'Mental'}
                          </div>
                          <div className="text-2xl font-bold">{categoryScore.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">
                            Poids: {weight}%
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(categoryScore / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: DETAILED ANALYSIS */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tous les Tests</CardTitle>
              <CardDescription>
                Comparaison avec les standards Elite (7/10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis dataKey="test" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="benchmark" fill="#d1d5db" name="Benchmark Elite" />
                  <Bar dataKey="score" fill="#3b82f6" name="Score Joueur" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Test Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tableau Détaillé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Test</th>
                      <th className="text-center p-2">Score</th>
                      <th className="text-center p-2">Rating</th>
                      <th className="text-center p-2">Tendance</th>
                      <th className="text-left p-2">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barChartData.map((item) => (
                      <tr key={item.testId} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{item.test}</td>
                        <td className="p-2 text-center font-bold">{item.score.toFixed(1)}/10</td>
                        <td className="p-2 text-center">{getRatingBadge(item.score)}</td>
                        <td className="p-2 flex justify-center">{getTrendIcon(item.score)}</td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {getTestComment(item.score)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: RECOMMENDATIONS */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Priorités d'Entraînement
              </CardTitle>
              <CardDescription>
                Recommandations basées sur le profil {position.replace('_', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trainingPriorities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <p className="font-semibold">Excellent profil !</p>
                  <p className="text-sm">Toutes les compétences clés sont au niveau Elite.</p>
                  <p className="text-sm mt-2">Focus sur le maintien et l'affinement des détails.</p>
                </div>
              ) : (
                trainingPriorities.map((priority, idx) => (
                  <Card
                    key={idx}
                    className={
                      priority.priority === 'high'
                        ? 'border-red-500 border-2'
                        : priority.priority === 'medium'
                        ? 'border-orange-500'
                        : 'border-blue-500'
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">
                          {priority.category}
                        </CardTitle>
                        <Badge
                          variant={
                            priority.priority === 'high'
                              ? 'destructive'
                              : priority.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          Priorité {priority.priority === 'high' ? 'Haute' : priority.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </Badge>
                      </div>
                      <CardDescription>{priority.reasoning}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Tests concernés :</p>
                        <div className="flex flex-wrap gap-2">
                          {priority.tests.map((testId) => (
                            <Badge key={testId} variant="outline">
                              {formatTestName(testId)}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-muted rounded">
                          <p className="text-sm font-semibold mb-2">Recommandations :</p>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            {getTrainingRecommendations(priority.category, priority.tests)}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Plan d'Action Suggéré</CardTitle>
              <CardDescription>Calendrier de développement sur 12 semaines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Semaines 1-4</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p className="font-semibold text-red-600">Focus : Faiblesses critiques</p>
                      {trainingPriorities
                        .filter(p => p.priority === 'high')
                        .map((p, idx) => (
                          <p key={idx}>• {p.category} - 3x/semaine</p>
                        ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Semaines 5-8</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p className="font-semibold text-orange-600">Focus : Consolidation</p>
                      <p>• Maintien faiblesses corrigées</p>
                      <p>• Développement priorités moyennes</p>
                      <p>• Tests de progrès</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Semaines 9-12</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p className="font-semibold text-blue-600">Focus : Optimisation</p>
                      <p>• Affinage des forces</p>
                      <p>• Intégration en match</p>
                      <p>• Réévaluation complète</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions
function formatTestName(testId: string): string {
  const names: Record<string, string> = {
    vertical_jump: 'Saut Vertical',
    sprint: 'Vitesse',
    agility: 'Agilité',
    endurance: 'Endurance',
    serving_accuracy: 'Précision Service',
    serving_power: 'Puissance Service',
    passing: 'Réception',
    setting_accuracy: 'Précision Passe',
    setting_consistency: 'Consistance Passe',
    attacking: 'Attaque',
    attacking_power: 'Puissance Attaque',
    blocking: 'Contre',
    defense: 'Défense',
    game_situation: 'Situation de Jeu',
    mental_toughness: 'Résilience',
    game_intelligence: 'Intelligence',
    leadership: 'Leadership',
    communication: 'Communication'
  };
  return names[testId] || testId;
}

function getTestComment(score: number): string {
  if (score >= 9) return 'Performance exceptionnelle, niveau Elite';
  if (score >= 7) return 'Très bon niveau, compétence solide';
  if (score >= 5) return 'Niveau correct, marge de progression';
  if (score >= 3) return 'Nécessite travail actif';
  return 'Priorité de développement urgente';
}

function getTrainingRecommendations(category: SkillCategory, tests: string[]): React.ReactElement[] {
  const recommendations: Record<SkillCategory, string[]> = {
    physical: [
      'Entraînement pliométrique 3x/semaine',
      'Travail de vitesse avec sprints courts',
      'Circuit d\'agilité spécifique volleyball',
      'Conditionnement cardiovasculaire'
    ],
    technical: [
      'Drills techniques répétitifs (1000 touches)',
      'Travail vidéo pour analyse gestuelle',
      'Situations de jeu ciblées',
      'Séances avec coach technique spécialisé'
    ],
    tactical: [
      'Analyse vidéo de matchs professionnels',
      'Débriefings tactiques après entraînements',
      'Exercices de lecture de jeu',
      'Simulations de décisions sous pression'
    ],
    mental: [
      'Séances avec psychologue sportif',
      'Techniques de visualisation',
      'Travail de communication en équipe',
      'Exercices de gestion du stress'
    ]
  };

  return recommendations[category].map((rec, idx) => <li key={idx}>{rec}</li>);
}
