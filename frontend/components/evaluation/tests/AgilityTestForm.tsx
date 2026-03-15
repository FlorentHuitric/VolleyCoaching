'use client';

import { useState } from 'react';
import { AgilityTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateAgilityRating } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Shuffle } from 'lucide-react';

interface AgilityTestFormProps {
  initialData?: Partial<AgilityTest>;
  onComplete: (test: AgilityTest) => void;
}

export default function AgilityTestForm({
  initialData,
  onComplete
}: AgilityTestFormProps) {
  const [attempts, setAttempts] = useState<number[]>(
    initialData?.attempts || [0, 0]
  );

  const bestTime = Math.min(...attempts.filter(t => t > 0));
  const rating = bestTime !== Infinity ? calculateAgilityRating({
    testId: 'agility',
    category: 'physical',
    tTestTime: bestTime,
    attempts
  }) : null;

  const handleComplete = () => {
    if (bestTime === Infinity) {
      toast.warning('Veuillez remplir au moins un essai');
      return;
    }

    onComplete({
      testId: 'agility',
      category: 'physical',
      tTestTime: bestTime,
      attempts
    });
  };

  const getPerformanceLevel = (time: number) => {
    if (time < 9.0) return { level: '🏆 Elite', color: 'text-purple-600' };
    if (time < 9.6) return { level: '⭐ Avancé', color: 'text-blue-600' };
    if (time < 10.5) return { level: '✅ Bon', color: 'text-green-600' };
    if (time < 11.5) return { level: '📊 Moyen', color: 'text-yellow-600' };
    return { level: '📈 En progression', color: 'text-gray-600' };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Shuffle className="h-5 w-5" />
            <span>📋 Protocole T-Test</span>
          </h3>
          <ol className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <li><strong>Disposition:</strong> 4 cônes en forme de T (10m devant, 5m de chaque côté)</li>
            <li><strong>1.</strong> Sprint 10m vers l'avant jusqu'au cône central</li>
            <li><strong>2.</strong> Déplacement latéral 5m vers la gauche, toucher le cône</li>
            <li><strong>3.</strong> Déplacement latéral 10m vers la droite, toucher le cône</li>
            <li><strong>4.</strong> Déplacement latéral 5m vers le centre</li>
            <li><strong>5.</strong> Course arrière 10m jusqu'à la ligne de départ</li>
            <li><strong>Repos:</strong> 2-3 minutes entre les essais</li>
          </ol>
        </CardContent>
      </Card>

      <div>
        <Label className="text-base font-semibold mb-3 block flex items-center space-x-2">
          <Shuffle className="h-5 w-5 text-purple-600" />
          <span>T-Test - 2 essais (secondes)</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {attempts.map((time, index) => (
            <div key={index}>
              <Label htmlFor={`attempt${index}`} className="text-sm text-gray-600 mb-2 block">
                Essai {index + 1}
              </Label>
              <Input
                id={`attempt${index}`}
                type="number"
                step="0.1"
                value={time || ''}
                onChange={(e) => {
                  const newAttempts = [...attempts];
                  newAttempts[index] = parseFloat(e.target.value) || 0;
                  setAttempts(newAttempts);
                }}
                placeholder="Ex: 9.5"
                className="text-lg"
              />
            </div>
          ))}
        </div>
        {bestTime !== Infinity && (
          <div className="mt-3 flex items-center space-x-3">
            <Badge variant="outline">Meilleur: {bestTime.toFixed(2)}s</Badge>
            <Badge className={getPerformanceLevel(bestTime).color}>
              {getPerformanceLevel(bestTime).level}
            </Badge>
          </div>
        )}
      </div>

      {rating && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Résultats</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Temps T-Test</div>
                <div className="text-3xl font-bold text-purple-600">{bestTime.toFixed(2)}s</div>
                <div className="text-xs text-gray-500 mt-1">Agilité multidirectionnelle</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Note</div>
                  <div className="text-4xl font-bold text-blue-600">{rating} / 10</div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
              📊 Elite: &lt;9.0s | Avancé: 9.0-9.6s | Bon: 9.6-10.5s | Moyen: 10.5-11.5s
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleComplete} className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
        <TrendingUp className="h-5 w-5 mr-2" />
        Valider les résultats
      </Button>
    </div>
  );
}
