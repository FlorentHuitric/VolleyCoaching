'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateSettingConsistencyMetrics } from '@/utils/evaluationCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Hand, Target, Clock } from 'lucide-react';

/**
 * Setting Consistency Test Form
 * Evaluates setter's ability to deliver consistent sets over 30-50 repetitions
 * Measures: height variance, distance variance, tempo control
 * Impacts: Technical.setting.consistency, Technical.setting.tempo, Technical.setting.precision
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles setting consistency data collection
 * - Open/Closed: Extensible through props, closed for modification
 * - Dependency Inversion: Depends on calculation utilities abstraction
 */

interface SetData {
  height: number; // cm from net
  distance: number; // cm from sideline
  timing: number; // seconds from pass
  zone: 2 | 3 | 4 | 1; // Target zones (2=left, 3=middle, 4=right, 1=back)
}

interface SettingConsistencyTestFormProps {
  initialData?: any;
  onComplete: (data: any) => void;
}

export default function SettingConsistencyTestForm({ initialData, onComplete }: SettingConsistencyTestFormProps) {
  const [sets, setSets] = useState<SetData[]>([]);
  const [currentSet, setCurrentSet] = useState<SetData>({
    height: 0,
    distance: 0,
    timing: 0,
    zone: 2
  });

  const handleAddSet = () => {
    if (currentSet.height === 0 || currentSet.distance === 0 || currentSet.timing === 0) {
      return toast.warning('Veuillez remplir tous les champs (hauteur, distance, timing)');
    }
    
    setSets([...sets, currentSet]);
    setCurrentSet({ height: 0, distance: 0, timing: 0, zone: 2 });
  };

  const handleRemoveLastSet = () => {
    setSets(sets.slice(0, -1));
  };

  const metrics = sets.length > 0 ? calculateSettingConsistencyMetrics({
    testId: 'setting_consistency',
    category: 'technical',
    skill: 'setting',
    sets
  }) : null;

  const handleComplete = () => {
    if (sets.length < 20) {
      return toast.warning('Minimum 20 passes requises pour évaluer la consistance (30-50 recommandé)');
    }

    onComplete({
      testId: 'setting_consistency',
      category: 'technical',
      skill: 'setting',
      sets,
      heightVariance: metrics!.heightVariance,
      distanceVariance: metrics!.distanceVariance,
      avgTiming: sets.reduce((sum, s) => sum + s.timing, 0) / sets.length,
      consistency: metrics!.consistency
    });
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Hand className="h-5 w-5" />
            <span>📋 Protocole: Évaluation de Consistance</span>
          </h3>
          <div className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <div><strong>Objectif:</strong> Mesurer la capacité à reproduire la même passe 30-50 fois</div>
            <div><strong>Hauteur:</strong> Distance verticale du filet (cm) - Idéal: faible variance (&lt;10cm = Elite)</div>
            <div><strong>Distance:</strong> Distance de la ligne latérale (cm) - Précision horizontale</div>
            <div><strong>Timing:</strong> Temps entre réception et passe (secondes) - Idéal: 0.3-0.6s</div>
            <div><strong>Zones:</strong> 2=Gauche (Outside), 3=Centre (Middle), 4=Droite (Opposite), 1=Arrière</div>
          </div>
        </CardContent>
      </Card>

      {/* Current Set Input */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Passe #{sets.length + 1}</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">Hauteur (cm)</Label>
              <Input
                type="number"
                min="0"
                step="5"
                placeholder="Ex: 50"
                value={currentSet.height || ''}
                onChange={(e) => setCurrentSet({ ...currentSet, height: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Distance (cm)</Label>
              <Input
                type="number"
                min="0"
                step="5"
                placeholder="Ex: 80"
                value={currentSet.distance || ''}
                onChange={(e) => setCurrentSet({ ...currentSet, distance: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Timing (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="Ex: 0.5"
                value={currentSet.timing || ''}
                onChange={(e) => setCurrentSet({ ...currentSet, timing: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Zone Cible</Label>
              <select
                value={currentSet.zone}
                onChange={(e) => setCurrentSet({ ...currentSet, zone: parseInt(e.target.value) as 2 | 3 | 4 | 1 })}
                className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value={2}>Zone 2 (Outside)</option>
                <option value={3}>Zone 3 (Middle)</option>
                <option value={4}>Zone 4 (Opposite)</option>
                <option value={1}>Zone 1 (Back)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddSet} className="flex-1 bg-green-600 hover:bg-green-700">
              ➕ Ajouter la passe
            </Button>
            {sets.length > 0 && (
              <Button onClick={handleRemoveLastSet} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                ❌ Supprimer dernière
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress & Metrics */}
      {sets.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold">Progression</h3>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {sets.length} / 30-50 passes
              </Badge>
            </div>

            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics.heightVariance.toFixed(1)} cm</div>
                  <div className="text-xs text-gray-500 mt-1">Variance Hauteur</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.distanceVariance.toFixed(1)} cm</div>
                  <div className="text-xs text-gray-500 mt-1">Variance Distance</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.consistency.toFixed(0)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Consistance</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{metrics.rating}/10</div>
                  <div className="text-xs text-gray-500 mt-1">Note Globale</div>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Tempo moyen: {(sets.reduce((sum, s) => sum + s.timing, 0) / sets.length).toFixed(2)}s</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <strong>Barème:</strong> Variance &lt;10cm = Elite | 10-20cm = Avancé | 20-30cm = Bon | &gt;30cm = Moyen
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button 
        onClick={handleComplete} 
        disabled={sets.length < 20}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50" 
        size="lg"
      >
        <TrendingUp className="h-5 w-5 mr-2" />
        {sets.length < 20 
          ? `Minimum 20 passes requises (${sets.length}/20)` 
          : 'Valider l\'évaluation'
        }
      </Button>
    </div>
  );
}
