'use client';

import { useState } from 'react';
import { PassingTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculatePassingMetrics } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, ArrowUpCircle } from 'lucide-react';

interface PassingTestFormProps {
  initialData?: Partial<PassingTest>;
  onComplete: (test: PassingTest) => void;
}

export default function PassingTestForm({
  initialData,
  onComplete
}: PassingTestFormProps) {
  const [passRatings, setPassRatings] = useState<(0 | 1 | 2 | 3)[]>(
    initialData?.passRatings || []
  );
  const [currentPass, setCurrentPass] = useState<0 | 1 | 2 | 3 | null>(null);

  const metrics = passRatings.length > 0 ? calculatePassingMetrics({
    testId: 'passing',
    category: 'technical',
    skill: 'passing',
    totalPasses: passRatings.length,
    passRatings,
    passTypes: { floatServe: [], jumpServe: [], topspin: [] },
    avgRating: 0,
    perfectPassRate: 0,
    errorRate: 0,
    efficiency: 0
  }) : null;

  const addPass = (rating: 0 | 1 | 2 | 3) => {
    setPassRatings([...passRatings, rating]);
    setCurrentPass(null);
  };

  const removeLast = () => {
    setPassRatings(passRatings.slice(0, -1));
  };

  const handleComplete = () => {
    if (passRatings.length < 10) {
      toast.warning('Minimum 10 passes requises pour une évaluation fiable');
      return;
    }

    onComplete({
      testId: 'passing',
      category: 'technical',
      skill: 'passing',
      totalPasses: passRatings.length,
      passRatings,
      passTypes: { floatServe: [], jumpServe: [], topspin: [] },
      avgRating: metrics!.avgRating,
      perfectPassRate: metrics!.perfectPassRate,
      errorRate: metrics!.errorRate,
      efficiency: metrics!.efficiency
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating === 3) return 'bg-green-500 hover:bg-green-600';
    if (rating === 2) return 'bg-blue-500 hover:bg-blue-600';
    if (rating === 1) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 3) return '✨ Perfect';
    if (rating === 2) return '👍 Good';
    if (rating === 1) return '⚠️ Playable';
    return '❌ Error';
  };

  const getPerformanceLevel = (avgRating: number) => {
    if (avgRating >= 2.3) return { level: '🏆 Elite', color: 'text-purple-600' };
    if (avgRating >= 2.0) return { level: '⭐ Excellent', color: 'text-blue-600' };
    if (avgRating >= 1.7) return { level: '✅ Bon', color: 'text-green-600' };
    if (avgRating >= 1.3) return { level: '📊 Moyen', color: 'text-yellow-600' };
    return { level: '📈 En progression', color: 'text-gray-600' };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <ArrowUpCircle className="h-5 w-5" />
            <span>📋 Protocole Passe (Échelle FIVB 0-3)</span>
          </h3>
          <div className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
            <div><strong>3 = Perfect:</strong> Passe parfaite, toutes les options pour le passeur</div>
            <div><strong>2 = Good:</strong> Bonne passe, le passeur a 2 options (avant/arrière)</div>
            <div><strong>1 = Playable:</strong> Passe jouable, le passeur a 1 seule option</div>
            <div><strong>0 = Error:</strong> Passe injouable, erreur directe</div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
              <strong>Objectif:</strong> Moyenne ≥ 2.0 pour une bonne performance • 20-30 passes recommandées
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Buttons */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-center text-lg">Noter la qualité de la passe</h4>
          <div className="grid grid-cols-4 gap-3">
            {[3, 2, 1, 0].map((rating) => (
              <Button
                key={rating}
                onClick={() => addPass(rating as 0 | 1 | 2 | 3)}
                className={`h-24 flex flex-col items-center justify-center ${getRatingColor(rating)} text-white`}
                size="lg"
              >
                <div className="text-3xl font-bold mb-1">{rating}</div>
                <div className="text-xs">{getRatingLabel(rating)}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pass History */}
      {passRatings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Historique ({passRatings.length} passes)</h4>
              <Button onClick={removeLast} variant="outline" size="sm">
                Supprimer dernière
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {passRatings.map((rating, index) => (
                <Badge
                  key={index}
                  className={`${
                    rating === 3 ? 'bg-green-500' :
                    rating === 2 ? 'bg-blue-500' :
                    rating === 1 ? 'bg-yellow-500' :
                    'bg-red-500'
                  } text-white`}
                >
                  {index + 1}: {rating}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {metrics && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">Résultats</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.avgRating.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">Moyenne</div>
                <div className={`text-xs mt-1 font-medium ${getPerformanceLevel(metrics.avgRating).color}`}>
                  {getPerformanceLevel(metrics.avgRating).level}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.perfectPassRate.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 mt-1">Passes parfaites</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">{metrics.errorRate.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 mt-1">Erreurs</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{metrics.rating}/10</div>
                <div className="text-xs text-gray-500 mt-1">Note finale</div>
              </div>
            </div>

            {/* Distribution */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[3, 2, 1, 0].map(rating => {
                const count = passRatings.filter(r => r === rating).length;
                const percentage = (count / passRatings.length) * 100;
                return (
                  <div key={rating} className="p-2 bg-white dark:bg-gray-800 rounded text-center">
                    <div className="text-sm font-semibold">{rating}</div>
                    <div className="text-xs text-gray-500">{count} ({percentage.toFixed(0)}%)</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
              📊 Référence: Elite ≥2.3 | Excellent ≥2.0 | Bon ≥1.7 | Moyen ≥1.3
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleComplete}
        disabled={passRatings.length < 10}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        <TrendingUp className="h-5 w-5 mr-2" />
        Valider les résultats {passRatings.length < 10 && `(${passRatings.length}/10 min)`}
      </Button>
    </div>
  );
}
