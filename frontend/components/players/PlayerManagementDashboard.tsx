'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { useTeam } from '@/contexts/TeamContext';
import { PlayerType, EvaluationType, ContractLevel } from '@/types/player';
import { EvaluationSession } from '@/types/exercises';
import { VolleyballPosition } from '@/hooks/useCourtStore';

// Type aliases for backward compatibility
type PlayerProfile = PlayerType;
type PlayerEvaluation = EvaluationType;
import PlayerProfileCard from './PlayerProfileCard';
import FIFAPlayerCard from './FIFAPlayerCard';
import PlayerTable from './PlayerTable';
import ExerciseEvaluationForm from '../evaluation/ExerciseEvaluationForm';
import SkillRadarChart from './SkillRadarChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users, TrendingUp, Award, Filter, Target, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import ExerciseRecommendations from '../recommendations/ExerciseRecommendations';
import { PlayerCardSkeletonGrid } from './PlayerCardSkeleton';
import { VolleyballLoader } from '@/components/ui/volleyball-loader';


interface PlayerManagementDashboardProps {
  className?: string;
}

export default function PlayerManagementDashboard({ className }: PlayerManagementDashboardProps) {
  const { currentTeamId, setCurrentTeamId } = useTeam();



  // Fetch players directly from GraphQL
  const { data, loading, error } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId: currentTeamId },
    fetchPolicy: 'cache-and-network', // Show cached data immediately while fetching fresh data
    skip: !currentTeamId // Don't run query until we have a team ID
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Transform GraphQL data to PlayerProfile format (flat structure - no personalInfo)
  const players: PlayerProfile[] = useMemo(() => {
    if (!data?.playersByTeam) {
      return [];
    }

    return data.playersByTeam.map((p: any) => {
      // Use currentTechnical from player (already calculated by backend)
      const currentEval = p.currentRating ? {
        overallRating: p.currentRating,
        potentialRating: p.potentialRating,
        technical: p.currentTechnical || {},
        physical: p.currentPhysical || {},
        mental: p.currentMental || {},
        strengths: p.strengths || [],
        weaknesses: p.weaknesses || []
      } : undefined;

      return {
        ...p,
        // Override with safe defaults for essential fields
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
        nationality: p.nationality || '',
        contractLevel: p.contractLevel || ContractLevel.ROTATION,
        currentEvaluation: currentEval,
        evaluationHistory: p.evaluations || []
      } as PlayerProfile;
    });
  }, [data, currentTeamId]);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) ?? null;

  const [showExerciseEvaluation, setShowExerciseEvaluation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<VolleyballPosition | 'all'>('all');
  const [viewMode, setViewMode] = useState<'fifa' | 'table'>('fifa');
  const [sortBy, setSortBy] = useState<'rating' | 'potential' | 'height' | 'age' | 'position' | 'name' | 'technical' | 'physical' | 'mental'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Advanced filters
  const [filterRatingMin, setFilterRatingMin] = useState<number>(0);
  const [filterRatingMax, setFilterRatingMax] = useState<number>(10);
  const [filterAgeMin, setFilterAgeMin] = useState<number>(0);
  const [filterAgeMax, setFilterAgeMax] = useState<number>(100);
  const [filterHeightMin, setFilterHeightMin] = useState<number>(150);
  const [filterHeightMax, setFilterHeightMax] = useState<number>(220);
  const [filterTechnicalMin, setFilterTechnicalMin] = useState<number>(0);
  const [filterPhysicalMin, setFilterPhysicalMin] = useState<number>(0);
  const [filterMentalMin, setFilterMentalMin] = useState<number>(0);
  const [filterServingMin, setFilterServingMin] = useState<number>(0);
  const [filterPassingMin, setFilterPassingMin] = useState<number>(0);
  const [filterSettingMin, setFilterSettingMin] = useState<number>(0);
  const [filterAttackingMin, setFilterAttackingMin] = useState<number>(0);
  const [filterBlockingMin, setFilterBlockingMin] = useState<number>(0);
  const [filterDefenseMin, setFilterDefenseMin] = useState<number>(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Helper functions
  const calculateAge = (dateOfBirth: Date | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - dateOfBirth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getAverageSkill = (technical: any, category: 'technical' | 'physical' | 'mental') => {
    if (category === 'technical' && technical) {
      const allValues = [
        ...Object.values(technical.serving || {}),
        ...Object.values(technical.passing || {}),
        ...Object.values(technical.setting || {}),
        ...Object.values(technical.attacking || {}),
        ...Object.values(technical.blocking || {}),
        ...Object.values(technical.defense || {})
      ] as number[];
      return allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    }
    return 0;
  };

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    return players
      .filter(player => {
        // Safe string operations with fallbacks
        const firstName = player.firstName || '';
        const lastName = player.lastName || '';
        const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             lastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = filterPosition === 'all' || player.primaryPosition === filterPosition;

        // Basic filters
        if (!matchesSearch || !matchesPosition) return false;

        // Advanced filters
        const rating = player.currentEvaluation?.overallRating;
        const age = calculateAge(player.dateOfBirth);
        const height = player.currentEvaluation?.physical?.measurements?.height;

        // Rating range - only apply if player has rating
        if (rating !== undefined && rating !== null) {
          if (rating < filterRatingMin || rating > filterRatingMax) return false;
        }

        // Age range
        if (age !== null && (age < filterAgeMin || age > filterAgeMax)) return false;

        // Height range - only apply if player has height
        if (height !== undefined && height !== null && height > 0) {
          if (height < filterHeightMin || height > filterHeightMax) return false;
        }

        // Category minimums
        if (player.currentEvaluation) {
          const currentEval = player.currentEvaluation;

          // Technical skills - check if technical data exists and has the expected structure
          if (filterTechnicalMin > 0 && currentEval.technical) {
            const tech = currentEval.technical as any;
            const avgTechnical = (
              (tech.serving || 0) +
              (tech.passing || 0) +
              (tech.setting || 0) +
              (tech.attacking || 0) +
              (tech.blocking || 0) +
              (tech.defense || 0)
            ) / 6;
            if (avgTechnical < filterTechnicalMin) return false;
          }

          // Physical attributes - check if physical data exists and has the expected structure
          if (filterPhysicalMin > 0 && currentEval.physical) {
            const phys = currentEval.physical as any;
            const avgPhysical = (
              (phys.verticalJump || 0) +
              (phys.speed || 0) +
              (phys.agility || 0) +
              (phys.endurance || 0) +
              (phys.strength || 0) +
              (phys.coordination || 0)
            ) / 6;
            if (avgPhysical < filterPhysicalMin) return false;
          }

          // Mental attributes - check if mental data exists and has the expected structure
          if (filterMentalMin > 0 && currentEval.mental) {
            const ment = currentEval.mental as any;
            const avgMental = (
              (ment.gameReading || 0) +
              (ment.communication || 0) +
              (ment.leadership || 0) +
              (ment.resilience || 0) +
              (ment.workEthic || 0)
            ) / 5;
            if (avgMental < filterMentalMin) return false;
          }

          // Specific technical skills - check if technical data exists
          if (currentEval.technical) {
            const tech = currentEval.technical as any;
            if ((tech.serving || 0) < filterServingMin) return false;
            if ((tech.passing || 0) < filterPassingMin) return false;
            if ((tech.setting || 0) < filterSettingMin) return false;
            if ((tech.attacking || 0) < filterAttackingMin) return false;
            if ((tech.blocking || 0) < filterBlockingMin) return false;
            if ((tech.defense || 0) < filterDefenseMin) return false;
          }
        }
        // Note: Players without evaluation pass through filters (shown as "awaiting evaluation")

        return true;
      })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'rating':
          aValue = a.currentEvaluation?.overallRating || 0;
          bValue = b.currentEvaluation?.overallRating || 0;
          break;
        case 'potential':
          aValue = a.currentEvaluation?.potentialRating || 0;
          bValue = b.currentEvaluation?.potentialRating || 0;
          break;
        case 'height':
          aValue = a.currentEvaluation?.physical?.measurements?.height || 0;
          bValue = b.currentEvaluation?.physical?.measurements?.height || 0;
          break;
        case 'age':
          aValue = calculateAge(a.dateOfBirth) ?? -1;
          bValue = calculateAge(b.dateOfBirth) ?? -1;
          break;
        case 'position':
          aValue = a.primaryPosition;
          bValue = b.primaryPosition;
          break;
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`;
          bValue = `${b.firstName || ''} ${b.lastName || ''}`;
          break;
        case 'technical':
          aValue = a.currentEvaluation ? getAverageSkill(a.currentEvaluation.technical, 'technical') : 0;
          bValue = b.currentEvaluation ? getAverageSkill(b.currentEvaluation.technical, 'technical') : 0;
          break;
        case 'physical':
          aValue = a.currentEvaluation?.physical?.performance?.verticalJump || 0;
          bValue = b.currentEvaluation?.physical?.performance?.verticalJump || 0;
          break;
        case 'mental':
          aValue = a.currentEvaluation?.mental?.gameIntelligence?.courtAwareness || 0;
          bValue = b.currentEvaluation?.mental?.gameIntelligence?.courtAwareness || 0;
          break;
        default:
          aValue = a.currentEvaluation?.overallRating || 0;
          bValue = b.currentEvaluation?.overallRating || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [
    players,
    searchTerm,
    filterPosition,
    sortBy,
    sortOrder,
    filterRatingMin,
    filterRatingMax,
    filterAgeMin,
    filterAgeMax,
    filterHeightMin,
    filterHeightMax,
    filterTechnicalMin,
    filterPhysicalMin,
    filterMentalMin,
    filterServingMin,
    filterPassingMin,
    filterSettingMin,
    filterAttackingMin,
    filterBlockingMin,
    filterDefenseMin,
    calculateAge,
    getAverageSkill
  ]);

  // Old handleSaveEvaluation removed - evaluations now handled via /evaluation page with NewEvaluationWizard

  const handleExerciseEvaluationComplete = (session: EvaluationSession) => {
    // Convertir les résultats d'exercices en évaluation de joueur
    if (selectedPlayer) {
      // Ici vous pourriez implémenter la logique de conversion
      // des résultats d'exercices vers une évaluation complète
      console.log('Session d\'exercices terminée:', session);
      setShowExerciseEvaluation(false);

      // Pour l'exemple, on ferme juste l'évaluation par exercices
      // Dans une vraie app, vous convertiriez les résultats en PlayerEvaluation
    }
  };

  const getTeamStats = () => {
    const totalPlayers = players.length;
    const ratedPlayers = players.filter(p=>p.currentRating !== null);
    const averageRating = ratedPlayers.reduce((sum, p) => sum + (p.currentRating || 0), 0) / (ratedPlayers.length || 1);
    const starters = players.filter(p => p.contractLevel === 'STARTER').length;
    const positions = players.reduce((acc, p) => {
      acc[p.primaryPosition] = (acc[p.primaryPosition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalPlayers, averageRating, starters, positions };
  };

  const stats = getTeamStats();

  if (showExerciseEvaluation && selectedPlayer) {
    return (
      <div className={`w-full ${className}`}>
        <ExerciseEvaluationForm
          player={selectedPlayer}
          onComplete={handleExerciseEvaluationComplete}
          onCancel={() => setShowExerciseEvaluation(false)}
        />
      </div>
    );
  }

  // Redirect to evaluation page if evaluation form was requested
  // Note: Old EvaluationForm removed - use NewEvaluationWizard on /evaluation page instead

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {players.some(p=>p.assessmentKind==='ESTIMATED') && <p className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">Notes provisoires : ces premières estimations sont à confirmer. Les joueurs du pool B/C partagent la même fiche dans les deux effectifs.</p>}
      {/* Dashboard Header */}
      <div className="bg-card text-foreground p-5 sm:p-6 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8" />
              <span>Gestion des Joueurs</span>
            </h1>
            <p className="text-muted-foreground mt-2">Système complet d'évaluation et de développement des joueurs de volleyball</p>
          </div>
                    <div className="flex flex-wrap gap-2">
            <Link href="/players/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Joueur
              </Button>
            </Link>
            <Link href="/evaluation">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Évaluation
              </Button>
            </Link>

          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold" suppressHydrationWarning>{stats.totalPlayers}</div>
            <div className="text-sm text-blue-100">Total Joueurs</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold" suppressHydrationWarning>{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-blue-100">Moyenne Équipe</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold" suppressHydrationWarning>{stats.starters}</div>
            <div className="text-sm text-blue-100">Titulaires</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold" suppressHydrationWarning>{Object.keys(stats.positions).length}</div>
            <div className="text-sm text-blue-100">Postes</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="roster" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roster" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Effectif</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Statistiques</span>
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Évaluations</span>
          </TabsTrigger>
        </TabsList>

        {/* Team Roster */}
        <TabsContent value="roster">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0 w-full">
                    <div className="relative flex-1 min-w-[160px] max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Rechercher des joueurs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <select
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value as VolleyballPosition | 'all')}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="all">Tous les Postes</option>
                      <option value="SETTER">Passeur (Setter)</option>
                      <option value="OUTSIDE_HITTER">Réceptionneur-Attaquant</option>
                      <option value="MIDDLE_BLOCKER">Central</option>
                      <option value="OPPOSITE">Opposé (Diagonal)</option>
                      <option value="LIBERO">Libéro</option>
                      <option value="DEFENSIVE_SPECIALIST">Spécialiste Défensif</option>
                    </select>
                  </div>

                  {/* Système de tri avancé */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="rating">Note Globale</option>
                      <option value="potential">Potentiel</option>
                      <option value="technical">Technique</option>
                      <option value="physical">Physique</option>
                      <option value="mental">Mental</option>
                      <option value="height">Taille</option>
                      <option value="age">Âge</option>
                      <option value="position">Poste</option>
                      <option value="name">Nom</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-2 py-1"
                    >
                      {sortOrder === 'desc' ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-xs"
                  >
                    <Filter className="h-3 w-3 mr-2" />
                    {showAdvancedFilters ? 'Masquer filtres avancés' : 'Afficher filtres avancés'}
                  </Button>
                  {(filterRatingMin > 0 || filterRatingMax < 10 || filterAgeMin > 0 || filterAgeMax < 100 ||
                    filterHeightMin > 150 || filterHeightMax < 220 || filterTechnicalMin > 0 ||
                    filterPhysicalMin > 0 || filterMentalMin > 0 || filterServingMin > 0 ||
                    filterPassingMin > 0 || filterSettingMin > 0 || filterAttackingMin > 0 ||
                    filterBlockingMin > 0 || filterDefenseMin > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterRatingMin(0);
                        setFilterRatingMax(10);
                        setFilterAgeMin(0);
                        setFilterAgeMax(100);
                        setFilterHeightMin(150);
                        setFilterHeightMax(220);
                        setFilterTechnicalMin(0);
                        setFilterPhysicalMin(0);
                        setFilterMentalMin(0);
                        setFilterServingMin(0);
                        setFilterPassingMin(0);
                        setFilterSettingMin(0);
                        setFilterAttackingMin(0);
                        setFilterBlockingMin(0);
                        setFilterDefenseMin(0);
                      }}
                      className="text-xs text-red-600"
                    >
                      Réinitialiser filtres
                    </Button>
                  )}
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Overall Rating */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Note Globale</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={filterRatingMin}
                            onChange={(e) => setFilterRatingMin(Number(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="Min"
                          />
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={filterRatingMax}
                            onChange={(e) => setFilterRatingMax(Number(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="Max"
                          />
                        </div>
                      </div>

                      {/* Age */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Âge</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={filterAgeMin}
                            onChange={(e) => setFilterAgeMin(Number(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="Min"
                          />
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={filterAgeMax}
                            onChange={(e) => setFilterAgeMax(Number(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="Max"
                          />
                        </div>
                      </div>

                      {/* Height */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Taille (cm)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="150"
                            max="220"
                            value={filterHeightMin}
                            onChange={(e) => setFilterHeightMin(Number(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="Min"
                          />
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                          <input
                            type="number"
                            min="150"
                            max="220"
                            value={filterHeightMax}
                            onChange={(e) => setFilterHeightMax(Number(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="Max"
                          />
                        </div>
                      </div>

                      {/* Technical Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Technique Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterTechnicalMin}
                          onChange={(e) => setFilterTechnicalMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Physical Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Physique Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterPhysicalMin}
                          onChange={(e) => setFilterPhysicalMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Mental Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mental Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterMentalMin}
                          onChange={(e) => setFilterMentalMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Serving Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterServingMin}
                          onChange={(e) => setFilterServingMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Passing Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Passe Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterPassingMin}
                          onChange={(e) => setFilterPassingMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Setting Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Passe Décisive Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterSettingMin}
                          onChange={(e) => setFilterSettingMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Attacking Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attaque Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterAttackingMin}
                          onChange={(e) => setFilterAttackingMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Blocking Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contre Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterBlockingMin}
                          onChange={(e) => setFilterBlockingMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>

                      {/* Defense Min */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Défense Min</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={filterDefenseMin}
                          onChange={(e) => setFilterDefenseMin(Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="0 (tous)"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sélecteur de vue */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode d'affichage :</span>
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('fifa')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'fifa'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      🎴 Cards FIFA
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'table'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      📊 Vue Gestion
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Display */}
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center py-12">
                <VolleyballLoader size={100} />
              </div>
              <PlayerCardSkeletonGrid count={6} />
            </div>
          ) : error ? (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des joueurs: {error.message}</p>
              </CardContent>
            </Card>
          ) : viewMode === 'fifa' ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedPlayers.length} joueur(s) trouvé(s) - Trié par {sortBy === 'rating' ? 'Note Globale' :
                                                                                  sortBy === 'potential' ? 'Potentiel' :
                                                                                  sortBy === 'technical' ? 'Technique' :
                                                                                  sortBy === 'physical' ? 'Physique' :
                                                                                  sortBy === 'mental' ? 'Mental' :
                                                                                  sortBy === 'height' ? 'Taille' :
                                                                                  sortBy === 'age' ? 'Âge' :
                                                                                  sortBy === 'position' ? 'Poste' : 'Nom'} ({sortOrder === 'desc' ? 'décroissant' : 'croissant'})
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {filteredAndSortedPlayers.map(player => (
                  <FIFAPlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayer?.id === player.id}
                    onSelect={(p) => setSelectedPlayerId(p.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedPlayers.length} joueur(s) trouvé(s) - Trié par {sortBy === 'rating' ? 'Note Globale' :
                                                                                  sortBy === 'potential' ? 'Potentiel' :
                                                                                  sortBy === 'technical' ? 'Technique' :
                                                                                  sortBy === 'physical' ? 'Physique' :
                                                                                  sortBy === 'mental' ? 'Mental' :
                                                                                  sortBy === 'height' ? 'Taille' :
                                                                                  sortBy === 'age' ? 'Âge' :
                                                                                  sortBy === 'position' ? 'Poste' : 'Nom'} ({sortOrder === 'desc' ? 'décroissant' : 'croissant'})
              </div>
              <PlayerTable
                players={filteredAndSortedPlayers}
                onViewPlayer={(player) => {
                  setSelectedPlayerId(player.id);
                  // Navigation directe vers la page du joueur
                  window.location.href = `/players/${player.id}`;
                }}
                onEditPlayer={(player) => { window.location.href = `/players/${player.id}/edit`; }}
                onEvaluatePlayer={(player) => {
                  // Redirect to evaluation page instead of old form
                  window.location.href = `/evaluation?playerId=${player.id}`;
                }}
                onExerciseEvaluation={(player) => {
                  setSelectedPlayerId(player.id);
                  window.location.href = `/evaluation?playerId=${player.id}`;
                }}
              />
            </div>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedPlayer?.currentEvaluation && (
              <Card>
                <CardHeader>
                  <CardTitle>Analyse des Compétences du Joueur</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillRadarChart
                    data={{
                      technical: selectedPlayer.currentEvaluation.technical,
                      physical: selectedPlayer.currentEvaluation.physical,
                      mental: selectedPlayer.currentEvaluation.mental
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Poste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.positions).map(([position, count]) => (
                    <div key={position} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{position}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${((count as number) / stats.totalPlayers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[2rem]">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Evaluations */}
        <TabsContent value="evaluations">
          <Card>
            <CardHeader>
              <CardTitle>Évaluations Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {players.filter(p => p.currentEvaluation).map(player => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold">{player.firstName || 'Unknown'} {player.lastName || 'Player'}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{player.primaryPosition}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{player.currentEvaluation?.overallRating}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Général</div>
                      </div>
                      <Link href={`/players/${player.id}`}>
                        <Button size="sm">
                          Voir Détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}