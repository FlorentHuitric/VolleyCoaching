'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateAttackingPowerMetrics } from '@/utils/evaluationCalculations';
import { toast } from 'sonner';
import { TrendingUp, Award, Zap, Ruler } from 'lucide-react';

/**
 * Attacking Power Test Form
 * Measures swing velocity (km/h) and contact height (cm)
 * Requires radar gun and vertical measurement equipment
 * Impacts: Technical.attacking.power, Physical.power.swingVelocity, Physical.power.attackHeight
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles attacking power measurements
 * - Open/Closed: Extensible through props, closed for modification
 * - Liskov Substitution: Can be used anywhere TestForm interface is expected
 * - Dependency Inversion: Depends on calculation utilities abstraction
 */

interface AttackingPowerTestFormProps {
  initialData?: any;
  onComplete: (data: any) => void;
}

export default function AttackingPowerTestForm({ initialData, onComplete }: AttackingPowerTestFormProps) {
  const [speeds, setSpeeds] = useState<number[]>([]);
  const [contactHeights, setContactHeights] = useState<number[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentHeight, setCurrentHeight] = useState<number>(0);

  const handleAddMeasurement = () => {
    if (currentSpeed === 0 || currentHeight === 0) {
      return toast.warning('Veuillez remplir la vitesse ET la hauteur de contact');
    }
    
    setSpeeds([...speeds, currentSpeed]);
    setContactHeights([...contactHeights, currentHeight]);
    setCurrentSpeed(0);
    setCurrentHeight(0);
  };

  const handleRemoveLast = () => {
    setSpeeds(speeds.slice(0, -1));
    setContactHeights(contactHeights.slice(0, -1));
  };

  const metrics = speeds.length > 0 ? calculateAttackingPowerMetrics({
    testId: 'attacking_power',
    category: 'physical',
    skill: 'attacking',
    speeds,
    contactHeights,
    maxSpeed: Math.max(...speeds),
    avgSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
    maxContactHeight: Math.max(...contactHeights),
    avgContactHeight: contactHeights.reduce((a, b) => a + b, 0) / contactHeights.length
  }) : null;

  const handleComplete = () => {
    if (speeds.length < 5) {
      return toast.warning('Minimum 5 attaques requises pour évaluer la puissance (8-10 recommandé)');
    }

    onComplete({
      testId: 'attacking_power',
      category: 'physical',
      skill: 'attacking',
      speeds,
      contactHeights,
      maxSpeed: metrics!.maxSpeed,
      avgSpeed: metrics!.avgSpeed,
      maxContactHeight: metrics!.maxContactHeight,
      avgContactHeight: metrics!.avgContactHeight
    });
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-4">
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>📋 Protocole: Mesure de Puissance d'Attaque</span>
          </h3>
          <div className="text-sm space-y-1 text-red-800 dark:text-red-200">
            <div><strong>Équipement:</strong> Radar gun (Stalker Sport 2, Bushnell) + Système de mesure verticale</div>
            <div><strong>Vitesse:</strong> Mesurer la vitesse de la balle après impact (km/h)</div>
            <div><strong>Hauteur:</strong> Mesurer la hauteur de contact (cm) - depuis le sol jusqu'au point d'impact</div>
            <div><strong>Protocole:</strong> 8-10 attaques maximales avec 30s de repos entre chaque</div>
            <div className="pt-2 border-t border-red-200 dark:border-red-700">
              <strong>Barème Elite:</strong> 100+ km/h vitesse | 320+ cm hauteur (hommes) | 280+ cm (femmes)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Measurement Input */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-red-600" />
            <span>Attaque #{speeds.length + 1}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm flex items-center space-x-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>Vitesse de balle (km/h)</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 85"
                value={currentSpeed || ''}
                onChange={(e) => setCurrentSpeed(parseFloat(e.target.value) || 0)}
                className="mt-1 text-lg font-bold"
              />
              <p className="text-xs text-gray-500 mt-1">
                Radar gun: Mesurer immédiatement après impact
              </p>
            </div>

            <div>
              <Label className="text-sm flex items-center space-x-2">
                <Ruler className="h-4 w-4 text-blue-500" />
                <span>Hauteur de contact (cm)</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 310"
                value={currentHeight || ''}
                onChange={(e) => setCurrentHeight(parseFloat(e.target.value) || 0)}
                className="mt-1 text-lg font-bold"
              />
              <p className="text-xs text-gray-500 mt-1">
                Du sol au point de contact (jump reach)
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddMeasurement} className="flex-1 bg-red-600 hover:bg-red-700">
              ➕ Enregistrer cette attaque
            </Button>
            {speeds.length > 0 && (
              <Button onClick={handleRemoveLast} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                ❌ Supprimer dernière
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress & Metrics */}
      {speeds.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold">Résultats de Puissance</h3>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {speeds.length} / 8-10 attaques
              </Badge>
            </div>

            {metrics && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{metrics.maxSpeed.toFixed(1)} km/h</div>
                    <div className="text-xs text-gray-500 mt-1">Vitesse MAX</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{metrics.avgSpeed.toFixed(1)} km/h</div>
                    <div className="text-xs text-gray-500 mt-1">Vitesse MOY</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{metrics.maxContactHeight.toFixed(0)} cm</div>
                    <div className="text-xs text-gray-500 mt-1">Hauteur MAX</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.powerRating}/10</div>
                    <div className="text-xs text-gray-500 mt-1">Note Puissance</div>
                  </div>
                </div>

                {/* Detailed breakdown */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm mb-2">📊 Historique des attaques</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <strong>Vitesses:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {speeds.map((speed, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {speed} km/h
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Hauteurs:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {contactHeights.map((height, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {height} cm
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs space-y-1">
              <div className="text-gray-600 dark:text-gray-400">
                <strong>Barème Vitesse:</strong> 100+ km/h = Elite (10) | 85-99 = Avancé (7-9) | 70-84 = Bon (5-6) | &lt;70 = Moyen (1-4)
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                <strong>Référence Pro:</strong> Top joueurs internationaux: 110-130 km/h | Contact height: 330-360 cm
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button 
        onClick={handleComplete} 
        disabled={speeds.length < 5}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50" 
        size="lg"
      >
        <TrendingUp className="h-5 w-5 mr-2" />
        {speeds.length < 5 
          ? `Minimum 5 attaques requises (${speeds.length}/5)` 
          : 'Valider l\'évaluation de puissance'
        }
      </Button>
    </div>
  );
}
