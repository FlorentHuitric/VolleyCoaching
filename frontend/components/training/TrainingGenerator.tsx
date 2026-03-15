'use client';

import { useState, useEffect } from 'react';
import { PlayerProfile } from '@/types/player-evaluation';
import { TrainingSession, TrainingGeneratorParams, ExerciseDifficulty } from '@/types/exercises';
import { generateTrainingSession } from '@/services/trainingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Users, Clock, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TrainingGeneratorProps {
  availablePlayers: PlayerProfile[];
  onGenerated: (session: TrainingSession) => void;
}

export default function TrainingGenerator({
  availablePlayers,
  onGenerated
}: TrainingGeneratorProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(90);
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('intermediate');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'high'>('moderate');
  const [includeWarmup, setIncludeWarmup] = useState(true);
  const [includeStretching, setIncludeStretching] = useState(true);
  const [includeGame, setIncludeGame] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to get rarity gradient classes based on rating
  const getRarityGradient = (rating: number) => {
    if (rating >= 9.5) return 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400';
    if (rating >= 9) return 'bg-gradient-to-br from-red-500 to-pink-500';
    if (rating >= 8) return 'bg-gradient-to-br from-yellow-400 to-orange-400';
    if (rating >= 7) return 'bg-gradient-to-br from-purple-500 to-indigo-500';
    if (rating >= 6) return 'bg-gradient-to-br from-blue-500 to-cyan-500';
    if (rating >= 5) return 'bg-gradient-to-br from-green-500 to-emerald-500';
    return 'bg-gradient-to-br from-gray-400 to-gray-500';
  };

  const togglePlayer = (playerId: string) => {
    setSelectedPlayerIds(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const selectAllPlayers = () => {
    setSelectedPlayerIds(availablePlayers.map(p => p.id));
  };

  const deselectAllPlayers = () => {
    setSelectedPlayerIds([]);
  };

  const handleGenerate = () => {
    if (selectedPlayerIds.length === 0) {
      toast.warning('Veuillez sélectionner au moins un joueur');
      return;
    }

    setGenerating(true);

    // Simulate async generation (in real app, this could be an API call)
    setTimeout(() => {
      const selectedPlayers = availablePlayers.filter(p =>
        selectedPlayerIds.includes(p.id)
      );

      const params: TrainingGeneratorParams = {
        playerIds: selectedPlayerIds,
        totalDuration: duration,
        difficulty,
        intensity,
        includeWarmup,
        includeStretching,
        includeGame
      };

      const session = generateTrainingSession(selectedPlayers, params);
      onGenerated(session);
      setGenerating(false);
    }, 500);
  };

  const difficulties: { value: ExerciseDifficulty; label: string; icon: string }[] = [
    { value: 'beginner', label: 'Débutant', icon: '🟢' },
    { value: 'intermediate', label: 'Intermédiaire', icon: '🟡' },
    { value: 'advanced', label: 'Avancé', icon: '🟠' },
    { value: 'expert', label: 'Expert', icon: '🔴' }
  ];

  const intensities: { value: 'light' | 'moderate' | 'high'; label: string; desc: string }[] = [
    { value: 'light', label: 'Légère', desc: '70% technique, 30% intensif' },
    { value: 'moderate', label: 'Modérée', desc: '50% technique, 50% intensif' },
    { value: 'high', label: 'Élevée', desc: '30% technique, 70% intensif' }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-purple-900 dark:text-purple-100">
          <Wand2 className="h-6 w-6" />
          <span>Générateur Automatique d'Entraînement</span>
        </CardTitle>
        <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
          Créez un entraînement personnalisé en fonction de vos joueurs et de leurs besoins
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Player selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
              <Users className="h-4 w-4" />
              <span>Joueurs présents ({selectedPlayerIds.length}/{availablePlayers.length})</span>
            </Label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllPlayers}
                className="text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Tous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAllPlayers}
                className="text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Aucun
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            {!mounted ? (
              // Server-side render: simple badges without hover effects
              availablePlayers.map(player => (
                <div
                  key={player.id}
                  className="cursor-pointer text-xs py-2 px-2.5 rounded-md border font-medium inline-flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                >
                  {player.firstName} {player.lastName.charAt(0)}.
                </div>
              ))
            ) : (
              // Client-side render: full interactive badges
              availablePlayers.map(player => {
                const rating = player.currentEvaluation?.overallRating || 5;
                const isSelected = selectedPlayerIds.includes(player.id);

                // Get actual color values for inline styles
                const getGradientStyle = (rating: number): string => {
                  if (rating >= 9.5) return 'linear-gradient(to bottom right, rgb(244 114 182), rgb(192 132 252), rgb(96 165 250))';
                  if (rating >= 9) return 'linear-gradient(to bottom right, rgb(239 68 68), rgb(236 72 153))';
                  if (rating >= 8) return 'linear-gradient(to bottom right, rgb(251 191 36), rgb(251 146 60))';
                  if (rating >= 7) return 'linear-gradient(to bottom right, rgb(168 85 247), rgb(99 102 241))';
                  if (rating >= 6) return 'linear-gradient(to bottom right, rgb(59 130 246), rgb(6 182 212))';
                  if (rating >= 5) return 'linear-gradient(to bottom right, rgb(34 197 94), rgb(16 185 129))';
                  return 'linear-gradient(to bottom right, rgb(156 163 175), rgb(107 114 128))';
                };

                return (
                  <div
                    key={player.id}
                    className={cn(
                      'cursor-pointer text-xs py-2 px-2.5 rounded-md transition-all border font-medium inline-flex items-center justify-center',
                      isSelected
                        ? 'text-white border-white ring-2 ring-white shadow-lg font-bold'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    )}
                    style={isSelected ? { background: getGradientStyle(rating) } : undefined}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = getGradientStyle(rating);
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.fontWeight = '600';
                        e.currentTarget.style.borderColor = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = '';
                        e.currentTarget.style.fontWeight = '';
                        e.currentTarget.style.borderColor = '';
                      }
                    }}
                    onClick={() => togglePlayer(player.id)}
                  >
                    {player.firstName} {player.lastName.charAt(0)}.
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <Label className="flex items-center space-x-2 mb-2 text-gray-900 dark:text-gray-100">
            <Clock className="h-4 w-4" />
            <span>Durée totale</span>
          </Label>
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              min="30"
              max="180"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
            <div className="flex space-x-2">
              {[60, 90, 120].map(mins => (
                <Button
                  key={mins}
                  variant="outline"
                  size="sm"
                  onClick={() => setDuration(mins)}
                  className={`text-xs ${
                    duration === mins
                      ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <Label className="flex items-center space-x-2 mb-2 text-gray-900 dark:text-gray-100">
            <Target className="h-4 w-4" />
            <span>Niveau de difficulté</span>
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {difficulties.map(diff => (
              <Button
                key={diff.value}
                variant={difficulty === diff.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficulty(diff.value)}
                className={`${
                  difficulty === diff.value
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{diff.icon}</span>
                {diff.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div>
          <Label className="flex items-center space-x-2 mb-2 text-gray-900 dark:text-gray-100">
            <Zap className="h-4 w-4" />
            <span>Intensité de l'entraînement</span>
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {intensities.map(int => (
              <Button
                key={int.value}
                variant={intensity === int.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIntensity(int.value)}
                className={`flex flex-col h-auto py-3 ${
                  intensity === int.value
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="font-semibold">{int.label}</span>
                <span className="text-xs opacity-80 mt-1">{int.desc}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Phase toggles */}
        <div className="space-y-2">
          <Label className="text-gray-900 dark:text-gray-100">Phases incluses</Label>
          <div className="space-y-2">
            {[
              { value: includeWarmup, setter: setIncludeWarmup, label: 'Échauffement', icon: '🏃' },
              { value: includeStretching, setter: setIncludeStretching, label: 'Étirements', icon: '🧘' },
              { value: includeGame, setter: setIncludeGame, label: 'Jeu (match)', icon: '🏐' }
            ].map((phase, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <input
                  type="checkbox"
                  checked={phase.value}
                  onChange={(e) => phase.setter(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <span className="text-xl">{phase.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{phase.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={selectedPlayerIds.length === 0 || generating}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold"
          size="lg"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Génération en cours...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Générer l'entraînement
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
