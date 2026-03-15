'use client';

import { useState } from 'react';
import { ServingAccuracyTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateServingMetrics } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Target } from 'lucide-react';

interface ServingAccuracyTestFormProps {
  initialData?: Partial<ServingAccuracyTest>;
  onComplete: (test: ServingAccuracyTest) => void;
}

export default function ServingAccuracyTestForm({
  initialData,
  onComplete
}: ServingAccuracyTestFormProps) {
  const [totalServes, setTotalServes] = useState(initialData?.totalServes || 20);
  const [zones, setZones] = useState(initialData?.zoneTargets || [
    { zone: 1, attempts: 0, hits: 0, aces: 0, errors: 0 },
    { zone: 2, attempts: 0, hits: 0, aces: 0, errors: 0 },
    { zone: 3, attempts: 0, hits: 0, aces: 0, errors: 0 },
    { zone: 4, attempts: 0, hits: 0, aces: 0, errors: 0 },
    { zone: 5, attempts: 0, hits: 0, aces: 0, errors: 0 },
    { zone: 6, attempts: 0, hits: 0, aces: 0, errors: 0 },
  ]);
  const [serveTypes, setServeTypes] = useState(initialData?.serveTypes || {
    float: 0, jump: 0, topspin: 0
  });

  const totalAttempts = zones.reduce((sum, z) => sum + z.attempts, 0);
  const totalHits = zones.reduce((sum, z) => sum + z.hits, 0);
  const totalAces = zones.reduce((sum, z) => sum + z.aces, 0);
  const totalErrors = zones.reduce((sum, z) => sum + z.errors, 0);

  const metrics = totalAttempts > 0 ? calculateServingMetrics({
    testId: 'serving_accuracy',
    category: 'technical',
    skill: 'serving',
    totalServes: totalAttempts,
    zoneTargets: zones as any,
    serveTypes,
    accuracy: 0,
    aceRate: 0,
    errorRate: 0,
    consistency: 0
  }) : null;

  const handleComplete = () => {
    if (totalAttempts === 0) {
      toast.warning('Veuillez enregistrer au moins un service');
      return;
    }

    onComplete({
      testId: 'serving_accuracy',
      category: 'technical',
      skill: 'serving',
      totalServes: totalAttempts,
      zoneTargets: zones as any,
      serveTypes,
      accuracy: metrics!.accuracy,
      aceRate: metrics!.aceRate,
      errorRate: metrics!.errorRate,
      consistency: metrics!.consistency
    });
  };

  const updateZone = (zoneIndex: number, field: 'attempts' | 'hits' | 'aces' | 'errors', value: number) => {
    const newZones = [...zones];
    newZones[zoneIndex] = { ...newZones[zoneIndex], [field]: value };
    setZones(newZones);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>📋 Protocole Service</span>
          </h3>
          <ol className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <li><strong>1.</strong> Diviser le terrain adverse en 6 zones (3 avant, 3 arrière)</li>
            <li><strong>2.</strong> Minimum 20 services au total</li>
            <li><strong>3.</strong> Cibler chaque zone avec au moins 3 services</li>
            <li><strong>4.</strong> Noter: tentatives, réussites (zone ciblée), aces, erreurs</li>
            <li><strong>5.</strong> Varier les types de service (float, jump, topspin)</li>
          </ol>
        </CardContent>
      </Card>

      {/* Court Zones Visual */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Zones du terrain (vue adverse)</h4>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Front row */}
            {[4, 3, 2].map((zoneNum, idx) => (
              <div key={zoneNum} className="p-3 border-2 border-orange-300 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center">
                <div className="font-bold text-orange-700 dark:text-orange-300">Zone {zoneNum}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {idx === 0 && 'Avant gauche'}
                  {idx === 1 && 'Avant centre'}
                  {idx === 2 && 'Avant droite'}
                </div>
              </div>
            ))}
            {/* Back row */}
            {[5, 6, 1].map((zoneNum, idx) => (
              <div key={zoneNum} className="p-3 border-2 border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <div className="font-bold text-blue-700 dark:text-blue-300">Zone {zoneNum}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {idx === 0 && 'Arrière gauche'}
                  {idx === 1 && 'Arrière centre'}
                  {idx === 2 && 'Arrière droite'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zone Data Entry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone, index) => (
          <Card key={zone.zone}>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center justify-between">
                <span>Zone {zone.zone}</span>
                <Badge variant="outline">{zone.attempts} services</Badge>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tentatives</Label>
                  <Input
                    type="number"
                    min="0"
                    value={zone.attempts || ''}
                    onChange={(e) => updateZone(index, 'attempts', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Réussites</Label>
                  <Input
                    type="number"
                    min="0"
                    max={zone.attempts}
                    value={zone.hits || ''}
                    onChange={(e) => updateZone(index, 'hits', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Aces</Label>
                  <Input
                    type="number"
                    min="0"
                    max={zone.attempts}
                    value={zone.aces || ''}
                    onChange={(e) => updateZone(index, 'aces', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Erreurs</Label>
                  <Input
                    type="number"
                    min="0"
                    max={zone.attempts}
                    value={zone.errors || ''}
                    onChange={(e) => updateZone(index, 'errors', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Serve Types */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Types de service utilisés</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Float</Label>
              <Input
                type="number"
                min="0"
                value={serveTypes.float || ''}
                onChange={(e) => setServeTypes({ ...serveTypes, float: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Jump</Label>
              <Input
                type="number"
                min="0"
                value={serveTypes.jump || ''}
                onChange={(e) => setServeTypes({ ...serveTypes, jump: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Topspin</Label>
              <Input
                type="number"
                min="0"
                value={serveTypes.topspin || ''}
                onChange={(e) => setServeTypes({ ...serveTypes, topspin: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {metrics && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold">Résultats</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.accuracy.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Précision</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.aceRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Aces</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.errorRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Erreurs</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.rating}/10</div>
                <div className="text-xs text-gray-500 mt-1">Note</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Total:</strong> {totalAttempts} services • {totalHits} réussites • {totalAces} aces • {totalErrors} erreurs
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleComplete} className="w-full bg-red-600 hover:bg-red-700" size="lg">
        <TrendingUp className="h-5 w-5 mr-2" />
        Valider les résultats
      </Button>
    </div>
  );
}
