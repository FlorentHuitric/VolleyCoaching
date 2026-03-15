'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Plus, Filter, Play, Clock, Users,
  Tag, Instagram, Video, Grid3X3, List, ExternalLink
} from 'lucide-react';
import { GET_EXERCISES, GET_EXERCISE_TAGS } from '@/graphql/queries/exercises';
import { CREATE_EXERCISE, DELETE_EXERCISE, CREATE_EXERCISE_TAG } from '@/graphql/mutations/exercises';
import AddExerciseDialog from '@/components/exercises/AddExerciseDialog';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import ExerciseDetailPanel from '@/components/exercises/ExerciseDetailPanel';
import VideoLightbox from '@/components/exercises/VideoLightbox';

export default function ExercisesPage() {
  const { user } = useAuth();
  const { currentTeamId } = useTeam();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [lightboxExercise, setLightboxExercise] = useState<any>(null);

  const orgId = user?.orgId || '';

  const { data: exercisesData, loading, refetch } = useQuery(GET_EXERCISES, {
    variables: { orgId },
    skip: !orgId,
  });

  const { data: tagsData } = useQuery(GET_EXERCISE_TAGS, {
    variables: { orgId },
    skip: !orgId,
  });

  const [deleteExercise] = useMutation(DELETE_EXERCISE, {
    onCompleted: () => {
      toast.success('Exercice supprime');
      refetch();
      setSelectedExercise(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const exercises = exercisesData?.exercises || [];
  const tags = tagsData?.exerciseTags || [];

  // Filtering
  const filteredExercises = exercises.filter((ex: any) => {
    const matchesSearch = !searchTerm ||
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every((tagId: string) =>
        ex.tags?.some((t: any) => t.tag?.id === tagId)
      );

    return matchesSearch && matchesCategory && matchesDifficulty && matchesTags;
  });

  const categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'WARMUP', label: 'Echauffement' },
    { value: 'TECHNICAL_DRILL', label: 'Technique' },
    { value: 'TACTICAL_DRILL', label: 'Tactique' },
    { value: 'PHYSICAL_CONDITIONING', label: 'Physique' },
    { value: 'GAME_SITUATION', label: 'Situation de jeu' },
    { value: 'COOL_DOWN', label: 'Retour au calme' },
  ];

  const difficulties = [
    { value: 'all', label: 'Toutes' },
    { value: 'BEGINNER', label: 'Debutant' },
    { value: 'INTERMEDIATE', label: 'Intermediaire' },
    { value: 'ADVANCED', label: 'Avance' },
    { value: 'EXPERT', label: 'Expert' },
  ];

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet exercice ?')) {
      deleteExercise({ variables: { id } });
    }
  };

  const instagramCount = exercises.filter((ex: any) => ex.instagramUrl).length;
  const videoCount = exercises.filter((ex: any) => ex.videoUrl || ex.instagramUrl).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bibliotheque d'Exercices</h1>
          <p className="text-muted-foreground mt-1">
            {exercises.length} exercices dont {videoCount} avec video
            {instagramCount > 0 && ` ({instagramCount} Instagram)`}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un exercice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Grid3X3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{exercises.length}</p>
              <p className="text-xs text-muted-foreground">Total exercices</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <Instagram className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{instagramCount}</p>
              <p className="text-xs text-muted-foreground">Videos Instagram</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tags.length}</p>
              <p className="text-xs text-muted-foreground">Tags</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{videoCount}</p>
              <p className="text-xs text-muted-foreground">Avec video</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un exercice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Difficulty + Tags */}
        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {difficulties.map((diff) => (
            <Badge
              key={diff.value}
              variant={selectedDifficulty === diff.value ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedDifficulty(diff.value)}
            >
              {diff.label}
            </Badge>
          ))}
          <span className="mx-2 text-muted-foreground">|</span>
          {tags.map((tag: any) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              style={selectedTags.includes(tag.id) && tag.color ? { backgroundColor: tag.color } : {}}
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag.id)
                    ? prev.filter(t => t !== tag.id)
                    : [...prev, tag.id]
                );
              }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Exercise Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : filteredExercises.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-1">Aucun exercice trouve</h3>
                <p className="text-muted-foreground mb-4">
                  {exercises.length === 0
                    ? 'Ajoutez votre premier exercice ou importez une video Instagram'
                    : 'Essayez de modifier vos filtres'
                  }
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un exercice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }>
              {filteredExercises.map((exercise: any) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  viewMode={viewMode}
                  isSelected={selectedExercise?.id === exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  onDelete={() => handleDelete(exercise.id)}
                  onPlayVideo={() => exercise.instagramUrl && setLightboxExercise(exercise)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedExercise && (
          <div className="hidden lg:block w-[400px] shrink-0">
            <ExerciseDetailPanel
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
              onDelete={() => handleDelete(selectedExercise.id)}
            />
          </div>
        )}
      </div>

      {/* Add Exercise Dialog */}
      {showAddDialog && (
        <AddExerciseDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false);
            refetch();
          }}
          tags={tags}
          orgId={orgId}
          userId={user?.id || ''}
        />
      )}

      {/* Video Lightbox */}
      {lightboxExercise && (
        <VideoLightbox
          instagramUrl={lightboxExercise.instagramUrl}
          exerciseName={lightboxExercise.name}
          open={!!lightboxExercise}
          onClose={() => setLightboxExercise(null)}
        />
      )}
    </div>
  );
}
