'use client';
import { useState } from 'react';
import { AttackingTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateAttackingMetrics } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Swords } from 'lucide-react';

export default function AttackingTestForm({ initialData, onComplete }: any) {
  const [kills, setKills] = useState(0);
  const [errors, setErrors] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [inPlay, setInPlay] = useState(0);

  const totalAttacks = kills + errors + blocked + inPlay;
  const metrics = totalAttacks > 0 ? calculateAttackingMetrics({
    testId: 'attacking',
    category: 'technical',
    skill: 'attacking',
    totalAttacks,
    kills,
    errors,
    blocked,
    inPlay,
    zoneAccuracy: [],
    attackTypes: { hard: 0, tip: 0, roll: 0, tooling: 0 },
    line: 0,
    angle: 0,
    middle: 0,
    killRate: 0,
    errorRate: 0,
    efficiency: 0,
    accuracy: 0
  }) : null;

  const handleComplete = () => {
    if (totalAttacks === 0) return toast.warning('Veuillez enregistrer au moins une attaque');
    onComplete({
      testId: 'attacking',
      category: 'technical',
      skill: 'attacking',
      totalAttacks,
      kills,
      errors,
      blocked,
      inPlay,
      zoneAccuracy: [],
      attackTypes: { hard: 0, tip: 0, roll: 0, tooling: 0 },
      line: 0,
      angle: 0,
      middle: 0,
      killRate: metrics!.killRate,
      errorRate: metrics!.errorRate,
      efficiency: metrics!.efficiency,
      accuracy: metrics!.accuracy
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <Swords className="h-5 w-5" /><span>📋 Protocole Attaque</span>
          </h3>
          <div className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <div><strong>Kill:</strong> Point marqué directement</div>
            <div><strong>Error:</strong> Faute (out, filet, ligne)</div>
            <div><strong>Blocked:</strong> Bloqué par adversaire</div>
            <div><strong>In Play:</strong> Défendu mais balle en jeu</div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
              <strong>Efficacité = (Kills - Errors) / Total</strong> • Target: ≥30%
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <Label>✅ Kills</Label>
            <Input type="number" min="0" value={kills || ''} onChange={(e) => setKills(parseInt(e.target.value) || 0)} className="mt-2 text-lg font-bold" />
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <Label>❌ Errors</Label>
            <Input type="number" min="0" value={errors || ''} onChange={(e) => setErrors(parseInt(e.target.value) || 0)} className="mt-2 text-lg font-bold" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <Label>🚫 Blocked</Label>
            <Input type="number" min="0" value={blocked || ''} onChange={(e) => setBlocked(parseInt(e.target.value) || 0)} className="mt-2 text-lg font-bold" />
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <Label>🔄 In Play</Label>
            <Input type="number" min="0" value={inPlay || ''} onChange={(e) => setInPlay(parseInt(e.target.value) || 0)} className="mt-2 text-lg font-bold" />
          </CardContent>
        </Card>
      </div>

      {metrics && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-red-600" /><h3 className="text-lg font-semibold">Résultats</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.killRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Kill Rate</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.errorRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Error Rate</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.efficiency.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Efficacité</div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.rating}/10</div>
                <div className="text-xs text-gray-500 mt-1">Note</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
              Total: {totalAttacks} attaques • {kills} kills • {errors} erreurs • {blocked} bloquées • {inPlay} défendues
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleComplete} className="w-full bg-red-600 hover:bg-red-700" size="lg">
        <TrendingUp className="h-5 w-5 mr-2" />Valider les résultats
      </Button>
    </div>
  );
}
