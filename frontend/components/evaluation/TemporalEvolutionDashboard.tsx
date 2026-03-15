'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2,
  Target,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { PlayerPosition, calculatePositionWeightedScore } from '@/utils/positionWeights';
import { format, parseISO, differenceInDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EvaluationSnapshot {
  date: Date | string;
  testScores: Record<string, number>;
  notes?: string;
  eventType?: 'evaluation' | 'competition' | 'injury' | 'training_camp' | 'milestone';
  eventLabel?: string;
}

interface TemporalEvolutionProps {
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  evaluations: EvaluationSnapshot[];
}

type TimePeriod = '1m' | '3m' | '6m' | '1y' | 'all';
type ViewMode = 'categories' | 'individual' | 'overall';

/**
 * Temporal Evolution Dashboard
 * Track player progress over time with trend analysis
 */
export default function TemporalEvolutionDashboard({
  playerId,
  playerName,
  position,
  evaluations
}: TemporalEvolutionProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  // Sort evaluations by date
  const sortedEvaluations = useMemo(() => {
    return [...evaluations]
      .map(e => ({
        ...e,
        date: typeof e.date === 'string' ? parseISO(e.date) : e.date
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [evaluations]);

  // Filter by time period
  const filteredEvaluations = useMemo(() => {
    if (timePeriod === 'all') return sortedEvaluations;
    
    const now = new Date();
    const cutoffDate = (() => {
      switch (timePeriod) {
        case '1m': return subMonths(now, 1);
        case '3m': return subMonths(now, 3);
        case '6m': return subMonths(now, 6);
        case '1y': return subMonths(now, 12);
        default: return new Date(0);
      }
    })();
    
    return sortedEvaluations.filter(e => e.date >= cutoffDate);
  }, [sortedEvaluations, timePeriod]);

  // Prepare line chart data for categories
  const categoryEvolutionData = useMemo(() => {
    return filteredEvaluations.map(evaluation => {
      const physical = ['vertical_jump', 'sprint', 'agility', 'endurance'];
      const technical = ['serving_accuracy', 'passing', 'attacking', 'blocking', 'defense'];
      const tactical = ['game_situation'];
      const mental = ['mental_toughness', 'game_intelligence', 'leadership', 'communication'];

      const calculateAvg = (tests: string[]) => {
        const scores = tests.filter(t => evaluation.testScores[t] !== undefined).map(t => evaluation.testScores[t]);
        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      };

      const overallRating = calculatePositionWeightedScore(evaluation.testScores, position);

      return {
        date: format(evaluation.date, 'dd MMM yyyy', { locale: fr }),
        timestamp: evaluation.date.getTime(),
        Physique: calculateAvg(physical),
        Technique: calculateAvg(technical),
        Tactique: calculateAvg(tactical),
        Mental: calculateAvg(mental),
        Global: overallRating,
        eventType: evaluation.eventType,
        eventLabel: evaluation.eventLabel
      };
    });
  }, [filteredEvaluations, position]);

  // Get all available tests
  const availableTests = useMemo(() => {
    const testSet = new Set<string>();
    filteredEvaluations.forEach(e => {
      Object.keys(e.testScores).forEach(testId => testSet.add(testId));
    });
    return Array.from(testSet);
  }, [filteredEvaluations]);

  // Prepare individual test evolution data
  const individualTestData = useMemo(() => {
    const testsToShow = selectedTests.length > 0 ? selectedTests : availableTests.slice(0, 5);
    
    return filteredEvaluations.map(evaluation => {
      const dataPoint: any = {
        date: format(evaluation.date, 'dd MMM yyyy', { locale: fr }),
        timestamp: evaluation.date.getTime()
      };
      
      testsToShow.forEach(testId => {
        dataPoint[formatTestName(testId)] = evaluation.testScores[testId] || null;
      });
      
      return dataPoint;
    });
  }, [filteredEvaluations, selectedTests, availableTests]);

  // Calculate trends
  const trends = useMemo(() => {
    if (filteredEvaluations.length < 2) return null;

    const first = filteredEvaluations[0];
    const last = filteredEvaluations[filteredEvaluations.length - 1];
    
    const firstOverall = calculatePositionWeightedScore(first.testScores, position);
    const lastOverall = calculatePositionWeightedScore(last.testScores, position);
    
    const overallChange = lastOverall - firstOverall;
    const overallChangePercent = (overallChange / firstOverall) * 100;
    
    const daysBetween = differenceInDays(last.date, first.date);
    const evaluationCount = filteredEvaluations.length;
    
    // Category changes
    const categories = {
      physical: ['vertical_jump', 'sprint', 'agility', 'endurance'],
      technical: ['serving_accuracy', 'passing', 'attacking', 'blocking', 'defense'],
      tactical: ['game_situation'],
      mental: ['mental_toughness', 'game_intelligence', 'leadership', 'communication']
    };
    
    const categoryChanges: Record<string, number> = {};
    
    Object.entries(categories).forEach(([category, tests]) => {
      const firstScores = tests.filter(t => first.testScores[t] !== undefined).map(t => first.testScores[t]);
      const lastScores = tests.filter(t => last.testScores[t] !== undefined).map(t => last.testScores[t]);
      
      if (firstScores.length > 0 && lastScores.length > 0) {
        const firstAvg = firstScores.reduce((a, b) => a + b, 0) / firstScores.length;
        const lastAvg = lastScores.reduce((a, b) => a + b, 0) / lastScores.length;
        categoryChanges[category] = lastAvg - firstAvg;
      }
    });
    
    // Most improved test
    const testChanges: Array<{ test: string; change: number }> = [];
    availableTests.forEach(testId => {
      const firstScore = first.testScores[testId];
      const lastScore = last.testScores[testId];
      
      if (firstScore !== undefined && lastScore !== undefined) {
        testChanges.push({
          test: testId,
          change: lastScore - firstScore
        });
      }
    });
    
    testChanges.sort((a, b) => b.change - a.change);
    
    return {
      overallChange: Number(overallChange.toFixed(2)),
      overallChangePercent: Number(overallChangePercent.toFixed(1)),
      daysBetween,
      evaluationCount,
      categoryChanges,
      mostImproved: testChanges[0],
      leastImproved: testChanges[testChanges.length - 1]
    };
  }, [filteredEvaluations, position, availableTests]);

  // Detect stagnation or regression
  const alerts = useMemo(() => {
    if (filteredEvaluations.length < 3) return [];
    
    const alerts: Array<{ type: 'warning' | 'danger'; message: string }> = [];
    
    // Check last 3 evaluations for regression
    const lastThree = filteredEvaluations.slice(-3);
    const lastThreeOverall = lastThree.map(e => calculatePositionWeightedScore(e.testScores, position));
    
    if (lastThreeOverall[2] < lastThreeOverall[0]) {
      alerts.push({
        type: 'danger',
        message: `Régression détectée : -${(lastThreeOverall[0] - lastThreeOverall[2]).toFixed(1)} points sur les 3 dernières évaluations`
      });
    }
    
    // Check for stagnation (< 0.1 change over last 3 evals)
    const maxChange = Math.max(...lastThreeOverall) - Math.min(...lastThreeOverall);
    if (maxChange < 0.1) {
      alerts.push({
        type: 'warning',
        message: 'Stagnation détectée : Aucune progression significative sur les 3 dernières évaluations'
      });
    }
    
    // Check for specific category regression
    if (filteredEvaluations.length >= 2) {
      const recent = filteredEvaluations[filteredEvaluations.length - 1];
      const previous = filteredEvaluations[filteredEvaluations.length - 2];
      
      const categories = ['physical', 'technical', 'tactical', 'mental'];
      const categoryTests = {
        physical: ['vertical_jump', 'sprint', 'agility', 'endurance'],
        technical: ['serving_accuracy', 'passing', 'attacking', 'blocking', 'defense'],
        tactical: ['game_situation'],
        mental: ['mental_toughness', 'game_intelligence', 'leadership', 'communication']
      };
      
      categories.forEach(category => {
        const tests = categoryTests[category as keyof typeof categoryTests];
        const recentScores = tests.filter(t => recent.testScores[t] !== undefined).map(t => recent.testScores[t]);
        const previousScores = tests.filter(t => previous.testScores[t] !== undefined).map(t => previous.testScores[t]);
        
        if (recentScores.length > 0 && previousScores.length > 0) {
          const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
          const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
          
          if (recentAvg < previousAvg - 0.5) {
            const catName = category === 'physical' ? 'Physique' : 
                           category === 'technical' ? 'Technique' :
                           category === 'tactical' ? 'Tactique' : 'Mental';
            alerts.push({
              type: 'warning',
              message: `Baisse dans la catégorie ${catName} : -${(previousAvg - recentAvg).toFixed(1)} points`
            });
          }
        }
      });
    }
    
    return alerts;
  }, [filteredEvaluations, position]);

  // Export to CSV
  const exportToCSV = () => {
    let csv = 'Date,Note Globale,Physique,Technique,Tactique,Mental\n';
    
    categoryEvolutionData.forEach(point => {
      csv += [
        point.date,
        point.Global?.toFixed(1) || 'N/A',
        point.Physique?.toFixed(1) || 'N/A',
        point.Technique?.toFixed(1) || 'N/A',
        point.Tactique?.toFixed(1) || 'N/A',
        point.Mental?.toFixed(1) || 'N/A'
      ].join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolution_${playerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune donnée d'évolution disponible</p>
          <p className="text-sm text-muted-foreground mt-2">
            Au moins 2 évaluations sont nécessaires pour analyser la progression
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{playerName} - Évolution Temporelle</CardTitle>
              <CardDescription>
                {filteredEvaluations.length} évaluation(s) • 
                {filteredEvaluations.length >= 2 && ` ${differenceInDays(
                  filteredEvaluations[filteredEvaluations.length - 1].date,
                  filteredEvaluations[0].date
                )} jours`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Time Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold mr-2">Période :</span>
            {(['1m', '3m', '6m', '1y', 'all'] as TimePeriod[]).map(period => (
              <Button
                key={period}
                variant={timePeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimePeriod(period)}
              >
                {period === '1m' && '1 Mois'}
                {period === '3m' && '3 Mois'}
                {period === '6m' && '6 Mois'}
                {period === '1y' && '1 An'}
                {period === 'all' && 'Tout'}
              </Button>
            ))}
            
            <span className="text-sm font-semibold ml-4 mr-2">Vue :</span>
            {(['categories', 'individual', 'overall'] as ViewMode[]).map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(mode)}
              >
                {mode === 'categories' && 'Catégories'}
                {mode === 'individual' && 'Tests Individuels'}
                {mode === 'overall' && 'Note Globale'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Card
              key={idx}
              className={alert.type === 'danger' ? 'border-red-500 border-2' : 'border-orange-500'}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-5 h-5 ${alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'}`} />
                  <span className="font-medium">{alert.message}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trend Statistics */}
      {trends && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {trends.overallChange >= 0 ? (
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600" />
                )}
                <div className={`text-2xl font-bold ${trends.overallChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.overallChange >= 0 ? '+' : ''}{trends.overallChange}
                </div>
                <div className="text-sm text-muted-foreground">Évolution Globale</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ({trends.overallChangePercent >= 0 ? '+' : ''}{trends.overallChangePercent}%)
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{trends.evaluationCount}</div>
                <div className="text-sm text-muted-foreground">Évaluations</div>
                <div className="text-xs text-muted-foreground mt-1">
                  sur {trends.daysBetween} jours
                </div>
              </div>
            </CardContent>
          </Card>
          
          {trends.mostImproved && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-sm font-medium mb-1">{formatTestName(trends.mostImproved.test)}</div>
                  <div className="text-2xl font-bold text-green-600">
                    +{trends.mostImproved.change.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Plus gros progrès</div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {trends.leastImproved && trends.leastImproved.change < 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-sm font-medium mb-1">{formatTestName(trends.leastImproved.test)}</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {trends.leastImproved.change.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">À surveiller</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution dans le Temps</CardTitle>
          <CardDescription>
            {viewMode === 'categories' && 'Progression des 4 dimensions + note globale'}
            {viewMode === 'individual' && 'Progression des tests individuels'}
            {viewMode === 'overall' && 'Progression de la note globale pondérée'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'categories' && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={categoryEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={7} stroke="#d1d5db" strokeDasharray="3 3" label="Benchmark Elite" />
                <Line type="monotone" dataKey="Physique" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Technique" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Tactique" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Mental" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Global" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          
          {viewMode === 'individual' && (
            <>
              {selectedTests.length === 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  Affichage des 5 premiers tests. Sélectionnez des tests spécifiques ci-dessous.
                </div>
              )}
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={individualTestData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={7} stroke="#d1d5db" strokeDasharray="3 3" label="Elite" />
                  {Object.keys(individualTestData[0] || {})
                    .filter(key => key !== 'date' && key !== 'timestamp')
                    .map((key, idx) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
              
              {/* Test Selector */}
              <div className="mt-4 border-t pt-4">
                <div className="text-sm font-semibold mb-2">Sélectionner des tests :</div>
                <div className="flex flex-wrap gap-2">
                  {availableTests.map(testId => (
                    <Button
                      key={testId}
                      size="sm"
                      variant={selectedTests.includes(testId) ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedTests(prev => {
                          if (prev.includes(testId)) {
                            return prev.filter(t => t !== testId);
                          }
                          if (prev.length >= 8) {
                            toast.warning('Maximum 8 tests peuvent être affichés simultanément');
                            return prev;
                          }
                          return [...prev, testId];
                        });
                      }}
                    >
                      {formatTestName(testId)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {viewMode === 'overall' && (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={categoryEvolutionData}>
                <defs>
                  <linearGradient id="colorGlobal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <ReferenceLine y={7} stroke="#d1d5db" strokeDasharray="3 3" label="Benchmark Elite" />
                <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="3 3" label="Bon" />
                <Area
                  type="monotone"
                  dataKey="Global"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorGlobal)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Progress Cards */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle>Progression par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(trends.categoryChanges).map(([category, change]) => {
                let label = category;
                if (category === 'physical') label = 'Physique';
                if (category === 'technical') label = 'Technique';
                if (category === 'tactical') label = 'Tactique';
                if (category === 'mental') label = 'Mental';
                
                return (
                  <Card key={category}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-sm font-medium capitalize mb-2">{label}</div>
                        <div className={`text-3xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}
                        </div>
                        {change >= 0 ? (
                          <TrendingUp className="w-5 h-5 mx-auto mt-2 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 mx-auto mt-2 text-red-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions
const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

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
