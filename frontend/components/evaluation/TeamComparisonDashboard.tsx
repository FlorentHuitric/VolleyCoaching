'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Cell
} from 'recharts';
import { 
  Users, 
  Trophy,
  TrendingUp,
  Award,
  Target,
  Download,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PlayerPosition,
  calculatePositionWeightedScore
} from '@/utils/positionWeights';

interface PlayerEvaluation {
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  jerseyNumber?: number;
  testScores: Record<string, number>;
  overallRating?: number;
  color: string; // Pour le graphique radar
}

interface TeamComparisonProps {
  teamName: string;
  players: PlayerEvaluation[];
  showPositionFilter?: boolean;
}

const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

/**
 * Team Comparison Dashboard
 * Compare multiple players side-by-side with various visualizations
 */
export default function TeamComparisonDashboard({
  teamName,
  players,
  showPositionFilter = true
}: TeamComparisonProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    players.slice(0, 4).map(p => p.playerId) // Select first 4 by default
  );
  const [positionFilter, setPositionFilter] = useState<PlayerPosition | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'overall' | 'name'>('overall');

  // Filter players by position
  const filteredPlayers = useMemo(() => {
    if (positionFilter === 'ALL') return players;
    return players.filter(p => p.position === positionFilter);
  }, [players, positionFilter]);

  // Get selected players data with colors
  const selectedPlayersData = useMemo(() => {
    return filteredPlayers
      .filter(p => selectedPlayers.includes(p.playerId))
      .map((player, idx) => ({
        ...player,
        color: CHART_COLORS[idx % CHART_COLORS.length],
        overallRating: player.overallRating || calculatePositionWeightedScore(player.testScores, player.position)
      }));
  }, [filteredPlayers, selectedPlayers]);

  // Sort selected players
  const sortedSelectedPlayers = useMemo(() => {
    return [...selectedPlayersData].sort((a, b) => {
      if (sortBy === 'overall') {
        return (b.overallRating || 0) - (a.overallRating || 0);
      }
      return a.playerName.localeCompare(b.playerName);
    });
  }, [selectedPlayersData, sortBy]);

  // Prepare radar chart data (4 categories)
  const radarData = useMemo(() => {
    const categories = [
      { key: 'physical', label: 'Physique', tests: ['vertical_jump', 'sprint', 'agility', 'endurance'] },
      { key: 'technical', label: 'Technique', tests: ['serving_accuracy', 'passing', 'attacking', 'blocking', 'defense'] },
      { key: 'tactical', label: 'Tactique', tests: ['game_situation'] },
      { key: 'mental', label: 'Mental', tests: ['mental_toughness', 'game_intelligence', 'leadership', 'communication'] }
    ];

    return categories.map(cat => {
      const dataPoint: any = { category: cat.label };
      
      selectedPlayersData.forEach(player => {
        const scores = cat.tests
          .filter(testId => player.testScores[testId] !== undefined)
          .map(testId => player.testScores[testId]);
        
        const avg = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;
        
        dataPoint[player.playerName] = Number(avg.toFixed(1));
      });

      return dataPoint;
    });
  }, [selectedPlayersData]);

  // Prepare comparison table data (all tests)
  const allTests = useMemo(() => {
    const testSet = new Set<string>();
    selectedPlayersData.forEach(player => {
      Object.keys(player.testScores).forEach(testId => testSet.add(testId));
    });
    return Array.from(testSet);
  }, [selectedPlayersData]);

  // Find best player for each test
  const bestPlayerByTest = useMemo(() => {
    const best: Record<string, { playerId: string; score: number }> = {};
    
    allTests.forEach(testId => {
      let maxScore = -1;
      let bestPlayerId = '';
      
      selectedPlayersData.forEach(player => {
        const score = player.testScores[testId];
        if (score !== undefined && score > maxScore) {
          maxScore = score;
          bestPlayerId = player.playerId;
        }
      });
      
      if (bestPlayerId) {
        best[testId] = { playerId: bestPlayerId, score: maxScore };
      }
    });
    
    return best;
  }, [selectedPlayersData, allTests]);

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (selectedPlayersData.length === 0) return null;

    const allScores = selectedPlayersData.map(p => p.overallRating || 0);
    const avgRating = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const maxRating = Math.max(...allScores);
    const minRating = Math.min(...allScores);
    
    // Category averages
    const categoryAvgs = {
      physical: 0,
      technical: 0,
      tactical: 0,
      mental: 0
    };

    radarData.forEach(point => {
      const scores: number[] = [];
      selectedPlayersData.forEach(player => {
        const score = point[player.playerName];
        if (typeof score === 'number') scores.push(score);
      });
      
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      if (point.category === 'Physique') categoryAvgs.physical = avg;
      if (point.category === 'Technique') categoryAvgs.technical = avg;
      if (point.category === 'Tactique') categoryAvgs.tactical = avg;
      if (point.category === 'Mental') categoryAvgs.mental = avg;
    });

    return {
      avgRating: Number(avgRating.toFixed(1)),
      maxRating: Number(maxRating.toFixed(1)),
      minRating: Number(minRating.toFixed(1)),
      categoryAvgs
    };
  }, [selectedPlayersData, radarData]);

  // Toggle player selection
  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 6) {
        toast.warning('Maximum 6 joueurs peuvent être comparés simultanément');
        return prev;
      }
      return [...prev, playerId];
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    let csv = 'Test,' + selectedPlayersData.map(p => p.playerName).join(',') + '\n';
    
    allTests.forEach(testId => {
      const row = [formatTestName(testId)];
      selectedPlayersData.forEach(player => {
        const score = player.testScores[testId];
        row.push(score !== undefined ? score.toFixed(1) : 'N/A');
      });
      csv += row.join(',') + '\n';
    });
    
    csv += '\nNote Globale,' + selectedPlayersData.map(p => p.overallRating?.toFixed(1) || 'N/A').join(',') + '\n';
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparaison_${teamName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun joueur disponible pour la comparaison</p>
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
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="w-6 h-6" />
                Comparaison d'Équipe
              </CardTitle>
              <CardDescription>{teamName} - {selectedPlayersData.length} joueur(s) sélectionné(s)</CardDescription>
            </div>
            <Button onClick={exportToCSV} disabled={selectedPlayersData.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT SIDEBAR - Player Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sélection Joueurs</CardTitle>
            {showPositionFilter && (
              <div className="mt-2">
                <label className="text-xs text-muted-foreground mb-1 block">Filtrer par poste</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value as any)}
                >
                  <option value="ALL">Tous les postes</option>
                  <option value="SETTER">Passeur</option>
                  <option value="OUTSIDE_HITTER">Attaquant</option>
                  <option value="OPPOSITE">Pointu</option>
                  <option value="MIDDLE_BLOCKER">Central</option>
                  <option value="LIBERO">Libéro</option>
                  <option value="DEFENSIVE_SPECIALIST">Spécialiste Défensif</option>
                </select>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPlayers.map(player => {
              const isSelected = selectedPlayers.includes(player.playerId);
              const rating = player.overallRating || calculatePositionWeightedScore(player.testScores, player.position);
              
              return (
                <div
                  key={player.playerId}
                  className={`p-3 border rounded cursor-pointer transition ${
                    isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:bg-muted'
                  }`}
                  onClick={() => togglePlayer(player.playerId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {player.jerseyNumber && (
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {player.jerseyNumber}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{player.playerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPosition(player.position)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{rating.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">note</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* RIGHT CONTENT - Visualizations */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPlayersData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Sélectionnez des joueurs pour commencer la comparaison</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Team Statistics Cards */}
              {teamStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                        <div className="text-2xl font-bold">{teamStats.maxRating}</div>
                        <div className="text-sm text-muted-foreground">Meilleure Note</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{teamStats.avgRating}</div>
                        <div className="text-sm text-muted-foreground">Moyenne Équipe</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{Object.keys(bestPlayerByTest).length}</div>
                        <div className="text-sm text-muted-foreground">Tests Évalués</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">{selectedPlayersData.length}</div>
                        <div className="text-sm text-muted-foreground">Joueurs Comparés</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Radar Chart Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Profil Multidimensionnel Comparé</CardTitle>
                  <CardDescription>Comparaison des 4 dimensions clés</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      {selectedPlayersData.map(player => (
                        <Radar
                          key={player.playerId}
                          name={player.playerName}
                          dataKey={player.playerName}
                          stroke={player.color}
                          fill={player.color}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  
                  {/* Legend with colors */}
                  <div className="mt-4 flex flex-wrap gap-3 justify-center">
                    {selectedPlayersData.map(player => (
                      <div key={player.playerId} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="text-sm font-medium">{player.playerName}</span>
                        <Badge variant="outline" className="text-xs">
                          {player.overallRating?.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ranking Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Classement Général</CardTitle>
                      <CardDescription>Trié par note globale pondérée</CardDescription>
                    </div>
                    <select
                      className="p-2 border rounded text-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="overall">Note Globale</option>
                      <option value="name">Nom</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sortedSelectedPlayers.map((player, idx) => (
                      <div
                        key={player.playerId}
                        className="flex items-center gap-4 p-4 border rounded"
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-amber-500 text-white' :
                            idx === 1 ? 'bg-gray-400 text-white' :
                            idx === 2 ? 'bg-amber-700 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            #{idx + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-semibold">{player.playerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatPosition(player.position)}
                            {player.jerseyNumber && ` - #${player.jerseyNumber}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold" style={{ color: player.color }}>
                              {player.overallRating?.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">Note Globale</div>
                          </div>
                          <div>
                            {player.overallRating && player.overallRating >= 9 && <Badge className="bg-purple-600">Elite</Badge>}
                            {player.overallRating && player.overallRating >= 7 && player.overallRating < 9 && <Badge className="bg-blue-600">Avancé</Badge>}
                            {player.overallRating && player.overallRating >= 5 && player.overallRating < 7 && <Badge className="bg-green-600">Bon</Badge>}
                            {player.overallRating && player.overallRating < 5 && <Badge variant="destructive">Développement</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Tableau Comparatif Détaillé</CardTitle>
                  <CardDescription>Tous les tests côte à côte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold">Test</th>
                          {selectedPlayersData.map(player => (
                            <th
                              key={player.playerId}
                              className="text-center p-2 font-semibold"
                              style={{ color: player.color }}
                            >
                              {player.playerName}
                            </th>
                          ))}
                          <th className="text-center p-2 font-semibold text-amber-600">Meilleur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTests.map(testId => {
                          const best = bestPlayerByTest[testId];
                          
                          return (
                            <tr key={testId} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-medium">{formatTestName(testId)}</td>
                              {selectedPlayersData.map(player => {
                                const score = player.testScores[testId];
                                const isBest = best && best.playerId === player.playerId;
                                
                                return (
                                  <td
                                    key={player.playerId}
                                    className={`text-center p-2 ${
                                      isBest ? 'font-bold bg-amber-50 dark:bg-amber-950' : ''
                                    }`}
                                  >
                                    {score !== undefined ? (
                                      <span style={{ color: isBest ? '#d97706' : player.color }}>
                                        {score.toFixed(1)}
                                        {isBest && ' 👑'}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">N/A</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="text-center p-2 text-amber-600 font-bold">
                                {best ? best.score.toFixed(1) : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t-2 font-bold bg-muted/50">
                          <td className="p-2">NOTE GLOBALE</td>
                          {selectedPlayersData.map(player => (
                            <td
                              key={player.playerId}
                              className="text-center p-2 text-lg"
                              style={{ color: player.color }}
                            >
                              {player.overallRating?.toFixed(1) || 'N/A'}
                            </td>
                          ))}
                          <td className="text-center p-2 text-amber-600 text-lg">
                            {teamStats?.maxRating}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Category Strengths */}
              {teamStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Forces et Faiblesses d'Équipe</CardTitle>
                    <CardDescription>Moyennes par catégorie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(teamStats.categoryAvgs).map(([category, avg]) => {
                        let label = category;
                        if (category === 'physical') label = 'Physique';
                        if (category === 'technical') label = 'Technique';
                        if (category === 'tactical') label = 'Tactique';
                        if (category === 'mental') label = 'Mental';
                        
                        const percentage = (avg / 10) * 100;
                        const color = avg >= 7 ? 'bg-green-600' : avg >= 5 ? 'bg-blue-600' : 'bg-orange-600';
                        
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold capitalize">{label}</span>
                              <span className="font-bold">{avg.toFixed(1)}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div
                                className={`${color} h-3 rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
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

function formatPosition(position: PlayerPosition): string {
  const positions: Record<PlayerPosition, string> = {
    SETTER: 'Passeur',
    OUTSIDE_HITTER: 'Attaquant',
    OPPOSITE: 'Pointu',
    MIDDLE_BLOCKER: 'Central',
    LIBERO: 'Libéro',
    DEFENSIVE_SPECIALIST: 'Spécialiste Défensif',
    UNIVERSAL: 'Universel'
  };
  return positions[position] || position;
}
