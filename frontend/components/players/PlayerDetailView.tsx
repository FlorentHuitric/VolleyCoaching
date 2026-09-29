'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYER } from '@/graphql/queries/players';
import { PlayerType } from '@/types/player';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkillRadarChart from './SkillRadarChart';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Zap,
  Brain,
  Target,
  Activity,
  BarChart3,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Award,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PlayerDetailViewProps {
  playerId: string;
}

export default function PlayerDetailView({ playerId }: PlayerDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch player via Apollo Client
  const { data, loading, error } = useQuery(GET_PLAYER, {
    variables: { id: playerId }
  });

  const player: PlayerType | undefined = data?.player;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Player not found</h2>
          <Link href="/players">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Player data now comes from store

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

  // Calculate player stats
  const age = calculateAge(player.dateOfBirth);
  const currentEval = player.currentEvaluation!;
  // Fonction pour obtenir le fond de carte par rareté (comme les cartes FIFA)
  const getRarityBackground = (rating: number) => {
    if (rating >= 9.5) {
      // Rainbow Ultimate - Fond arc-en-ciel holographique
      return 'bg-[url("/images/card-backgrounds/card-bg-rainbow.png")] bg-cover bg-center';
    }
    if (rating >= 9) {
      // Rouge Carmin - Fond de feu légendaire
      return 'bg-[url("/images/card-backgrounds/card-bg-carmin.png")] bg-cover bg-center';
    }
    if (rating >= 8) {
      // Doré - Fond doré épique
      return 'bg-[url("/images/card-backgrounds/card-bg-dore.png")] bg-cover bg-center';
    }
    if (rating >= 7) {
      // Violet - Fond violet mystique
      return 'bg-[url("/images/card-backgrounds/card-bg-violet.png")] bg-cover bg-center';
    }
    if (rating >= 6) {
      // Bleu - Fond bleu cristallin
      return 'bg-[url("/images/card-backgrounds/card-bg-bleu.png")] bg-cover bg-center';
    }
    if (rating >= 5) {
      // Vert - Fond vert naturel
      return 'bg-[url("/images/card-backgrounds/card-bg-vert.png")] bg-cover bg-center';
    }
    // Gris - Fond gris métallique
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
      // Rainbow Ultimate - Aura arc-en-ciel complexe
      return (
        <>
          <div className="absolute -inset-12 bg-gradient-conic from-pink-500 via-purple-500 via-blue-500 via-green-500 via-yellow-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-spin pointer-events-none" style={{animationDuration: '12s'}} />
          <div className="absolute -inset-8 bg-gradient-radial from-white/20 to-transparent rounded-full opacity-30 pointer-events-none" />
          <div className="absolute -inset-6 bg-gradient-conic from-transparent via-white/15 to-transparent rounded-full opacity-40 animate-spin pointer-events-none" style={{animationDuration: '18s'}} />
        </>
      );
    }
    if (rating >= 9) {
      // Rouge Carmin - Aura de flammes mystiques
      return (
        <>
          <div className="absolute -inset-10 bg-gradient-radial from-red-500/30 via-orange-500/20 to-transparent rounded-full opacity-40 blur-2xl pointer-events-none" />
          <div className="absolute -inset-6 bg-gradient-radial from-red-600/25 via-red-400/15 to-transparent rounded-full opacity-30 blur-xl pointer-events-none" />
          <div className="absolute -inset-12 bg-gradient-conic from-red-500/15 via-orange-600/15 to-red-500/15 rounded-full opacity-20 blur-3xl animate-spin pointer-events-none" style={{animationDuration: '20s'}} />
        </>
      );
    }
    if (rating >= 8) {
      // Doré - Aura dorée élégante
      return (
        <>
          <div className="absolute -inset-8 bg-gradient-radial from-yellow-400/30 via-amber-500/25 to-transparent rounded-full opacity-50 blur-2xl pointer-events-none" />
          <div className="absolute -inset-5 bg-gradient-radial from-yellow-300/25 to-transparent rounded-full opacity-40 blur-xl pointer-events-none" />
        </>
      );
    }
    if (rating >= 7) {
      // Violet - Aura mystique violette
      return (
        <>
          <div className="absolute -inset-6 bg-gradient-radial from-purple-500/30 via-purple-400/20 to-transparent rounded-full opacity-50 blur-xl pointer-events-none" />
          <div className="absolute -inset-8 bg-gradient-radial from-purple-600/15 to-transparent rounded-full opacity-30 blur-2xl pointer-events-none" />
        </>
      );
    }
    if (rating >= 6) {
      // Bleu - Aura cristalline bleue
      return (
        <>
          <div className="absolute -inset-5 bg-gradient-radial from-blue-500/25 via-blue-400/15 to-transparent rounded-full opacity-40 blur-xl pointer-events-none" />
          <div className="absolute -inset-7 bg-gradient-radial from-blue-600/10 to-transparent rounded-full opacity-25 blur-2xl pointer-events-none" />
        </>
      );
    }
    if (rating >= 5) {
      // Vert - Aura naturelle verte
      return (
        <>
          <div className="absolute -inset-4 bg-gradient-radial from-green-500/20 via-green-400/10 to-transparent rounded-full opacity-35 blur-xl pointer-events-none" />
          <div className="absolute -inset-6 bg-gradient-radial from-green-600/8 to-transparent rounded-full opacity-20 blur-2xl pointer-events-none" />
        </>
      );
    }
    // Gris - Aura subtile grise
    return (
      <div className="absolute -inset-3 bg-gradient-radial from-gray-400/15 to-transparent rounded-full opacity-25 blur-lg pointer-events-none" />
    );
  };

  const getHolographicEffects = (rating: number) => {
    if (rating >= 9.5) {
      // Rainbow Ultimate - Effets arc-en-ciel complexes
      return (
        <>
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3) 0%, rgba(147, 51, 234, 0.3) 20%, rgba(59, 130, 246, 0.3) 40%, rgba(16, 185, 129, 0.3) 60%, rgba(245, 158, 11, 0.3) 80%, rgba(239, 68, 68, 0.3) 100%)'
              }}
            />
          </div>
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0 animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.2) 25%, transparent 50%, rgba(255, 255, 255, 0.2) 75%, transparent 100%)',
                animationDuration: '15s'
              }}
            />
          </div>
        </>
      );
    }
    if (rating >= 9) {
      // Carmin - Effets de feu
      return (
        <>
          <div className="absolute inset-0 opacity-15">
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-red-600/40 via-orange-500/25 to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/8 to-transparent animate-pulse opacity-60" />
        </>
      );
    }
    if (rating >= 8) {
      // Doré - Effets de lumière dorée
      return (
        <>
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-amber-500/20 to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-amber-400/15 to-orange-400/20 opacity-50" />
        </>
      );
    }
    if (rating >= 7) {
      // Violet - Effets mystiques
      return (
        <>
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0 bg-gradient-radial from-purple-500/25 via-violet-600/15 to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-violet-500/15 to-indigo-600/20 opacity-40" />
        </>
      );
    }
    if (rating >= 6) {
      // Bleu - Effets cristallins
      return (
        <>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-radial from-blue-400/25 via-cyan-500/15 to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300/15 via-cyan-400/10 to-blue-600/15 opacity-30" />
        </>
      );
    }
    if (rating >= 5) {
      // Vert - Effets naturels
      return (
        <>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-radial from-emerald-400/20 via-green-500/12 to-transparent" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/15 via-green-400/10 to-teal-500/15 opacity-30" />
        </>
      );
    }
    // Gris - Effets métalliques subtils
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-300/8 via-gray-400/6 to-slate-500/8 opacity-25" />
    );
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
    if (rating >= 6) {
      return {
        primary: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        secondary: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        accent: 'text-cyan-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold'
      };
    }
    if (rating >= 5) {
      return {
        primary: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        secondary: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        accent: 'text-emerald-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold'
      };
    }
    return {
      primary: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
      secondary: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
      accent: 'text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold'
    };
  };

  const getStatColor = (value: number) => {
    if (value >= 9) return 'text-emerald-500';
    if (value >= 7) return 'text-yellow-500';
    if (value >= 5) return 'text-orange-500';
    return 'text-red-500';
  };

  const textColors = getTextColors(currentEval.overallRating);

  return (
    <div className="min-h-screen astren-workspace">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/players">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour aux joueurs</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge className={`px-3 py-1 text-white border-0 font-bold ${getRarityName(currentEval.overallRating) === 'RAINBOW' ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600' : getRarityName(currentEval.overallRating) === 'CARMIN' ? 'bg-red-600' : getRarityName(currentEval.overallRating) === 'DORÉ' ? 'bg-yellow-600' : getRarityName(currentEval.overallRating) === 'VIOLET' ? 'bg-purple-600' : getRarityName(currentEval.overallRating) === 'BLEU' ? 'bg-blue-600' : getRarityName(currentEval.overallRating) === 'VERT' ? 'bg-green-600' : 'bg-gray-600'}`}>
                {getRarityName(currentEval.overallRating)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section avec style FIFA et auras */}
        <div className="relative perspective-1000 mb-8">
          {/* Auras externes comme les cartes */}
          {getAuraEffect(currentEval.overallRating)}

          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative"
          >
            {/* Container principal avec fond de rareté */}
            <div className={`
              relative overflow-hidden rounded-3xl border-4 border-white/40
              ${getRarityBackground(currentEval.overallRating)}
              ${getRarityGlow(currentEval.overallRating)}
              transform-gpu transition-all duration-500
            `}>
              {/* Overlay pour améliorer la lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 opacity-70"></div>

              {/* Effets holographiques */}
              {getHolographicEffects(currentEval.overallRating)}

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
                      {currentEval.overallRating}
                    </div>

                    {/* Position */}
                    <div className={`${textColors.accent} text-2xl uppercase tracking-wider font-bold fifa-text-shadow mb-3`}>
                      {getPositionAbbreviation(player.primaryPosition)}
                    </div>

                    {/* Badge rareté */}
                    <Badge className={`px-4 py-2 text-sm font-black border-2 mb-4 ${getRarityName(currentEval.overallRating) === 'RAINBOW' ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white border-white/60 shadow-2xl' : getRarityName(currentEval.overallRating) === 'CARMIN' ? 'bg-red-950/95 text-red-50 border-red-200/70 shadow-xl' : getRarityName(currentEval.overallRating) === 'DORÉ' ? 'bg-yellow-900/95 text-yellow-50 border-yellow-200/70 shadow-xl' : getRarityName(currentEval.overallRating) === 'VIOLET' ? 'bg-purple-950/95 text-purple-50 border-purple-200/70 shadow-lg' : getRarityName(currentEval.overallRating) === 'BLEU' ? 'bg-blue-950/95 text-blue-50 border-blue-200/70 shadow-lg' : getRarityName(currentEval.overallRating) === 'VERT' ? 'bg-green-950/95 text-green-50 border-green-200/70 shadow-md' : 'bg-gray-950/95 text-gray-50 border-gray-200/70 shadow-sm'}`}>
                      {getRarityName(currentEval.overallRating)}
                    </Badge>

                    {/* Potentiel */}
                    <div className="space-y-1">
                      <div className={`${textColors.accent} text-sm uppercase tracking-wide font-semibold fifa-text-shadow`}>Potentiel</div>
                      <div className={`${textColors.primary} text-3xl font-black fifa-text-shadow`}>{currentEval.potentialRating}</div>
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
                        {[...Array(Math.min(5, Math.ceil(currentEval.overallRating/2)))].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${currentEval.overallRating >= 9.5 ? 'fill-white text-white drop-shadow-lg' : currentEval.overallRating >= 9 ? 'fill-red-300 text-red-300 drop-shadow-lg' : currentEval.overallRating >= 8 ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg' : currentEval.overallRating >= 7 ? 'fill-purple-300 text-purple-300 drop-shadow-lg' : currentEval.overallRating >= 6 ? 'fill-blue-300 text-blue-300 drop-shadow-lg' : currentEval.overallRating >= 4 ? 'fill-green-300 text-green-300 drop-shadow-lg' : 'fill-gray-300 text-gray-300 drop-shadow-lg'}`} />
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
                        {age === null ? 'Âge non renseigné' : `${age} ans`}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold">
                        <Users className="w-5 h-5 mr-2" />
                        {player.contractLevel.charAt(0).toUpperCase() + player.contractLevel.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Effet de brillance supérieur */}
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/20 via-white/8 to-transparent pointer-events-none"></div>

              {/* Effet de dégradé inférieur */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none"></div>
            </div>

            {/* Effet de lueur externe */}
            <div className={`absolute inset-0 rounded-3xl ${getRarityBackground(currentEval.overallRating)} blur-2xl -z-10 opacity-30`}></div>
          </motion.div>
        </div>

        {/* Statistiques détaillées */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Technique</span>
            </TabsTrigger>
            <TabsTrigger value="physical" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Physique</span>
            </TabsTrigger>
            <TabsTrigger value="mental" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Mental</span>
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Profil de Compétences</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillRadarChart
                    data={{
                      technical: currentEval.technical,
                      physical: currentEval.physical,
                      mental: currentEval.mental
                    }}
                    size={400}
                  />
                </CardContent>
              </Card>

              {/* Statistiques principales */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span>Forces</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentEval.strengths.map((strength, idx) => (
                        <Badge key={idx} className="mr-2 mb-2 bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200">
                          <Award className="w-3 h-3 mr-1" />
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span>Axes de Développement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentEval.improvementAreas.map((area, idx) => (
                        <Badge key={idx} className="mr-2 mb-2 bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200">
                          <Flame className="w-3 h-3 mr-1" />
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Technique */}
          <TabsContent value="technical">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(currentEval.technical).map(([category, skills]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="capitalize text-lg">
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
                      {Object.entries(skills).map(([skill, value]) => (
                        <div key={skill} className="flex justify-between items-center">
                          <span className="text-sm capitalize">
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

          {/* Physique */}
          <TabsContent value="physical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mensurations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Taille</span>
                      <span className="font-bold">{currentEval.physical.measurements.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Poids</span>
                      <span className="font-bold">{currentEval.physical.measurements.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Portée</span>
                      <span className="font-bold">{currentEval.physical.measurements.reach} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envergure</span>
                      <span className="font-bold">{currentEval.physical.measurements.wingspan} cm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Saut vertical</span>
                      <span className="font-bold text-green-600">{currentEval.physical.performance.verticalJump} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saut d'approche</span>
                      <span className="font-bold text-green-600">{currentEval.physical.performance.approachJump} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vitesse attaque</span>
                      <span className="font-bold text-blue-600">{currentEval.physical.power.swingVelocity} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hauteur attaque</span>
                      <span className="font-bold text-purple-600">{currentEval.physical.power.attackHeight} cm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mental */}
          <TabsContent value="mental">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(currentEval.mental).map(([category, skills]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {category === 'gameIntelligence' ? 'Intelligence de Jeu' :
                       category === 'communication' ? 'Communication' :
                       category === 'leadership' ? 'Leadership' :
                       category === 'mentalToughness' ? 'Mental' :
                       category === 'coachability' ? 'Coachabilité' : category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(skills).map(([skill, value]) => (
                        <div key={skill} className="flex justify-between items-center">
                          <span className="text-sm">
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
        </Tabs>

        {/* Notes de l'entraîneur */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Notes de l'Entraîneur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentEval.notes}
            </p>
            {/* Development plan removed - not in EvaluationType schema */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
