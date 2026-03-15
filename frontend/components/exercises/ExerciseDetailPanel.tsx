'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X, Clock, Users, Play, Instagram, Trash2,
  ExternalLink, Target, Dumbbell, Tag, Maximize2
} from 'lucide-react';
import VideoLightbox from './VideoLightbox';

interface ExerciseDetailPanelProps {
  exercise: any;
  onClose: () => void;
  onDelete: () => void;
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
  BEGINNER: { label: 'Debutant', color: 'bg-green-100 text-green-800' },
  INTERMEDIATE: { label: 'Intermediaire', color: 'bg-yellow-100 text-yellow-800' },
  ADVANCED: { label: 'Avance', color: 'bg-orange-100 text-orange-800' },
  EXPERT: { label: 'Expert', color: 'bg-red-100 text-red-800' },
};

const intensityLabels: Record<string, string> = {
  LIGHT: 'Legere',
  MODERATE: 'Moderee',
  HIGH: 'Haute',
};

export default function ExerciseDetailPanel({ exercise, onClose, onDelete }: ExerciseDetailPanelProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const diff = difficultyConfig[exercise.difficulty] || { label: exercise.difficulty, color: '' };


  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Video / Instagram Preview + Lightbox */}
        {exercise.instagramUrl && (
          <>
            <div
              className="rounded-lg overflow-hidden border cursor-pointer group relative"
              onClick={() => setLightboxOpen(true)}
            >
              {/* Thumbnail or embed preview */}
              {exercise.thumbnailUrl ? (
                <div className="relative">
                  <img
                    src={exercise.thumbnailUrl}
                    alt={exercise.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-gray-900 ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-gray-900 dark:text-white ml-1" />
                    </div>
                    <span className="text-sm text-muted-foreground">Voir la video</span>
                  </div>
                </div>
              )}

              {/* Bottom bar */}
              <div className="p-2 bg-muted flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Instagram className="h-3 w-3" /> Video Instagram
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" /> Cliquer pour agrandir
                </span>
              </div>
            </div>

            <VideoLightbox
              instagramUrl={exercise.instagramUrl}
              exerciseName={exercise.name}
              open={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />
          </>
        )}

        {exercise.videoUrl && !exercise.instagramUrl && (
          <div className="rounded-lg overflow-hidden border">
            <video
              src={exercise.videoUrl}
              controls
              className="w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground">{exercise.description}</p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{exercise.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{exercise.minPlayers}-{exercise.maxPlayers} joueurs</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>{categoryLabels[exercise.category]}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            <span>{intensityLabels[exercise.intensity]}</span>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <Badge className={diff.color}>{diff.label}</Badge>
        </div>

        {/* Instructions */}
        {exercise.instructions && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Instructions</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{exercise.instructions}</p>
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Materiel</h4>
            <div className="flex gap-1 flex-wrap">
              {exercise.equipment.map((eq: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">{eq}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Target Skills */}
        {exercise.targetSkills?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Competences ciblees</h4>
            <div className="flex gap-1 flex-wrap">
              {exercise.targetSkills.map((skill: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {exercise.tags?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Tag className="h-4 w-4" /> Tags
            </h4>
            <div className="flex gap-1 flex-wrap">
              {exercise.tags.map((t: any) => (
                <Badge
                  key={t.tag?.id || t.id}
                  variant="outline"
                  style={t.tag?.color ? { borderColor: t.tag.color, color: t.tag.color } : {}}
                >
                  {t.tag?.name || t.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {!exercise.isBaseExercise && (
          <div className="pt-3 border-t">
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer l'exercice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
