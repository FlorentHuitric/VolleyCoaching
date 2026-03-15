'use client';

import { useState } from 'react';
import { VerticalJumpTest } from '@/types/evaluation-tests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateVerticalJumpMetrics } from '@/services/testCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award } from 'lucide-react';

interface VerticalJumpTestFormProps {
  initialData?: Partial<VerticalJumpTest>;
  onComplete: (test: VerticalJumpTest) => void;
}

export default function VerticalJumpTestForm({
  initialData,
  onComplete
}: VerticalJumpTestFormProps) {
  const [standingReach, setStandingReach] = useState(initialData?.standingReach || 0);
  const [blockJumps, setBlockJumps] = useState<number[]>(initialData?.attempts?.blockJumps || [0, 0, 0]);
  const [approachJumps, setApproachJumps] = useState<number[]>(initialData?.attempts?.approachJumps || [0, 0, 0]);

  const bestBlockJump = Math.max(...blockJumps);
  const bestApproachJump = Math.max(...approachJumps);

  const metrics = standingReach > 0 && bestBlockJump > 0 && bestApproachJump > 0
    ? calculateVerticalJumpMetrics({
        testId: 'vertical_jump',
        category: 'physical',
        standingReach,
        blockJumpReach: bestBlockJump,
        approachJumpReach: bestApproachJump,
        blockJumpHeight: 0,
        approachJumpHeight: 0,
        attempts: { blockJumps, approachJumps }
      })
    : null;

  const handleComplete = () => {
    if (standingReach === 0 || bestBlockJump === 0 || bestApproachJump === 0) {
      toast.warning('Veuillez remplir toutes les mesures');
      return;
    }

    const test: VerticalJumpTest = {
      testId: 'vertical_jump',
      category: 'physical',
      standingReach,
      blockJumpReach: bestBlockJump,
      approachJumpReach: bestApproachJump,
      blockJumpHeight: metrics!.blockJump,
      approachJumpHeight: metrics!.approachJump,
      attempts: { blockJumps, approachJumps }
    };

    onComplete(test);
  };

  return (
    <div className="space-y-6">
      {/* Protocol Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📋 Protocole de test
          </h3>
          <ol className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <li><strong>1. Standing Reach:</strong> Joueur debout, bras levés, marquer la hauteur atteinte</li>
            <li><strong>2. Block Jump:</strong> Saut vertical stationnaire, deux mains (3 essais)</li>
            <li><strong>3. Approach Jump:</strong> Approche complète, une main dominante (3 essais)</li>
            <li><strong>4.</strong> Repos de 15-20s entre chaque essai</li>
          </ol>
        </CardContent>
      </Card>

      {/* Measurements */}
      <div className="space-y-4">
        {/* Standing Reach */}
        <div>
          <Label htmlFor="standingReach" className="text-base font-semibold mb-2 block">
            Standing Reach (cm)
          </Label>
          <Input
            id="standingReach"
            type="number"
            value={standingReach || ''}
            onChange={(e) => setStandingReach(Number(e.target.value))}
            placeholder="Ex: 245"
            className="text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Hauteur atteinte debout, bras levés (en centimètres)
          </p>
        </div>

        {/* Block Jump Attempts */}
        <div>
          <Label className="text-base font-semibold mb-2 block">
            Block Jump - 3 essais (cm)
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {blockJumps.map((jump, index) => (
              <div key={index}>
                <Label htmlFor={`blockJump${index}`} className="text-sm text-gray-600">
                  Essai {index + 1}
                </Label>
                <Input
                  id={`blockJump${index}`}
                  type="number"
                  value={jump || ''}
                  onChange={(e) => {
                    const newJumps = [...blockJumps];
                    newJumps[index] = Number(e.target.value);
                    setBlockJumps(newJumps);
                  }}
                  placeholder="Ex: 305"
                  className="mt-1"
                />
              </div>
            ))}
          </div>
          {bestBlockJump > 0 && (
            <Badge variant="outline" className="mt-2">
              Meilleur: {bestBlockJump} cm
              {standingReach > 0 && ` (${bestBlockJump - standingReach} cm de détente)`}
            </Badge>
          )}
        </div>

        {/* Approach Jump Attempts */}
        <div>
          <Label className="text-base font-semibold mb-2 block">
            Approach Jump - 3 essais (cm)
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {approachJumps.map((jump, index) => (
              <div key={index}>
                <Label htmlFor={`approachJump${index}`} className="text-sm text-gray-600">
                  Essai {index + 1}
                </Label>
                <Input
                  id={`approachJump${index}`}
                  type="number"
                  value={jump || ''}
                  onChange={(e) => {
                    const newJumps = [...approachJumps];
                    newJumps[index] = Number(e.target.value);
                    setApproachJumps(newJumps);
                  }}
                  placeholder="Ex: 325"
                  className="mt-1"
                />
              </div>
            ))}
          </div>
          {bestApproachJump > 0 && (
            <Badge variant="outline" className="mt-2">
              Meilleur: {bestApproachJump} cm
              {standingReach > 0 && ` (${bestApproachJump - standingReach} cm de détente)`}
            </Badge>
          )}
        </div>
      </div>

      {/* Results Preview */}
      {metrics && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">Résultats</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Block Jump</div>
                <div className="text-3xl font-bold text-blue-600">{metrics.blockJump} cm</div>
                <div className="text-xs text-gray-500 mt-1">Détente verticale</div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Approach Jump</div>
                <div className="text-3xl font-bold text-green-600">{metrics.approachJump} cm</div>
                <div className="text-xs text-gray-500 mt-1">Détente avec élan</div>
              </div>

              <div className="col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Note d'évaluation</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.rating >= 9 && "🏆 Elite"}
                    {metrics.rating >= 7 && metrics.rating < 9 && "⭐ Avancé"}
                    {metrics.rating >= 5 && metrics.rating < 7 && "✅ Bon"}
                    {metrics.rating < 5 && "📈 En progression"}
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-600">
                  {metrics.rating} / 10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        <TrendingUp className="h-5 w-5 mr-2" />
        Valider les résultats
      </Button>
    </div>
  );
}
