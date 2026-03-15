'use client';

import { useState } from 'react';
import { SprintTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateSprintRating } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Zap } from 'lucide-react';

interface SprintTestFormProps {
  initialData?: Partial<SprintTest>;
  onComplete: (test: SprintTest) => void;
}

export default function SprintTestForm({
  initialData,
  onComplete
}: SprintTestFormProps) {
  const [sprint10mAttempts, setSprint10mAttempts] = useState<number[]>(
    initialData?.attempts?.sprint10m || [0, 0]
  );
  const [sprint20mAttempts, setSprint20mAttempts] = useState<number[]>(
    initialData?.attempts?.sprint20m || [0, 0]
  );

  const best10m = Math.min(...sprint10mAttempts.filter(t => t > 0));
  const best20m = Math.min(...sprint20mAttempts.filter(t => t > 0));

  const rating = best20m > 0 ? calculateSprintRating({
    testId: 'sprint',
    category: 'physical',
    sprint10m: best10m,
    sprint20m: best20m,
    attempts: { sprint10m: sprint10mAttempts, sprint20m: sprint20mAttempts }
  }) : null;

  const handleComplete = () => {
    if (best10m === Infinity || best20m === Infinity) {
      toast.warning('Veuillez remplir au moins un essai pour chaque distance');
      return;
    }

    const test: SprintTest = {
      testId: 'sprint',
      category: 'physical',
      sprint10m: best10m,
      sprint20m: best20m,
      attempts: { sprint10m: sprint10mAttempts, sprint20m: sprint20mAttempts }
    };

    onComplete(test);
  };

  const getPerformanceLevel = (time: number) => {
    if (time < 3.0) return { level: '🏆 Elite', color: 'text-purple-600' };
    if (time < 3.2) return { level: '⭐ Avancé', color: 'text-blue-600' };
    if (time < 3.5) return { level: '✅ Bon', color: 'text-green-600' };
    if (time < 4.0) return { level: '📊 Moyen', color: 'text-yellow-600' };
    return { level: '📈 En progression', color: 'text-gray-600' };
  };

  return (
    <div className="space-y-6">
      {/* Protocol Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>📋 Protocole Sprint</span>
          </h3>
          <ol className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <li><strong>1. Échauffement:</strong> 5-10 minutes, incluant accélérations progressives</li>
            <li><strong>2. Position de départ:</strong> Départ arrêté, position athlétique</li>
            <li><strong>3. Sprint 10m:</strong> 2 essais, chronomètre électronique ou manuel</li>
            <li><strong>4. Sprint 20m:</strong> 2 essais, même protocole</li>
            <li><strong>5. Repos:</strong> 2-3 minutes entre chaque essai pour récupération complète</li>
            <li><strong>6. Surface:</strong> Terrain plat, non glissant (gymnase ou piste)</li>
          </ol>
        </CardContent>
      </Card>

      {/* Sprint 10m */}
      <div>
        <Label className="text-base font-semibold mb-3 block flex items-center space-x-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <span>Sprint 10 mètres - 2 essais</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {sprint10mAttempts.map((time, index) => (
            <div key={index}>
              <Label htmlFor={`sprint10m${index}`} className="text-sm text-gray-600 mb-2 block">
                Essai {index + 1} (secondes)
              </Label>
              <Input
                id={`sprint10m${index}`}
                type="number"
                step="0.01"
                value={time || ''}
                onChange={(e) => {
                  const newTimes = [...sprint10mAttempts];
                  newTimes[index] = parseFloat(e.target.value) || 0;
                  setSprint10mAttempts(newTimes);
                }}
                placeholder="Ex: 1.85"
                className="text-lg"
              />
            </div>
          ))}
        </div>
        {best10m !== Infinity && (
          <Badge variant="outline" className="mt-3">
            Meilleur temps: {best10m.toFixed(2)}s
          </Badge>
        )}
      </div>

      {/* Sprint 20m */}
      <div>
        <Label className="text-base font-semibold mb-3 block flex items-center space-x-2">
          <Zap className="h-5 w-5 text-red-600" />
          <span>Sprint 20 mètres - 2 essais</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {sprint20mAttempts.map((time, index) => (
            <div key={index}>
              <Label htmlFor={`sprint20m${index}`} className="text-sm text-gray-600 mb-2 block">
                Essai {index + 1} (secondes)
              </Label>
              <Input
                id={`sprint20m${index}`}
                type="number"
                step="0.01"
                value={time || ''}
                onChange={(e) => {
                  const newTimes = [...sprint20mAttempts];
                  newTimes[index] = parseFloat(e.target.value) || 0;
                  setSprint20mAttempts(newTimes);
                }}
                placeholder="Ex: 3.15"
                className="text-lg"
              />
            </div>
          ))}
        </div>
        {best20m !== Infinity && (
          <div className="mt-3 flex items-center space-x-3">
            <Badge variant="outline">
              Meilleur temps: {best20m.toFixed(2)}s
            </Badge>
            <Badge className={getPerformanceLevel(best20m).color}>
              {getPerformanceLevel(best20m).level}
            </Badge>
          </div>
        )}
      </div>

      {/* Results Preview */}
      {rating && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Résultats</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sprint 10m</div>
                <div className="text-3xl font-bold text-orange-600">{best10m.toFixed(2)}s</div>
                <div className="text-xs text-gray-500 mt-1">Vitesse d'accélération</div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sprint 20m</div>
                <div className="text-3xl font-bold text-red-600">{best20m.toFixed(2)}s</div>
                <div className="text-xs text-gray-500 mt-1">Vitesse maximale</div>
              </div>

              <div className="col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Note d'évaluation</div>
                  <div className="text-xs text-gray-500 mt-1">{getPerformanceLevel(best20m).level}</div>
                </div>
                <div className="text-4xl font-bold text-purple-600">
                  {rating} / 10
                </div>
              </div>
            </div>

            {/* Reference times */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                📊 Références internationales (20m):
              </p>
              <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <div>• Elite: &lt;3.0s | Avancé: 3.0-3.2s | Bon: 3.2-3.5s | Moyen: 3.5-4.0s</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        className="w-full bg-orange-600 hover:bg-orange-700"
        size="lg"
      >
        <TrendingUp className="h-5 w-5 mr-2" />
        Valider les résultats
      </Button>
    </div>
  );
}
