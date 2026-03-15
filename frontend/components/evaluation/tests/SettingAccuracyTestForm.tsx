'use client';
import { useState } from 'react';
import { SettingAccuracyTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateSettingMetrics } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Hand } from 'lucide-react';

export default function SettingAccuracyTestForm({ initialData, onComplete }: any) {
  const [totalSets, setTotalSets] = useState(20);
  const [grades, setGrades] = useState({ good: 0, tooFarOff: 0, tooFarIn: 0, tooWide: 0, tooTight: 0, error: 0 });
  
  const total = Object.values(grades).reduce((a, b) => a + b, 0);
  const metrics = total > 0 ? calculateSettingMetrics({
    testId: 'setting_accuracy',
    category: 'technical',
    skill: 'setting',
    totalSets: total,
    zoneAccuracy: [],
    setTypes: { high: 0, quick: 0, slide: 0, back: 0 },
    grades,
    accuracy: 0,
    consistency: 0,
    efficiency: 0
  }) : null;

  const handleComplete = () => {
    if (total === 0) return toast.warning('Veuillez noter au moins une passe');
    onComplete({
      testId: 'setting_accuracy',
      category: 'technical',
      skill: 'setting',
      totalSets: total,
      zoneAccuracy: [],
      setTypes: { high: 0, quick: 0, slide: 0, back: 0 },
      grades,
      accuracy: metrics!.accuracy,
      consistency: metrics!.consistency,
      efficiency: metrics!.efficiency
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Hand className="h-5 w-5" /><span>📋 Système Joe Trinsey (Grading)</span>
          </h3>
          <div className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <div><strong>E# (Good):</strong> Passe parfaite, attaque complète possible</div>
            <div><strong>E+ (Too Far Off):</strong> Trop loin du filet</div>
            <div><strong>E! (Too Far In):</strong> Trop près du filet</div>
            <div><strong>E- (Too Wide):</strong> Trop large (vers extérieur)</div>
            <div><strong>E/ (Too Tight):</strong> Trop serré (vers intérieur)</div>
            <div><strong>E= (Error):</strong> Passe injouable, erreur</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { key: 'good', label: 'E# Good', color: 'bg-green-100' },
          { key: 'tooFarOff', label: 'E+ Too Far Off', color: 'bg-blue-100' },
          { key: 'tooFarIn', label: 'E! Too Far In', color: 'bg-orange-100' },
          { key: 'tooWide', label: 'E- Too Wide', color: 'bg-yellow-100' },
          { key: 'tooTight', label: 'E/ Too Tight', color: 'bg-purple-100' },
          { key: 'error', label: 'E= Error', color: 'bg-red-100' }
        ].map(({ key, label, color }) => (
          <Card key={key} className={color}>
            <CardContent className="p-4">
              <Label className="text-sm font-medium">{label}</Label>
              <Input
                type="number"
                min="0"
                value={(grades as any)[key] || ''}
                onChange={(e) => setGrades({ ...grades, [key]: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-purple-600" /><h3 className="text-lg font-semibold">Résultats</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.accuracy.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Précision</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.consistency.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Consistance</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.rating}/10</div>
                <div className="text-xs text-gray-500 mt-1">Note</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleComplete} className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
        <TrendingUp className="h-5 w-5 mr-2" />Valider les résultats
      </Button>
    </div>
  );
}
