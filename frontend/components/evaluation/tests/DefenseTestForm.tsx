'use client';
import { useState } from 'react';
import { DefenseTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateDefenseMetrics } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Move } from 'lucide-react';

export default function DefenseTestForm({ initialData, onComplete }: any) {
  const [digRatings, setDigRatings] = useState<(0 | 1 | 2 | 3)[]>([]);

  const metrics = digRatings.length > 0 ? calculateDefenseMetrics({
    testId: 'defense',
    category: 'technical',
    skill: 'defense',
    totalAttempts: digRatings.length,
    digRatings,
    attackTypes: { hard: [], tip: [], roll: [] },
    coverageZones: [],
    avgRating: 0,
    perfectDigRate: 0,
    errorRate: 0,
    rangeOfMotion: 0,
    anticipation: 0
  }) : null;

  const addDig = (rating: 0 | 1 | 2 | 3) => setDigRatings([...digRatings, rating]);
  const removeLast = () => setDigRatings(digRatings.slice(0, -1));

  const handleComplete = () => {
    if (digRatings.length < 10) return toast.warning('Minimum 10 défenses requises');
    onComplete({
      testId: 'defense',
      category: 'technical',
      skill: 'defense',
      totalAttempts: digRatings.length,
      digRatings,
      attackTypes: { hard: [], tip: [], roll: [] },
      coverageZones: [],
      avgRating: metrics!.avgRating,
      perfectDigRate: metrics!.perfectDigRate,
      errorRate: metrics!.errorRate,
      rangeOfMotion: metrics!.rangeOfMotion,
      anticipation: metrics!.avgRating
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating === 3) return 'bg-green-500 hover:bg-green-600';
    if (rating === 2) return 'bg-blue-500 hover:bg-blue-600';
    if (rating === 1) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Move className="h-5 w-5" /><span>📋 Protocole Défense (0-3)</span>
          </h3>
          <div className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <div><strong>3:</strong> Dig parfait, toutes options disponibles</div>
            <div><strong>2:</strong> Bon dig, 2 options</div>
            <div><strong>1:</strong> Dig jouable, 1 option</div>
            <div><strong>0:</strong> Erreur, balle non défendue</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-center text-lg">Noter la qualité de la défense</h4>
          <div className="grid grid-cols-4 gap-3">
            {[3, 2, 1, 0].map((rating) => (
              <Button key={rating} onClick={() => addDig(rating as 0 | 1 | 2 | 3)} className={`h-24 flex flex-col items-center justify-center ${getRatingColor(rating)} text-white`} size="lg">
                <div className="text-3xl font-bold mb-1">{rating}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {digRatings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Historique ({digRatings.length} digs)</h4>
              <Button onClick={removeLast} variant="outline" size="sm">Supprimer</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {digRatings.map((rating, idx) => (
                <Badge key={idx} className={`${rating === 3 ? 'bg-green-500' : rating === 2 ? 'bg-blue-500' : rating === 1 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                  {idx + 1}: {rating}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-blue-600" /><h3 className="text-lg font-semibold">Résultats</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.avgRating.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">Moyenne</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.perfectDigRate.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 mt-1">Digs parfaits</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.errorRate.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 mt-1">Erreurs</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.rating}/10</div>
                <div className="text-xs text-gray-500 mt-1">Note</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleComplete} disabled={digRatings.length < 10} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
        <TrendingUp className="h-5 w-5 mr-2" />Valider ({digRatings.length}/10 min)
      </Button>
    </div>
  );
}
