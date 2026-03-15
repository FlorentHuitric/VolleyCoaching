'use client';
import { useState } from 'react';
import { BlockingTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { calculateBlockingMetrics } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Shield } from 'lucide-react';

export default function BlockingTestForm({ initialData, onComplete }: any) {
  const [stuff, setStuff] = useState(0);
  const [touch, setTouch] = useState(0);
  const [noTouch, setNoTouch] = useState(0);
  const [avgTiming, setAvgTiming] = useState(3);
  const [avgHand, setAvgHand] = useState(3);
  const [avgPenetration, setAvgPenetration] = useState(3);

  const totalAttempts = stuff + touch + noTouch;

  const metrics = totalAttempts > 0 ? calculateBlockingMetrics({
    testId: 'blocking',
    category: 'technical',
    skill: 'blocking',
    totalAttempts,
    stuff,
    touch,
    noTouch,
    solo: 0,
    double: 0,
    triple: 0,
    timingRatings: Array(totalAttempts).fill(avgTiming) as any,
    handPositionRatings: Array(totalAttempts).fill(avgHand) as any,
    penetrationRatings: Array(totalAttempts).fill(avgPenetration) as any,
    stuffRate: 0,
    touchRate: 0,
    avgTiming: 0,
    avgHandPosition: 0,
    avgPenetration: 0,
    efficiency: 0
  }) : null;

  const handleComplete = () => {
    if (totalAttempts === 0) return toast.warning('Veuillez enregistrer au moins un block');
    onComplete({
      testId: 'blocking',
      category: 'technical',
      skill: 'blocking',
      totalAttempts,
      stuff,
      touch,
      noTouch,
      solo: 0,
      double: 0,
      triple: 0,
      timingRatings: Array(totalAttempts).fill(avgTiming),
      handPositionRatings: Array(totalAttempts).fill(avgHand),
      penetrationRatings: Array(totalAttempts).fill(avgPenetration),
      stuffRate: metrics!.stuffRate,
      touchRate: metrics!.touchRate,
      avgTiming: metrics!.avgTiming,
      avgHandPosition: metrics!.avgHandPosition,
      avgPenetration: metrics!.avgPenetration,
      efficiency: metrics!.efficiency
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Shield className="h-5 w-5" /><span>📋 Protocole Block</span>
          </h3>
          <div className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <div><strong>Stuff:</strong> Block gagnant (point direct)</div>
            <div><strong>Touch:</strong> Touché mais pas arrêté</div>
            <div><strong>No Touch:</strong> Aucun contact</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <Label>🔥 Stuff</Label>
            <Input type="number" min="0" value={stuff || ''} onChange={(e) => setStuff(parseInt(e.target.value) || 0)} className="mt-2 text-lg font-bold" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <Label>✋ Touch</Label>
            <Input type="number" min="0" value={touch || ''} onChange={(e) => setTouch(parseInt(e.target.value) || 0)} className="mt-2 text-lg font-bold" />
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-4">
            <Label>❌ No Touch</Label>
            <Input type="number" min="0" value={noTouch || ''} onChange={(e) => setNoTouch(parseInt(e.target.value) || 0)} className="mt-2 text-lg font-bold" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Évaluation qualitative (1-5)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Timing moyen</Label>
              <Input type="number" min="1" max="5" value={avgTiming} onChange={(e) => setAvgTiming(parseInt(e.target.value) || 3)} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Position mains</Label>
              <Input type="number" min="1" max="5" value={avgHand} onChange={(e) => setAvgHand(parseInt(e.target.value) || 3)} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Pénétration</Label>
              <Input type="number" min="1" max="5" value={avgPenetration} onChange={(e) => setAvgPenetration(parseInt(e.target.value) || 3)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {metrics && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-blue-600" /><h3 className="text-lg font-semibold">Résultats</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.stuffRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Stuff Rate</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.touchRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Touch Rate</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.rating}/10</div>
                <div className="text-xs text-gray-500 mt-1">Note</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleComplete} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
        <TrendingUp className="h-5 w-5 mr-2" />Valider les résultats
      </Button>
    </div>
  );
}
