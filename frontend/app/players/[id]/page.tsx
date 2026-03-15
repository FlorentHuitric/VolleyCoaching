'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PLAYER } from '@/graphql/queries/players';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import SkillRadarChart from '@/components/players/SkillRadarChart';
import ExerciseRecommendations from '@/components/recommendations/ExerciseRecommendations';
import { StatWithTrend } from '@/components/players/StatWithTrend';
import { ArrowLeft, Award, TrendingUp, Target, Star, Calendar, Users, BarChart3, Activity, Zap, Brain, Trophy, Flame } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { PlayerDetailSkeleton } from '@/components/players/PlayerDetailSkeleton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch player by ID using Apollo Client
  const { data, loading, error } = useQuery(GET_PLAYER, {
    variables: { id: resolvedParams.id }
  });

  // Transform GraphQL data to PlayerType format
  const player = useMemo(() => {
    if (!data?.player) return null;

    const p = data.player;
    
    return {
      id: p.id,
      orgId: p.orgId || '',
      teamId: p.teamId || null,
      firstName: p.firstName,
      lastName: p.lastName,
      preferredName: p.preferredName,
      dateOfBirth: new Date(p.dateOfBirth),
      nationality: p.nationality,
      email: p.email || null,
      phone: p.phone || null,
      jerseyNumber: p.jerseyNumber,
      avatar: p.avatar,
      height: p.height || null,
      weight: p.weight || null,
      dominantHand: p.dominantHand || null,
      primaryPosition: p.primaryPosition,
      secondaryPosition: p.secondaryPosition,
      contractLevel: p.contractLevel || 'ACADEMY',
      status: p.status || 'ACTIVE',
      currentRating: p.currentRating,
      potentialRating: p.potentialRating,
      currentTechnical: p.currentTechnical || null,
      currentPhysical: p.currentPhysical || null,
      currentMental: p.currentMental || null,
      strengths: p.strengths || [],
      weaknesses: p.weaknesses || [],
      evaluations: p.evaluations || [],
      evaluationHistory: p.evaluations || [],
      lastEvaluationDate: p.lastEvaluationDate ? new Date(p.lastEvaluationDate) : null,
      currentEvaluation: p.currentEvaluation || null,
      medicalHistory: p.medicalHistory || [],
      injuryStatus: p.injuryStatus || null,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
    } as any; // Use any to bypass strict type checking for optional fields
  }, [data]);

  // Show loading state with header and skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <Link href="/players">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux joueurs
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <PlayerDetailSkeleton />
      </div>
    );
  }

  // Show not found state
  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <Link href="/players">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux joueurs
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Joueur non trouvé</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - dateOfBirth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
      return age - 1;
    }
    return age;
  };

  // FIFA Card helper functions
  const getRarityBackground = (rating: number) => {
    if (rating >= 9.5) return 'bg-[url("/images/card-backgrounds/card-bg-rainbow.png")] bg-cover bg-center';
    if (rating >= 9) return 'bg-[url("/images/card-backgrounds/card-bg-carmin.png")] bg-cover bg-center';
    if (rating >= 8) return 'bg-[url("/images/card-backgrounds/card-bg-dore.png")] bg-cover bg-center';
    if (rating >= 7) return 'bg-[url("/images/card-backgrounds/card-bg-violet.png")] bg-cover bg-center';
    if (rating >= 6) return 'bg-[url("/images/card-backgrounds/card-bg-bleu.png")] bg-cover bg-center';
    if (rating >= 5) return 'bg-[url("/images/card-backgrounds/card-bg-vert.png")] bg-cover bg-center';
    return 'bg-[url("/images/card-backgrounds/card-bg-gris.png")] bg-cover bg-center';
  };

  const getRarityGlow = (rating: number) => {
    if (rating >= 9.5) return 'shadow-rainbow shadow-2xl';
    if (rating >= 9) return 'shadow-red-500/70 shadow-2xl';
    if (rating >= 8) return 'shadow-yellow-500/60 shadow-xl';
    if (rating >= 7) return 'shadow-purple-500/50 shadow-lg';
    if (rating >= 6) return 'shadow-blue-500/40 shadow-lg';
    if (rating >= 5) return 'shadow-green-500/40 shadow-md';
    return 'shadow-gray-500/30 shadow-sm';
  };

  const getAuraEffect = (rating: number) => {
    if (rating >= 9.5) {
      return (
        <>
          <div className="absolute -inset-12 bg-gradient-conic from-pink-500 via-purple-500 via-blue-500 via-green-500 via-yellow-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-spin pointer-events-none" style={{animationDuration: '12s'}} />
          <div className="absolute -inset-8 bg-gradient-radial from-white/20 to-transparent rounded-full opacity-30 pointer-events-none" />
        </>
      );
    }
    if (rating >= 9) {
      return (
        <>
          <div className="absolute -inset-10 bg-gradient-radial from-red-500/30 via-orange-500/20 to-transparent rounded-full opacity-40 blur-2xl pointer-events-none" />
          <div className="absolute -inset-12 bg-gradient-conic from-red-500/15 via-orange-600/15 to-red-500/15 rounded-full opacity-20 blur-3xl animate-spin pointer-events-none" style={{animationDuration: '20s'}} />
        </>
      );
    }
    if (rating >= 8) {
      return (
        <div className="absolute -inset-8 bg-gradient-radial from-yellow-400/30 via-amber-500/25 to-transparent rounded-full opacity-50 blur-2xl pointer-events-none" />
      );
    }
    if (rating >= 7) {
      return (
        <div className="absolute -inset-6 bg-gradient-radial from-purple-500/30 via-purple-400/20 to-transparent rounded-full opacity-50 blur-xl pointer-events-none" />
      );
    }
    return null;
  };

  const getHolographicEffects = (rating: number) => {
    if (rating >= 9.5) {
      return (
        <>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3) 0%, rgba(147, 51, 234, 0.3) 20%, rgba(59, 130, 246, 0.3) 40%, rgba(16, 185, 129, 0.3) 60%, rgba(245, 158, 11, 0.3) 80%, rgba(239, 68, 68, 0.3) 100%)'
            }} />
          </div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 animate-spin" style={{
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.2) 25%, transparent 50%, rgba(255, 255, 255, 0.2) 75%, transparent 100%)',
              animationDuration: '15s'
            }} />
          </div>
        </>
      );
    }
    if (rating >= 9) {
      return (
        <>
          <div className="absolute inset-0 opacity-15">
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-red-600/40 via-orange-500/25 to-transparent" />
          </div>
        </>
      );
    }
    if (rating >= 8) {
      return (
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-amber-500/20 to-transparent" />
        </div>
      );
    }
    return null;
  };

  const getPlayerPortrait = (firstName: string, lastName: string) => {
    const fullName = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    const portraitMap: Record<string, string> = {
      'elena-phoenix': '/images/players/elena-phoenix-portrait.png',
      'marcus-flame': '/images/players/marcus-flame-portrait.png',
      'sarah-golden': '/images/players/sarah-golden-portrait.png',
      'mike-purple': '/images/players/mike-purple-portrait.png',
      'anna-blue': '/images/players/anna-blue-portrait.png',
      'tom-green': '/images/players/tom-green-portrait.png',
      'alex-gray': '/images/players/alex-gray-portrait.png',
    };
    return portraitMap[fullName] || null;
  };

  const getRarityName = (rating: number) => {
    if (rating >= 9.5) return 'RAINBOW';
    if (rating >= 9) return 'CARMIN';
    if (rating >= 8) return 'DORÉ';
    if (rating >= 7) return 'VIOLET';
    if (rating >= 6) return 'BLEU';
    if (rating >= 5) return 'VERT';
    return 'GRIS';
  };

  const getTextColors = (rating: number) => {
    if (rating >= 9.5) {
      return {
        primary: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        secondary: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        accent: 'text-yellow-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold'
      };
    }
    if (rating >= 9) {
      return {
        primary: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        secondary: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        accent: 'text-orange-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold'
      };
    }
    if (rating >= 8) {
      return {
        primary: 'text-amber-900 drop-shadow-[0_4px_8px_rgba(255,255,255,0.9)] font-black',
        secondary: 'text-amber-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] font-bold',
        accent: 'text-orange-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] font-semibold'
      };
    }
    if (rating >= 7) {
      return {
        primary: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        secondary: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        accent: 'text-violet-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold'
      };
    }
    return {
      primary: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
      secondary: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
      accent: 'text-cyan-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold'
    };
  };

  const age = calculateAge(player.dateOfBirth);
  const textColors = getTextColors(player.currentEvaluation?.overallRating || 5);

  const getStatColor = (value: number) => {
    if (value >= 9) return 'text-emerald-500';
    if (value >= 7) return 'text-yellow-500';
    if (value >= 5) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Compact Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/players">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux joueurs
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Badge className={`px-3 py-1 text-white border-0 font-bold ${
                getRarityName(player.currentEvaluation?.overallRating || 5) === 'RAINBOW' ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600' :
                getRarityName(player.currentEvaluation?.overallRating || 5) === 'CARMIN' ? 'bg-red-600' :
                getRarityName(player.currentEvaluation?.overallRating || 5) === 'DORÉ' ? 'bg-yellow-600' :
                getRarityName(player.currentEvaluation?.overallRating || 5) === 'VIOLET' ? 'bg-purple-600' :
                getRarityName(player.currentEvaluation?.overallRating || 5) === 'BLEU' ? 'bg-blue-600' :
                getRarityName(player.currentEvaluation?.overallRating || 5) === 'VERT' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {getRarityName(player.currentEvaluation?.overallRating || 5)}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* FIFA-Style Hero Section */}
        <div className="relative perspective-1000 mb-8">
          {/* Auras externes */}
          {getAuraEffect(player.currentEvaluation?.overallRating || 5)}

          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative"
          >
            {/* Container principal avec fond de rareté */}
            <div className={`
              relative overflow-hidden rounded-3xl border-4 border-white/40
              ${getRarityBackground(player.currentEvaluation?.overallRating || 5)}
              ${getRarityGlow(player.currentEvaluation?.overallRating || 5)}
              transform-gpu transition-all duration-500
            `}>
              {/* Overlay pour améliorer la lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 opacity-70"></div>

              {/* Effets holographiques */}
              {getHolographicEffects(player.currentEvaluation?.overallRating || 5)}

              {/* Pattern de fond texturé inspiré FIFA */}
              <div className="absolute inset-0 opacity-15">
                <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-white/30 via-white/10 to-transparent"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.1)_25%,_rgba(255,255,255,0.1)_50%,_transparent_50%,_transparent_75%,_rgba(255,255,255,0.1)_75%)] bg-[length:40px_40px] opacity-25"></div>
              </div>

              <div className="relative p-10">
                <div className="flex items-center space-x-12">
                  {/* Section gauche - Rating et infos comme FIFA */}
                  <div className="flex flex-col items-start">
                    {/* Rating principal - Style FIFA */}
                    <div className={`text-8xl font-black leading-none mb-2 ${textColors.primary} fifa-text-shadow`}>
                      {player.currentEvaluation?.overallRating || 'N/A'}
                    </div>

                    {/* Position */}
                    <div className={`${textColors.accent} text-2xl uppercase tracking-wider font-bold fifa-text-shadow mb-3`}>
                      {getPositionAbbreviation(player.primaryPosition)}
                    </div>

                    {/* Badge rareté */}
                    <Badge className={`px-4 py-2 text-sm font-black border-2 mb-4 ${
                      getRarityName(player.currentEvaluation?.overallRating || 5) === 'RAINBOW' ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white border-white/60 shadow-2xl' :
                      getRarityName(player.currentEvaluation?.overallRating || 5) === 'CARMIN' ? 'bg-red-950/95 text-red-50 border-red-200/70 shadow-xl' :
                      getRarityName(player.currentEvaluation?.overallRating || 5) === 'DORÉ' ? 'bg-yellow-900/95 text-yellow-50 border-yellow-200/70 shadow-xl' :
                      getRarityName(player.currentEvaluation?.overallRating || 5) === 'VIOLET' ? 'bg-purple-950/95 text-purple-50 border-purple-200/70 shadow-lg' :
                      getRarityName(player.currentEvaluation?.overallRating || 5) === 'BLEU' ? 'bg-blue-950/95 text-blue-50 border-blue-200/70 shadow-lg' :
                      getRarityName(player.currentEvaluation?.overallRating || 5) === 'VERT' ? 'bg-green-950/95 text-green-50 border-green-200/70 shadow-md' :
                      'bg-gray-950/95 text-gray-50 border-gray-200/70 shadow-sm'
                    }`}>
                      {getRarityName(player.currentEvaluation?.overallRating || 5)}
                    </Badge>

                    {/* Potentiel */}
                    <div className="space-y-1">
                      <div className={`${textColors.accent} text-sm uppercase tracking-wide font-semibold fifa-text-shadow`}>Potentiel</div>
                      <div className={`${textColors.primary} text-3xl font-black fifa-text-shadow`}>{player.currentEvaluation?.potentialRating || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Section centrale - Portrait joueur */}
                  <div className="flex-1 flex justify-center">
                    <div className="relative">
                      {/* Container photo principal */}
                      <div className="relative w-48 h-48 rounded-full overflow-hidden border-6 border-white/50 shadow-2xl">
                        {getPlayerPortrait(player.firstName, player.lastName) ? (
                          <img
                            src={getPlayerPortrait(player.firstName, player.lastName)!}
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-full h-full object-cover scale-110"
                            style={{ objectPosition: 'center top' }}
                          />
                        ) : player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={`${player.firstName} ${player.lastName}`}
                            className="w-full h-full object-cover scale-110"
                            style={{ objectPosition: 'center top' }}
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-6xl font-black text-white"
                            style={{ backgroundColor: getPositionColor(player.primaryPosition) + '90' }}
                          >
                            {player.firstName[0]}{player.lastName[0]}
                          </div>
                        )}
                      </div>

                      {/* Numéro de maillot */}
                      <div className="absolute -bottom-3 -right-3 bg-black/90 text-white rounded-full w-16 h-16 flex items-center justify-center font-black border-4 border-white/50 text-xl shadow-xl">
                        {player.jerseyNumber}
                      </div>

                      {/* Étoiles de rareté */}
                      <div className="absolute -top-3 -right-3 flex items-center space-x-1">
                        {[...Array(Math.min(5, Math.ceil((player.currentEvaluation?.overallRating || 5)/2)))].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${
                            (player.currentEvaluation?.overallRating || 5) >= 9.5 ? 'fill-white text-white drop-shadow-lg' :
                            (player.currentEvaluation?.overallRating || 5) >= 9 ? 'fill-red-300 text-red-300 drop-shadow-lg' :
                            (player.currentEvaluation?.overallRating || 5) >= 8 ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg' :
                            (player.currentEvaluation?.overallRating || 5) >= 7 ? 'fill-purple-300 text-purple-300 drop-shadow-lg' :
                            (player.currentEvaluation?.overallRating || 5) >= 6 ? 'fill-blue-300 text-blue-300 drop-shadow-lg' :
                            (player.currentEvaluation?.overallRating || 5) >= 4 ? 'fill-green-300 text-green-300 drop-shadow-lg' :
                            'fill-gray-300 text-gray-300 drop-shadow-lg'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section droite - Infos joueur */}
                  <div className="text-right">
                    <h1 className={`${textColors.secondary} text-5xl font-black mb-4 fifa-text-shadow uppercase tracking-wide`}>
                      {player.firstName}<br/>{player.lastName}
                    </h1>

                    <div className="space-y-3">
                      <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold">
                        <Calendar className="w-5 h-5 mr-2" />
                        {age} ans
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold">
                        <Users className="w-5 h-5 mr-2" />
                        {player.contractLevel.charAt(0).toUpperCase() + player.contractLevel.slice(1)}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => router.push('/evaluation')}
                      className="mt-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Nouvelle évaluation
                    </Button>
                  </div>
                </div>
              </div>

              {/* Effet de brillance supérieur */}
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/20 via-white/8 to-transparent pointer-events-none"></div>

              {/* Effet de dégradé inférieur */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none"></div>
            </div>

            {/* Effet de lueur externe */}
            <div className={`absolute inset-0 rounded-3xl ${getRarityBackground(player.currentEvaluation?.overallRating || 5)} blur-2xl -z-10 opacity-30`}></div>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          {player.currentEvaluation && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Analyse des Compétences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkillRadarChart
                  data={{
                    technical: player.currentEvaluation.technical,
                    physical: player.currentEvaluation.physical,
                    mental: player.currentEvaluation.mental,
                  }}
                  size={400}
                />
              </CardContent>
            </Card>
          )}

          {/* Strengths & Weaknesses */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>Forces & Axes de Développement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Forces</h4>
                <div className="flex flex-wrap gap-2">
                  {player.currentEvaluation?.strengths.map((strength: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Axes de Développement</h4>
                <div className="flex flex-wrap gap-2">
                  {player.currentEvaluation?.weaknesses?.map((area: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skill Breakdown */}
              {player.currentEvaluation && player.currentEvaluation.technical ? (() => {
                const getSkillAverage = (skillObj: any) => {
                  if (!skillObj || typeof skillObj !== 'object') return 0;
                  const values = Object.values(skillObj).filter(v => typeof v === 'number') as number[];
                  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                };

                // Get previous evaluation for comparison (if exists)
                const previousEval = player.evaluationHistory?.[1]; // Second most recent
                const currentTech = player.currentEvaluation.technical;
                const previousTech = previousEval?.technical;

                const skills = [
                  {
                    label: 'Service',
                    current: getSkillAverage(currentTech.serving),
                    previous: previousTech ? getSkillAverage(previousTech.serving) : undefined
                  },
                  {
                    label: 'Passe',
                    current: getSkillAverage(currentTech.passing),
                    previous: previousTech ? getSkillAverage(previousTech.passing) : undefined
                  },
                  {
                    label: 'Passe décisive',
                    current: getSkillAverage(currentTech.setting),
                    previous: previousTech ? getSkillAverage(previousTech.setting) : undefined
                  },
                  {
                    label: 'Attaque',
                    current: getSkillAverage(currentTech.attacking),
                    previous: previousTech ? getSkillAverage(previousTech.attacking) : undefined
                  },
                  {
                    label: 'Contre',
                    current: getSkillAverage(currentTech.blocking),
                    previous: previousTech ? getSkillAverage(previousTech.blocking) : undefined
                  },
                  {
                    label: 'Défense',
                    current: getSkillAverage(currentTech.defense),
                    previous: previousTech ? getSkillAverage(previousTech.defense) : undefined
                  },
                ];

                return (
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Compétences Techniques</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {skills.map((skill) => (
                        <StatWithTrend
                          key={skill.label}
                          label={skill.label}
                          currentValue={skill.current}
                          previousValue={skill.previous}
                        />
                      ))}
                    </div>
                  </div>
                );
              })() : (
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200">En attente d'évaluation</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">Ce joueur n'a pas encore été évalué. Créez une nouvelle évaluation pour voir ses statistiques détaillées.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exercise Recommendations */}
        <div>
          <ExerciseRecommendations player={player} limit={5} />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Physical */}
          {player.currentEvaluation && player.currentEvaluation.physical?.performance && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Physique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Détente verticale</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.physical.performance?.verticalJump || 'N/A'} cm
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Saut d'attaque</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.physical.performance?.approachJump || 'N/A'} cm
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Agilité</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.physical.performance?.agility || 'N/A'}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Endurance</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.physical.performance?.endurance || 'N/A'}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mental */}
          {player.currentEvaluation && player.currentEvaluation.mental && (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Mental</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Intelligence de jeu</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.mental.gameIntelligence?.courtAwareness || 'N/A'}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Communication</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.mental.communication?.verbal || 'N/A'}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Leadership</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.mental.leadership?.onCourtPresence || 'N/A'}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Résilience</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {player.currentEvaluation.mental.mentalToughness?.resilience || 'N/A'}/10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Comprehensive Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-8">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-900">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Technique Détaillée</span>
            </TabsTrigger>
            <TabsTrigger value="physical" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Physique Complet</span>
            </TabsTrigger>
            <TabsTrigger value="mental" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Mental Complet</span>
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble Tab */}
          <TabsContent value="overview">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Aperçu global des compétences et recommandations</p>
          </TabsContent>

          {/* Technique Détaillée Tab */}
          {player.currentEvaluation && (
            <TabsContent value="technical">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(player.currentEvaluation.technical).map(([category, skills]) => (
                  <Card key={category} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="capitalize text-lg text-gray-900 dark:text-gray-100">
                        {category === 'serving' ? 'Service' :
                         category === 'passing' ? 'Passe' :
                         category === 'setting' ? 'Passe (Setter)' :
                         category === 'attacking' ? 'Attaque' :
                         category === 'blocking' ? 'Contre' :
                         category === 'defense' ? 'Défense' : category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(skills as Record<string, number>).map(([skill, value]) => (
                          <div key={skill} className="flex justify-between items-center">
                            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                              {skill === 'consistency' ? 'Régularité' :
                               skill === 'power' ? 'Puissance' :
                               skill === 'accuracy' ? 'Précision' :
                               skill === 'variety' ? 'Variété' :
                               skill === 'pressure' ? 'Pression' :
                               skill === 'reception' ? 'Réception' :
                               skill === 'rangeOfMotion' ? 'Amplitude' :
                               skill === 'ballControl' ? 'Contrôle balle' :
                               skill === 'decisionMaking' ? 'Prise de décision' :
                               skill === 'tempo' ? 'Tempo' :
                               skill === 'timing' ? 'Timing' :
                               skill === 'tooling' ? 'Utilisation bloc' :
                               skill === 'handPosition' ? 'Position mains' :
                               skill === 'footwork' ? 'Jeu de pieds' :
                               skill === 'reading' ? 'Lecture' :
                               skill === 'penetration' ? 'Pénétration' :
                               skill === 'digging' ? 'Défense' :
                               skill === 'positioning' ? 'Positionnement' :
                               skill === 'anticipation' ? 'Anticipation' :
                               skill === 'recovery' ? 'Récupération' : skill}
                            </span>
                            <span className={`font-bold ${getStatColor(value as number)}`}>
                              {value as number}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Physique Complet Tab */}
          {player.currentEvaluation && (
            <TabsContent value="physical">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Mensurations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Taille</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{player.currentEvaluation?.physical?.measurements?.height || 'N/A'} cm</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Poids</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{player.currentEvaluation?.physical?.measurements?.weight || 'N/A'} kg</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Portée</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{player.currentEvaluation?.physical?.measurements?.reach || 'N/A'} cm</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Envergure</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{player.currentEvaluation?.physical?.measurements?.wingspan || 'N/A'} cm</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Notes Physiques (0-10)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Mobilité épaule</span>
                        <span className={`font-bold ${getStatColor(player.currentEvaluation?.physical?.flexibility?.shoulderMobility || 0)}`}>
                          {player.currentEvaluation?.physical?.flexibility?.shoulderMobility || 'N/A'}/10
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Mobilité hanche</span>
                        <span className={`font-bold ${getStatColor(player.currentEvaluation?.physical?.flexibility?.hipMobility || 0)}`}>
                          {player.currentEvaluation?.physical?.flexibility?.hipMobility || 'N/A'}/10
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Flexibilité cheville</span>
                        <span className={`font-bold ${getStatColor(player.currentEvaluation?.physical?.flexibility?.ankleFlexibility || 0)}`}>
                          {player.currentEvaluation?.physical?.flexibility?.ankleFlexibility || 'N/A'}/10
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Flexibilité globale</span>
                        <span className={`font-bold ${getStatColor(player.currentEvaluation?.physical?.flexibility?.overallFlexibility || 0)}`}>
                          {player.currentEvaluation?.physical?.flexibility?.overallFlexibility || 'N/A'}/10
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Mental Complet Tab */}
          {player.currentEvaluation && (
            <TabsContent value="mental">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(player.currentEvaluation.mental).map(([category, skills]) => (
                  <Card key={category} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        {category === 'gameIntelligence' ? 'Intelligence de Jeu' :
                         category === 'communication' ? 'Communication' :
                         category === 'leadership' ? 'Leadership' :
                         category === 'mentalToughness' ? 'Mental' :
                         category === 'coachability' ? 'Coachabilité' : category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(skills as Record<string, number>).map(([skill, value]) => (
                          <div key={skill} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {skill === 'courtAwareness' ? 'Conscience du terrain' :
                               skill === 'situationalUnderstanding' ? 'Compréhension situationnelle' :
                               skill === 'strategicThinking' ? 'Pensée stratégique' :
                               skill === 'adaptability' ? 'Adaptabilité' :
                               skill === 'gameFlow' ? 'Flow de jeu' :
                               skill === 'verbal' ? 'Verbal' :
                               skill === 'nonVerbal' ? 'Non-verbal' :
                               skill === 'listening' ? 'Écoute' :
                               skill === 'teamDirection' ? 'Direction équipe' :
                               skill === 'conflictResolution' ? 'Résolution conflits' :
                               skill === 'onCourtPresence' ? 'Présence terrain' :
                               skill === 'motivating' ? 'Motivation' :
                               skill === 'responsibility' ? 'Responsabilité' :
                               skill === 'decisionMaking' ? 'Prise de décision' :
                               skill === 'roleModeling' ? 'Exemplarité' :
                               skill === 'resilience' ? 'Résilience' :
                               skill === 'focus' ? 'Concentration' :
                               skill === 'confidence' ? 'Confiance' :
                               skill === 'pressurePerformance' ? 'Performance pression' :
                               skill === 'recovery' ? 'Récupération' :
                               skill === 'receptiveness' ? 'Réceptivité' :
                               skill === 'implementation' ? 'Mise en pratique' :
                               skill === 'effort' ? 'Effort' :
                               skill === 'attitude' ? 'Attitude' :
                               skill === 'growth' ? 'Progression' : skill}
                            </span>
                            <span className={`font-bold ${getStatColor(value as number)}`}>
                              {value as number}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Coach Notes & Development Plan */}
        {player.currentEvaluation && (
          <Card className="mt-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Notes de l'Entraîneur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {player.currentEvaluation.notes}
              </p>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Plan de Développement</h4>
                <p className="text-blue-800 dark:text-blue-300">{player.currentEvaluation.developmentPlan}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      </div>
    </ProtectedRoute>
  );
}
