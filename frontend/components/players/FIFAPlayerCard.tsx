'use client';

import { useState, useRef, useCallback } from 'react';
import { PlayerType } from '@/types/player';

// Type alias for backward compatibility
type PlayerProfile = PlayerType;
type SkillRating = number;
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';
import { getCountryFlagGradient } from '@/utils/countryFlags';
import { getPlayerSlug } from '@/utils/playerSlug';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Zap, Brain, Target } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface FIFAPlayerCardProps {
  player: PlayerProfile;
  isSelected?: boolean;
  onSelect?: (player: PlayerProfile) => void;
}

export default function FIFAPlayerCard({ player, isSelected = false, onSelect }: FIFAPlayerCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const currentEval = player.currentEvaluation;

  // Motion values pour le tracking 3D
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs pour des animations fluides
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 20, stiffness: 300 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { damping: 20, stiffness: 300 });

  // Effet de perspective 3D
  const transform = useTransform(
    [rotateX, rotateY],
    ([x, y]) => `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg)`
  );

  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normaliser les coordonnées entre -0.5 et 0.5
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(player);
      setIsFlipping(true);

      // Délai pour l'animation avant navigation
      setTimeout(() => {
        router.push(`/players/${player.id}`);
      }, 800);
    }
  };

  // Function to get player portrait based on name
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
    // Gris - Fond gris métallique (< 5.0)
    return 'bg-[url("/images/card-backgrounds/card-bg-gris.png")] bg-cover bg-center';
  };

  const getRarityGlow = (rating: number) => {
    if (rating >= 9.5) return 'shadow-rainbow shadow-2xl'; // Rainbow Ultimate - removed animate-pulse
    if (rating >= 9) return 'shadow-red-500/70 shadow-2xl'; // Rouge Carmin
    if (rating >= 8) return 'shadow-yellow-500/60 shadow-xl'; // Doré
    if (rating >= 7) return 'shadow-purple-500/50 shadow-lg'; // Violet
    if (rating >= 6) return 'shadow-blue-500/40 shadow-lg'; // Bleu
    if (rating >= 5) return 'shadow-green-500/40 shadow-md'; // Vert
    return 'shadow-gray-500/30 shadow-sm'; // Gris
  };

  const getAuraEffect = (rating: number) => {
    if (rating >= 9.5) {
      // Rainbow Ultimate - Aura arc-en-ciel complexe
      return (
        <>
          <div className="absolute -inset-8 bg-gradient-conic from-pink-500 via-purple-500 via-blue-500 via-green-500 via-yellow-500 to-pink-500 rounded-full opacity-30 blur-2xl animate-spin" style={{animationDuration: '8s'}} />
          <div className="absolute -inset-6 bg-gradient-radial from-white/20 to-transparent rounded-full opacity-40" />
          <div className="absolute -inset-4 bg-gradient-conic from-transparent via-white/10 to-transparent rounded-full opacity-60 animate-spin" style={{animationDuration: '12s'}} />
        </>
      );
    }
    if (rating >= 9) {
      // Rouge Carmin - Aura de flammes mystiques
      return (
        <>
          <div className="absolute -inset-6 bg-gradient-radial from-red-500/40 via-orange-500/30 to-transparent rounded-full opacity-50 blur-xl" />
          <div className="absolute -inset-4 bg-gradient-radial from-red-600/30 via-red-400/20 to-transparent rounded-full opacity-40 blur-lg" />
          <div className="absolute -inset-8 bg-gradient-conic from-red-500/20 via-orange-600/20 to-red-500/20 rounded-full opacity-30 blur-2xl animate-spin" style={{animationDuration: '15s'}} />
        </>
      );
    }
    if (rating >= 8) {
      // Doré - Aura dorée élégante
      return (
        <>
          <div className="absolute -inset-5 bg-gradient-radial from-yellow-400/40 via-amber-500/30 to-transparent rounded-full opacity-60 blur-xl" />
          <div className="absolute -inset-3 bg-gradient-radial from-yellow-300/30 to-transparent rounded-full opacity-50 blur-lg" style={{animationDuration: '3s'}} />
        </>
      );
    }
    if (rating >= 7) {
      // Violet - Aura mystique violette
      return (
        <>
          <div className="absolute -inset-4 bg-gradient-radial from-purple-500/35 via-purple-400/25 to-transparent rounded-full opacity-60 blur-lg" />
          <div className="absolute -inset-6 bg-gradient-radial from-purple-600/20 to-transparent rounded-full opacity-40 blur-xl" style={{animationDuration: '4s'}} />
        </>
      );
    }
    if (rating >= 6) {
      // Bleu - Aura cristalline bleue
      return (
        <>
          <div className="absolute -inset-3 bg-gradient-radial from-blue-500/30 via-blue-400/20 to-transparent rounded-full opacity-50 blur-lg" />
          <div className="absolute -inset-5 bg-gradient-radial from-blue-600/15 to-transparent rounded-full opacity-35 blur-xl" />
        </>
      );
    }
    if (rating >= 5) {
      // Vert - Aura naturelle verte
      return (
        <>
          <div className="absolute -inset-3 bg-gradient-radial from-green-500/25 via-green-400/15 to-transparent rounded-full opacity-45 blur-lg" />
          <div className="absolute -inset-4 bg-gradient-radial from-green-600/10 to-transparent rounded-full opacity-30 blur-xl" />
        </>
      );
    }
    // Gris - Aura subtile grise
    return (
      <div className="absolute -inset-2 bg-gradient-radial from-gray-400/20 to-transparent rounded-full opacity-30 blur-md" />
    );
  };

  const getTextColors = (rating: number) => {
    if (rating >= 9.5) {
      return {
        rating: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black', // removed animate-pulse
        name: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        position: 'text-yellow-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold',
        stats: 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
      };
    }
    if (rating >= 9) {
      return {
        rating: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        name: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        position: 'text-orange-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold',
        stats: 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
      };
    }
    if (rating >= 8) {
      return {
        rating: 'text-amber-900 drop-shadow-[0_4px_8px_rgba(255,255,255,0.9)] font-black',
        name: 'text-amber-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] font-bold',
        position: 'text-orange-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] font-semibold',
        stats: 'text-amber-800 drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]'
      };
    }
    if (rating >= 7) {
      return {
        rating: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        name: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        position: 'text-violet-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold',
        stats: 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
      };
    }
    if (rating >= 6) {
      return {
        rating: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        name: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        position: 'text-cyan-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold',
        stats: 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
      };
    }
    if (rating >= 5) {
      return {
        rating: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
        name: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
        position: 'text-emerald-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold',
        stats: 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
      };
    }
    return {
      rating: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] font-black',
      name: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-bold',
      position: 'text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-semibold',
      stats: 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
    };
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

  const getRarityBadgeStyle = (rating: number) => {
    // Badges avec contraste RGAA AAA optimisé
    if (rating >= 9.5) return 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white border-white/60 font-bold shadow-lg'; // Rainbow - removed animate-pulse
    if (rating >= 9) return 'bg-red-950/95 text-red-50 border-red-200/70 font-bold shadow-lg'; // Rouge Carmin
    if (rating >= 8) return 'bg-yellow-900/95 text-yellow-50 border-yellow-200/70 font-bold shadow-lg'; // Doré
    if (rating >= 7) return 'bg-purple-950/95 text-purple-50 border-purple-200/70 font-bold shadow-lg'; // Violet
    if (rating >= 6) return 'bg-blue-950/95 text-blue-50 border-blue-200/70 font-bold shadow-lg'; // Bleu
    if (rating >= 5) return 'bg-green-950/95 text-green-50 border-green-200/70 font-bold shadow-lg'; // Vert
    return 'bg-gray-950/95 text-gray-50 border-gray-200/70 font-bold shadow-lg'; // Gris
  };

  const getStarColor = (rating: number) => {
    if (rating >= 9.5) return 'fill-white text-white drop-shadow-lg'; // Rainbow - removed animate-pulse
    if (rating >= 9) return 'fill-red-300 text-red-300 drop-shadow-lg'; // Rouge Carmin
    if (rating >= 8) return 'fill-yellow-400 text-yellow-400 drop-shadow-lg'; // Doré
    if (rating >= 7) return 'fill-purple-300 text-purple-300 drop-shadow-lg'; // Violet
    if (rating >= 6) return 'fill-blue-300 text-blue-300 drop-shadow-lg'; // Bleu
    if (rating >= 5) return 'fill-green-300 text-green-300 drop-shadow-lg'; // Vert
    return 'fill-gray-300 text-gray-300 drop-shadow-lg'; // Gris
  };

  const getStatColor = (value: number) => {
    if (value >= 9) return 'text-green-400';
    if (value >= 7) return 'text-yellow-400';
    if (value >= 5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHolographicEffects = (rating: number, isHovered: boolean) => {
    if (rating >= 9.5) {
      // Rainbow Ultimate - Effets arc-en-ciel multiples et complexes
      return (
        <>
          {/* Effet prismatique de base - statique */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3) 0%, rgba(147, 51, 234, 0.3) 20%, rgba(59, 130, 246, 0.3) 40%, rgba(16, 185, 129, 0.3) 60%, rgba(245, 158, 11, 0.3) 80%, rgba(239, 68, 68, 0.3) 100%)'
              }}
            />
          </div>
          {/* Effet holographique rotatif - statique */}
          <div className="absolute inset-0 opacity-40">
            <div
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.15) 25%, transparent 50%, rgba(255, 255, 255, 0.15) 75%, transparent 100%)'
              }}
            />
          </div>
          {/* Effets animés au hover seulement */}
          {isHovered && (
            <>
              {/* Rotation rainbow au hover */}
              <div className="absolute inset-0 opacity-40">
                <div
                  className="absolute inset-0 animate-spin"
                  style={{
                    background: 'linear-gradient(to right, rgba(236, 72, 153, 0.5) 0%, rgba(147, 51, 234, 0.5) 20%, rgba(59, 130, 246, 0.5) 40%, rgba(16, 185, 129, 0.5) 60%, rgba(245, 158, 11, 0.5) 80%, rgba(239, 68, 68, 0.5) 100%)',
                    animationDuration: '4s'
                  }}
                />
              </div>
              {/* Rotation holographique au hover */}
              <div className="absolute inset-0 opacity-60">
                <div
                  className="absolute inset-0 animate-spin"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.25) 25%, transparent 50%, rgba(255, 255, 255, 0.25) 75%, transparent 100%)',
                    animationDuration: '8s'
                  }}
                />
              </div>
              {/* Vagues arc-en-ciel */}
              <div className="absolute inset-0 bg-gradient-radial from-white/15 via-transparent to-transparent animate-pulse opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/8 to-transparent animate-ping opacity-40" style={{ animationDuration: '3s' }} />
            </>
          )}
        </>
      );
    }

    if (rating >= 9) {
      // Carmin - Effets de feu et embrasement
      return (
        <>
          {/* Flammes de base */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-red-600/60 via-orange-500/40 to-transparent" />
          </div>
          {/* Effet d'embrasement au hover */}
          {isHovered && (
            <>
              <div className="absolute inset-0 bg-gradient-radial from-red-500/20 via-orange-500/15 to-transparent animate-pulse opacity-80" />
              <div className="absolute inset-0 bg-gradient-conic from-red-500/20 via-orange-400/15 to-red-500/20 animate-spin opacity-40" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-red-700/50 via-orange-600/30 to-transparent animate-pulse" />
            </>
          )}
        </>
      );
    }

    if (rating >= 8) {
      // Doré - Effets de lumière dorée et brillance
      return (
        <>
          {/* Lueur dorée de base */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400/40 via-amber-500/25 to-transparent" />
          </div>
          {/* Effets de brillance au hover */}
          {isHovered && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 via-amber-400/20 to-orange-400/25 opacity-70" />
              <div className="absolute inset-0 bg-gradient-conic from-transparent via-yellow-200/15 to-transparent animate-spin opacity-50" style={{ animationDuration: '10s' }} />
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-yellow-300/30 to-transparent animate-pulse" />
            </>
          )}
        </>
      );
    }

    if (rating >= 7) {
      // Violet - Effets mystiques et énergétiques
      return (
        <>
          {/* Aura mystique de base */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-radial from-purple-500/35 via-violet-600/20 to-transparent" />
          </div>
          {/* Effets mystiques au hover */}
          {isHovered && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/25 via-violet-500/20 to-indigo-600/25 opacity-60" />
              <div className="absolute inset-0 bg-gradient-radial from-purple-300/15 via-transparent to-transparent animate-pulse opacity-70" style={{ animationDuration: '4s' }} />
            </>
          )}
        </>
      );
    }

    if (rating >= 6) {
      // Bleu - Effets cristallins et glacés
      return (
        <>
          {/* Cristaux de base */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0 bg-gradient-radial from-blue-400/30 via-cyan-500/20 to-transparent" />
          </div>
          {/* Effets cristallins au hover */}
          {isHovered && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 via-cyan-400/15 to-blue-600/20 opacity-50" />
              <div className="absolute inset-0 bg-gradient-radial from-cyan-200/10 via-transparent to-transparent animate-pulse opacity-60" style={{ animationDuration: '3s' }} />
            </>
          )}
        </>
      );
    }

    if (rating >= 5) {
      // Vert - Effets naturels et organiques
      return (
        <>
          {/* Nature de base */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0 bg-gradient-radial from-emerald-400/30 via-green-500/20 to-transparent" />
          </div>
          {/* Effets naturels au hover */}
          {isHovered && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/20 via-green-400/15 to-teal-500/20 opacity-50" />
            </>
          )}
        </>
      );
    }

    // Gris - Effets métalliques subtils
    return (
      <>
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-300/10 via-gray-400/8 to-slate-500/10 opacity-40" />
        )}
      </>
    );
  };


  if (!currentEval) {
    return (
      <motion.div
        className="w-80 h-[485px] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-xl border-2 border-amber-500/30 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
        onClick={handleCardClick}
        whileHover={{ y: -8 }}
      >
        <div className="relative h-full flex flex-col items-center justify-center p-6">
          {/* Badge "Non évalué" */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold">
              NON ÉVALUÉ
            </Badge>
          </div>

          {/* Player Avatar */}
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/40 shadow-lg">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-black bg-gradient-to-br from-slate-600 to-slate-700"
                >
                  {player.firstName[0]}{player.lastName[0]}
                </div>
              )}
            </div>
            {/* Number Badge */}
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-lg shadow-lg border-2 border-slate-900">
              {player.jerseyNumber ?? '—'}
            </div>
          </div>

          {/* Player Name */}
          <h3 className="text-2xl font-black text-white text-center mb-2">
            {player.firstName} {player.lastName}
          </h3>

          {/* Position */}
          <Badge className="mb-4 bg-white/10 text-white border-white/30 px-4 py-1.5 text-sm font-bold">
            {getPositionAbbreviation(player.primaryPosition as any)}
          </Badge>

          {/* Message */}
          <div className="text-center">
            <Target className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <p className="text-amber-300 font-semibold">En attente d'évaluation</p>
            <p className="text-slate-400 text-sm mt-2">Cliquez pour créer une évaluation</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const overallRating = Math.round(currentEval.overallRating * 10) / 10;

  // Helper function to calculate average and round to 1 decimal
  const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 10) / 10;
  };

  // Safe calculation with fallbacks for missing data
  const techRating = currentEval?.technical ? (() => {
    const tech = currentEval.technical as any;
    const allValues: number[] = [];

    // Collect all technical skill values
    if (tech.serving) allValues.push(...Object.values(tech.serving).filter((v): v is number => typeof v === 'number'));
    if (tech.passing) allValues.push(...Object.values(tech.passing).filter((v): v is number => typeof v === 'number'));
    if (tech.setting) allValues.push(...Object.values(tech.setting).filter((v): v is number => typeof v === 'number'));
    if (tech.attacking) allValues.push(...Object.values(tech.attacking).filter((v): v is number => typeof v === 'number'));
    if (tech.blocking) allValues.push(...Object.values(tech.blocking).filter((v): v is number => typeof v === 'number'));
    if (tech.defense) allValues.push(...Object.values(tech.defense).filter((v): v is number => typeof v === 'number'));

    return calculateAverage(allValues);
  })() : Math.round(overallRating * 10) / 10;

  const physRating = currentEval?.physical ? (() => {
    const phys = currentEval.physical as any;
    const allValues: number[] = [];

    // Only collect performance, power, and flexibility (ratings 0-10), skip measurements (cm/kg)
    if (phys.performance) allValues.push(...Object.values(phys.performance).filter((v): v is number => typeof v === 'number' && v >= 0 && v <= 10));
    if (phys.power) allValues.push(...Object.values(phys.power).filter((v): v is number => typeof v === 'number' && v >= 0 && v <= 10));
    if (phys.flexibility) allValues.push(...Object.values(phys.flexibility).filter((v): v is number => typeof v === 'number' && v >= 0 && v <= 10));

    return calculateAverage(allValues);
  })() : Math.round(overallRating * 0.9 * 10) / 10;

  const mentalRating = currentEval?.mental ? (() => {
    const ment = currentEval.mental as any;
    const allValues: number[] = [];

    // Collect all mental attribute values
    if (ment.gameIntelligence) allValues.push(...Object.values(ment.gameIntelligence).filter((v): v is number => typeof v === 'number'));
    if (ment.communication) allValues.push(...Object.values(ment.communication).filter((v): v is number => typeof v === 'number'));
    if (ment.leadership) allValues.push(...Object.values(ment.leadership).filter((v): v is number => typeof v === 'number'));
    if (ment.mentalToughness) allValues.push(...Object.values(ment.mentalToughness).filter((v): v is number => typeof v === 'number'));
    if (ment.coachability) allValues.push(...Object.values(ment.coachability).filter((v): v is number => typeof v === 'number'));

    return calculateAverage(allValues);
  })() : Math.round(overallRating * 0.85 * 10) / 10;

  const textColors = getTextColors(overallRating);

  return (
    <div className="relative perspective-1000">
      {/* Auras externes */}
      {getAuraEffect(overallRating)}

      <AnimatePresence>
        <motion.div
          ref={cardRef}
          className={`relative w-80 h-[485px] cursor-pointer transform-gpu ${isSelected ? 'z-50' : 'z-10'} ${isHovered ? 'z-20' : ''}`}
          onClick={handleCardClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          animate={isFlipping ? {
            rotateY: 360,
            scale: isSelected ? 1.1 : 1,
            y: isSelected ? -100 : 0,
          } : {
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? -8 : 0,
          }}
          style={{
            transform: isHovered && !isFlipping ? transform : undefined,
            transformStyle: 'preserve-3d'
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.6
          }}
        >
          {/* Card Container avec fond coloré par rareté */}
          <div className={`
            fifa-card relative w-full h-full rounded-2xl overflow-hidden
            ${getRarityBackground(overallRating)}
            shadow-2xl ${getRarityGlow(overallRating)}
            border-2 border-white/40 backdrop-blur-sm
            ${isHovered ? 'border-white/60 scale-[1.02]' : 'border-white/30'}
            transition-all duration-500 ease-out
          `}>
            {/* Pattern de fond texturé inspiré FIFA */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-white/30 via-white/10 to-transparent"></div>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.1)_25%,_rgba(255,255,255,0.1)_50%,_transparent_50%,_transparent_75%,_rgba(255,255,255,0.1)_75%)] bg-[length:30px_30px] opacity-30"></div>
            </div>

            {/* Overlay subtil pour améliorer la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 opacity-60"></div>

            {/* Effets holographiques */}
            {getHolographicEffects(overallRating, isHovered)}

            {/* Section supérieure - Layout FIFA avec info maître à gauche */}
            <div className="relative flex pt-12 pb-4 px-6">
              {/* Master Info à gauche (rating, position, nation, club) */}
              <div className="absolute left-6 top-12 flex flex-col items-start">
                {/* Rating - Taille massive comme FIFA */}
                <div className={`text-6xl font-black leading-none mb-1 ${textColors.rating} fifa-text-shadow`} suppressHydrationWarning>
                  {overallRating}
                </div>

                {/* Position */}
                <div className={`${textColors.position} text-lg uppercase tracking-wider font-semibold fifa-text-shadow`}>
                  {getPositionAbbreviation(player.primaryPosition as any)}
                </div>

                {/* Badge rareté compact */}
                <Badge className={`${getRarityBadgeStyle(overallRating)} text-xs font-bold px-2 py-0.5 border mt-2`}>
                  {getRarityName(overallRating)}
                </Badge>

                {/* Nation/Club - Dynamic flag + Position */}
                <div className="mt-3 space-y-2">
                  <div className={`w-8 h-6 bg-gradient-to-r ${getCountryFlagGradient(player.nationality)} rounded border border-white/30 shadow-sm`}></div>
                  <div className="w-8 h-8 bg-gray-800 rounded border border-white/30 shadow-sm flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  {/* Position Token - Style comme les jetons de la page d'accueil */}
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/40 shadow-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
                    style={{
                      backgroundColor: getPositionColor(player.primaryPosition as any) || '#3B82F6',
                      opacity: 1
                    }}
                    title={`Position: ${player.primaryPosition}`}
                  >
                    {getPositionAbbreviation(player.primaryPosition as any) || 'POS'}
                  </div>
                </div>
              </div>

              {/* Photo du joueur au centre - Style FIFA */}
              <div className="flex-1 flex justify-center items-start ml-16">
                <div className="relative">
                  {/* Container photo principal */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/40 shadow-2xl">
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
                        className="w-full h-full flex items-center justify-center text-white text-4xl font-black"
                        style={{ backgroundColor: getPositionColor(player.primaryPosition as any) + '90' }}
                      >
                        {player.firstName[0]}{player.lastName[0]}
                      </div>
                    )}
                  </div>

                  {/* Numéro de maillot - Position FIFA */}
                  <div className="absolute -bottom-2 -right-2 bg-black/90 text-white rounded-full w-8 h-8 flex items-center justify-center font-black border-2 border-white/50 text-sm shadow-lg">
                    {player.jerseyNumber ?? '—'}
                  </div>

                  {/* Étoiles de rareté - Position FIFA */}
                  <div className="absolute -top-2 -right-2 flex items-center space-x-0.5">
                    {[...Array(Math.min(5, Math.ceil(overallRating/2)))].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${getStarColor(overallRating)}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section inférieure - Info joueur et stats */}
            <div className="relative px-6 pb-6">
              {/* Nom du joueur - Style FIFA */}
              <div className="text-center mb-4 border-b border-white/20 pb-3">
                <h3 className={`${textColors.name} text-xl font-black uppercase tracking-wider fifa-text-shadow truncate`}>
                  {player.firstName} {player.lastName}
                </h3>
              </div>

              {/* Statistiques - Layout FIFA à deux colonnes */}
              <div className="flex justify-center gap-8">
                <div className="flex flex-col space-y-2">
                  {/* TEC */}
                  <div className="flex items-center space-x-3">
                    <div className={`font-black text-lg ${getStatColor(techRating)} min-w-[24px] text-right fifa-text-shadow`}>
                      {techRating}
                    </div>
                    <div className={`${textColors.stats} text-sm font-semibold uppercase tracking-wide fifa-text-shadow`}>
                      TEC
                    </div>
                  </div>

                  {/* PHY */}
                  <div className="flex items-center space-x-3">
                    <div className={`font-black text-lg ${getStatColor(physRating)} min-w-[24px] text-right fifa-text-shadow`}>
                      {player.currentPhysical ? physRating : '—'}
                    </div>
                    <div className={`${textColors.stats} text-sm font-semibold uppercase tracking-wide fifa-text-shadow`}>
                      PHY
                    </div>
                  </div>

                  {/* MEN */}
                  <div className="flex items-center space-x-3">
                    <div className={`font-black text-lg ${getStatColor(mentalRating)} min-w-[24px] text-right fifa-text-shadow`}>
                      {player.currentMental ? mentalRating : '—'}
                    </div>
                    <div className={`${textColors.stats} text-sm font-semibold uppercase tracking-wide fifa-text-shadow`}>
                      MEN
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {/* POT */}
                  <div className="flex items-center space-x-3">
                    <div className={`font-black text-lg ${getStatColor(currentEval.potentialRating)} min-w-[24px] text-right fifa-text-shadow`}>
                      {currentEval.potentialRating}
                    </div>
                    <div className={`${textColors.stats} text-sm font-semibold uppercase tracking-wide fifa-text-shadow`}>
                      POT
                    </div>
                  </div>

                  {player.assessmentKind === "ESTIMATED" && <span className="rounded-md bg-black/70 px-2 py-1 text-xs text-white">Notes provisoires</span>}
                </div>
              </div>
            </div>

            {/* Effet de brillance supérieur */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/25 via-white/10 to-transparent pointer-events-none"></div>

            {/* Effet de dégradé inférieur */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none"></div>

            {/* Bordure lumineuse animée pour hover avec effet de brillance */}
            <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 pointer-events-none ${
              isHovered ? 'border-white/50' : 'border-white/15'
            }`}></div>

            {/* Effet de brillance sur les bords au hover */}
            {isHovered && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none">
                <div className="absolute inset-0 rounded-2xl border-2 border-white/60 animate-pulse" style={{ animationDuration: '2s' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-sm"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/80 to-transparent blur-sm"></div>
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/80 to-transparent blur-sm"></div>
              </div>
            )}
          </div>

          {/* Effet de lueur externe */}
          <div
            className={`absolute inset-0 rounded-2xl ${getRarityBackground(overallRating)} blur-xl -z-10 transition-opacity duration-300 ${isHovered ? 'opacity-40' : 'opacity-25'}`}
          ></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
