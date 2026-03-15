'use client';

import { useState } from 'react';
import { ExerciseFilters as IExerciseFilters, ExerciseCategory, ExerciseDifficulty } from '@/types/exercises';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X, Search } from 'lucide-react';

interface ExerciseFiltersProps {
  filters: IExerciseFilters;
  onFiltersChange: (filters: IExerciseFilters) => void;
  availablePlayerCount?: number;
}

export default function ExerciseFilters({
  filters,
  onFiltersChange,
  availablePlayerCount
}: ExerciseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories: { value: ExerciseCategory; label: string; icon: string }[] = [
    { value: 'physical', label: 'Physique', icon: '💪' },
    { value: 'technical', label: 'Technique', icon: '🎯' },
    { value: 'tactical', label: 'Tactique', icon: '🧠' },
    { value: 'mental', label: 'Mental', icon: '🧘' },
  ];

  const difficulties: { value: ExerciseDifficulty; label: string; color: string }[] = [
    { value: 'beginner', label: 'Débutant', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    { value: 'intermediate', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { value: 'advanced', label: 'Avancé', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  ];

  const skills = [
    { value: 'serving', label: 'Service' },
    { value: 'passing', label: 'Passe' },
    { value: 'setting', label: 'Passe décisive' },
    { value: 'attacking', label: 'Attaque' },
    { value: 'blocking', label: 'Contre' },
    { value: 'defense', label: 'Défense' },
    { value: 'verticalJump', label: 'Détente' },
    { value: 'speed', label: 'Vitesse' },
    { value: 'agility', label: 'Agilité' },
    { value: 'endurance', label: 'Endurance' },
  ];

  const toggleCategory = (category: ExerciseCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, category: updated.length > 0 ? updated : undefined });
  };

  const toggleDifficulty = (difficulty: ExerciseDifficulty) => {
    const current = filters.difficulty || [];
    const updated = current.includes(difficulty)
      ? current.filter(d => d !== difficulty)
      : [...current, difficulty];
    onFiltersChange({ ...filters, difficulty: updated.length > 0 ? updated : undefined });
  };

  const toggleSkill = (skill: string) => {
    const current = filters.targetSkills || [];
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    onFiltersChange({ ...filters, targetSkills: updated.length > 0 ? updated : undefined });
  };

  const resetFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    (filters.category && filters.category.length > 0) ||
    (filters.difficulty && filters.difficulty.length > 0) ||
    (filters.targetSkills && filters.targetSkills.length > 0) ||
    filters.minDuration !== undefined ||
    filters.maxDuration !== undefined ||
    filters.minPlayers !== undefined ||
    filters.maxPlayers !== undefined ||
    (filters.searchTerm && filters.searchTerm.length > 0);

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher un exercice..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value || undefined })}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Category filters */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Catégorie</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat.value}
                  variant={filters.category?.includes(cat.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCategory(cat.value)}
                  className={`${
                    filters.category?.includes(cat.value)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty filters */}
          <div>
            <Label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Difficulté</Label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(diff => (
                <Badge
                  key={diff.value}
                  variant="outline"
                  className={`cursor-pointer transition-all ${
                    filters.difficulty?.includes(diff.value)
                      ? diff.color + ' ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => toggleDifficulty(diff.value)}
                >
                  {diff.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Advanced filters toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Filter className="h-3 w-3 mr-2" />
              {showAdvanced ? 'Masquer filtres avancés' : 'Filtres avancés'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <X className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Duration range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Durée min (min)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.minDuration || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      minDuration: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="Ex: 10"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Durée max (min)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.maxDuration || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      maxDuration: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="Ex: 30"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Player count range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">
                    Joueurs min {availablePlayerCount && `(Disponibles: ${availablePlayerCount})`}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={filters.minPlayers || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      minPlayers: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="Ex: 6"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Joueurs max</Label>
                  <Input
                    type="number"
                    min="1"
                    value={filters.maxPlayers || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      maxPlayers: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="Ex: 12"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Target skills */}
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                  Compétences ciblées
                </Label>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge
                      key={skill.value}
                      variant="outline"
                      className={`cursor-pointer text-xs transition-all ${
                        filters.targetSkills?.includes(skill.value)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500 dark:ring-blue-600'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => toggleSkill(skill.value)}
                    >
                      {skill.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
