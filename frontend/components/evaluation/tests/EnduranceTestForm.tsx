'use client';

import { useState } from 'react';
import { EnduranceTest } from '@/types/evaluation-tests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Timer, Heart, Play, RotateCcw, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnduranceTestFormProps {
  onComplete: (data: Partial<EnduranceTest>) => void;
  onBack?: () => void;
}

export default function EnduranceTestForm({ onComplete, onBack }: EnduranceTestFormProps) {
  const [testType, setTestType] = useState<'beep' | 'cooper'>('beep');

  // Beep Test / Yo-Yo Test state
  const [level, setLevel] = useState<number>(1);
  const [shuttle, setShuttle] = useState<number>(1);
  const [vo2max, setVo2max] = useState<number>(0);

  // Cooper 12-minute run test state
  const [cooperDistance, setCooperDistance] = useState<number>(0);

  const [isRunning, setIsRunning] = useState(false);

  // Calculate VO2max from Beep Test level and shuttle
  const calculateVO2max = (lvl: number, sh: number) => {
    // Beep test VO2max estimation formula
    // VO2max = 31.025 + 3.238 * speed - 3.248 * age + 0.1536 * speed * age
    // Simplified version based on level reached
    const speed = 8 + (lvl - 1) * 0.5;
    const estimated = 31.025 + 3.238 * speed - 3.248 * 20 + 0.1536 * speed * 20;
    return Math.round(estimated * 10) / 10;
  };

  const handleBeepLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    const estimatedVO2 = calculateVO2max(newLevel, shuttle);
    setVo2max(estimatedVO2);
  };

  const handleShuttleChange = (newShuttle: number) => {
    setShuttle(newShuttle);
    const estimatedVO2 = calculateVO2max(level, newShuttle);
    setVo2max(estimatedVO2);
  };

  const handleCooperDistanceChange = (distance: number) => {
    setCooperDistance(distance);
    // Cooper Test VO2max formula: VO2max = (distance - 504.9) / 44.73
    if (distance > 0) {
      const estimated = (distance - 504.9) / 44.73;
      setVo2max(Math.round(estimated * 10) / 10);
    }
  };

  const handleReset = () => {
    setLevel(1);
    setShuttle(1);
    setVo2max(0);
    setCooperDistance(0);
    setIsRunning(false);
  };

  const handleComplete = () => {
    const testData: Partial<EnduranceTest> = {
      testId: 'endurance',
      category: 'physical',
    };

    if (testType === 'beep') {
      testData.level = level;
      testData.shuttle = shuttle;
      testData.vo2max = vo2max;
    } else {
      testData.cooper12MinDistance = cooperDistance;
      testData.vo2max = vo2max;
    }

    onComplete(testData);
  };

  const getVO2maxRating = (vo2: number): { label: string; color: string } => {
    if (vo2 >= 55) return { label: 'Excellent', color: 'text-green-600' };
    if (vo2 >= 50) return { label: 'Très Bon', color: 'text-blue-600' };
    if (vo2 >= 45) return { label: 'Bon', color: 'text-yellow-600' };
    if (vo2 >= 40) return { label: 'Moyen', color: 'text-orange-600' };
    return { label: 'Faible', color: 'text-red-600' };
  };

  const getBeepLevelRating = (lvl: number): { label: string; color: string } => {
    if (lvl >= 12) return { label: 'Élite', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
    if (lvl >= 10) return { label: 'Excellent', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (lvl >= 8) return { label: 'Bon', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    if (lvl >= 6) return { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { label: 'Faible', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-600" />
            <span>Test d'Endurance Cardio-Respiratoire</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Évaluez la capacité aérobie et l'endurance du joueur avec le Beep Test ou le Test de Cooper
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Type Selection */}
          <Tabs value={testType} onValueChange={(v) => setTestType(v as 'beep' | 'cooper')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="beep">Beep Test / Yo-Yo</TabsTrigger>
              <TabsTrigger value="cooper">Test de Cooper</TabsTrigger>
            </TabsList>

            {/* BEEP TEST */}
            <TabsContent value="beep" className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
                    <p className="font-semibold">Protocole Beep Test (20m Shuttle Run):</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Distance: 20 mètres entre deux lignes</li>
                      <li>Départ au signal sonore, toucher la ligne avant le prochain bip</li>
                      <li>La vitesse augmente tous les niveaux (1 minute)</li>
                      <li>Test terminé quand le joueur ne peut plus suivre le rythme</li>
                      <li>Noter le dernier niveau et navette complétés</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Level Input */}
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-base font-semibold">
                    Niveau Atteint
                  </Label>
                  <Input
                    id="level"
                    type="number"
                    min={1}
                    max={21}
                    value={level || ''}
                    onChange={(e) => handleBeepLevelChange(Number(e.target.value))}
                    className="text-lg h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Niveaux: 1-21 (élite = 12+)
                  </p>
                </div>

                {/* Shuttle Input */}
                <div className="space-y-2">
                  <Label htmlFor="shuttle" className="text-base font-semibold">
                    Navette
                  </Label>
                  <Input
                    id="shuttle"
                    type="number"
                    min={1}
                    max={15}
                    value={shuttle || ''}
                    onChange={(e) => handleShuttleChange(Number(e.target.value))}
                    className="text-lg h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre de navettes dans le niveau
                  </p>
                </div>
              </div>

              {/* Level Rating Badge */}
              {level > 0 && (
                <div className="flex items-center justify-center">
                  <Badge className={`text-lg px-6 py-2 ${getBeepLevelRating(level).color}`}>
                    {getBeepLevelRating(level).label}
                  </Badge>
                </div>
              )}

              {/* VO2max Display */}
              {vo2max > 0 && (
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        VO₂max Estimé
                      </p>
                      <div className={`text-5xl font-bold ${getVO2maxRating(vo2max).color}`}>
                        {vo2max}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ml/kg/min</p>
                      <Badge variant="outline" className="text-base mt-2">
                        {getVO2maxRating(vo2max).label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Level Buttons */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Accès Rapide</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 7, 9, 11, 13, 15, 17, 19].map((lvl) => (
                    <Button
                      key={lvl}
                      variant="outline"
                      onClick={() => handleBeepLevelChange(lvl)}
                      className="h-10"
                    >
                      Niv. {lvl}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* COOPER TEST */}
            <TabsContent value="cooper" className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-900 dark:text-green-100 space-y-2">
                    <p className="font-semibold">Protocole Test de Cooper (12 minutes):</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Courir la plus grande distance possible en 12 minutes</li>
                      <li>Peut être fait sur piste (400m) ou terrain</li>
                      <li>Le joueur peut varier son allure mais doit maintenir un effort soutenu</li>
                      <li>Mesurer la distance totale parcourue en mètres</li>
                      <li>Excellent: 2800m+ (hommes), 2400m+ (femmes)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance" className="text-base font-semibold">
                  Distance Parcourue (mètres)
                </Label>
                <Input
                  id="distance"
                  type="number"
                  min={0}
                  max={5000}
                  step={10}
                  value={cooperDistance || ''}
                  onChange={(e) => handleCooperDistanceChange(Number(e.target.value))}
                  className="text-lg h-14"
                  placeholder="Ex: 2750"
                />
                <p className="text-xs text-muted-foreground">
                  Distance en mètres (ex: 2750m)
                </p>
              </div>

              {/* VO2max Display */}
              {vo2max > 0 && (
                <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        VO₂max Estimé
                      </p>
                      <div className={`text-5xl font-bold ${getVO2maxRating(vo2max).color}`}>
                        {vo2max}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ml/kg/min</p>
                      <Badge variant="outline" className="text-base mt-2">
                        {getVO2maxRating(vo2max).label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Distance Benchmarks */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Repères de Performance</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCooperDistanceChange(2400)}
                    className="h-auto py-2 flex flex-col items-center"
                  >
                    <span className="font-bold">2400m</span>
                    <span className="text-xs text-muted-foreground">Bon (Femmes)</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCooperDistanceChange(2800)}
                    className="h-auto py-2 flex flex-col items-center"
                  >
                    <span className="font-bold">2800m</span>
                    <span className="text-xs text-muted-foreground">Excellent (Hommes)</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCooperDistanceChange(2200)}
                    className="h-auto py-2 flex flex-col items-center"
                  >
                    <span className="font-bold">2200m</span>
                    <span className="text-xs text-muted-foreground">Moyen</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCooperDistanceChange(3000)}
                    className="h-auto py-2 flex flex-col items-center"
                  >
                    <span className="font-bold">3000m</span>
                    <span className="text-xs text-muted-foreground">Élite</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Réinitialiser</span>
            </Button>

            <div className="flex space-x-2">
              {onBack && (
                <Button variant="ghost" onClick={onBack}>
                  Précédent
                </Button>
              )}
              <Button
                onClick={handleComplete}
                disabled={
                  testType === 'beep'
                    ? level === 0 || shuttle === 0
                    : cooperDistance === 0
                }
                className="flex items-center space-x-2"
              >
                <Timer className="h-4 w-4" />
                <span>Terminer le Test</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tableaux de Référence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Beep Test - Niveaux de Performance (Volleyball)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border">
                <span className="font-medium">Élite:</span> Niveau 12+
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                <span className="font-medium">Excellent:</span> Niveau 10-11
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                <span className="font-medium">Bon:</span> Niveau 8-9
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
                <span className="font-medium">Moyen:</span> Niveau 6-7
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">VO₂max - Normes (ml/kg/min)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border">
                <span className="font-medium">Élite:</span> &gt;55
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                <span className="font-medium">Très Bon:</span> 50-55
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                <span className="font-medium">Bon:</span> 45-50
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
                <span className="font-medium">Moyen:</span> 40-45
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
