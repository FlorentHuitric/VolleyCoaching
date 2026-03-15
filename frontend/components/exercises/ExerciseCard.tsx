'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Play, Instagram, Trash2, ExternalLink } from 'lucide-react';

interface ExerciseCardProps {
  exercise: any;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onPlayVideo?: () => void;
}

const categoryLabels: Record<string, string> = {
  WARMUP: 'Echauffement',
  TECHNICAL_DRILL: 'Technique',
  TACTICAL_DRILL: 'Tactique',
  PHYSICAL_CONDITIONING: 'Physique',
  GAME_SITUATION: 'Situation de jeu',
  COOL_DOWN: 'Retour au calme',
  STRETCHING: 'Etirements',
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: 'Debutant', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  INTERMEDIATE: { label: 'Intermediaire', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  ADVANCED: { label: 'Avance', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  EXPERT: { label: 'Expert', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

export default function ExerciseCard({ exercise, viewMode, isSelected, onClick, onDelete, onPlayVideo }: ExerciseCardProps) {
  const hasVideo = exercise.videoUrl || exercise.instagramUrl;
  const diff = difficultyConfig[exercise.difficulty] || { label: exercise.difficulty, color: '' };

  if (viewMode === 'list') {
    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4 flex items-center gap-4">
          {/* Thumbnail / Video indicator */}
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
            {exercise.thumbnailUrl ? (
              <img src={exercise.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : hasVideo ? (
              <Play className="h-6 w-6 text-muted-foreground" />
            ) : (
              <div className="text-2xl">{categoryLabels[exercise.category]?.[0] || '?'}</div>
            )}
            {exercise.instagramUrl && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-0.5">
                <Instagram className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{exercise.name}</h3>
              {exercise.isBaseExercise && (
                <Badge variant="secondary" className="text-xs shrink-0">Base</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{exercise.description}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {exercise.duration}min
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> {exercise.minPlayers}-{exercise.maxPlayers}
              </span>
              <Badge variant="outline" className="text-xs">{categoryLabels[exercise.category]}</Badge>
              <Badge className={`text-xs ${diff.color}`}>{diff.label}</Badge>
            </div>
          </div>

          {/* Tags */}
          <div className="hidden md:flex gap-1 shrink-0">
            {exercise.tags?.slice(0, 3).map((t: any) => (
              <Badge
                key={t.tag?.id || t.id}
                variant="outline"
                className="text-xs"
                style={t.tag?.color ? { borderColor: t.tag.color, color: t.tag.color } : {}}
              >
                {t.tag?.name || t.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid mode
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg group ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-muted rounded-t-lg overflow-hidden">
        {exercise.thumbnailUrl ? (
          <img src={exercise.thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            {hasVideo ? (
              <Play className="h-10 w-10 text-muted-foreground group-hover:scale-110 transition-transform" />
            ) : (
              <span className="text-4xl opacity-50">{categoryLabels[exercise.category]?.[0] || '?'}</span>
            )}
          </div>
        )}

        {/* Play button overlay for videos */}
        {hasVideo && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onPlayVideo?.();
            }}
          >
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Play className="h-5 w-5 text-gray-900 ml-0.5" />
            </div>
          </div>
        )}

        {/* Instagram badge */}
        {exercise.instagramUrl && (
          <div className="absolute top-2 right-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-1.5 shadow-lg">
            <Instagram className="h-4 w-4 text-white" />
          </div>
        )}

        {/* Difficulty badge */}
        <Badge className={`absolute top-2 left-2 ${diff.color}`}>
          {diff.label}
        </Badge>

        {/* Duration overlay */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {exercise.duration}min
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-1">{exercise.name}</h3>
          {exercise.isBaseExercise && (
            <Badge variant="secondary" className="text-xs shrink-0">Base</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{exercise.description}</p>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className="text-xs">{categoryLabels[exercise.category]}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> {exercise.minPlayers}-{exercise.maxPlayers}
          </span>
        </div>

        {/* Tags */}
        {exercise.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {exercise.tags.slice(0, 4).map((t: any) => (
              <Badge
                key={t.tag?.id || t.id}
                variant="outline"
                className="text-xs"
                style={t.tag?.color ? { borderColor: t.tag.color, color: t.tag.color } : {}}
              >
                {t.tag?.name || t.name}
              </Badge>
            ))}
            {exercise.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">+{exercise.tags.length - 4}</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
