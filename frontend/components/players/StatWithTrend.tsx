'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatWithTrendProps {
  label: string;
  currentValue: number | string;
  previousValue?: number;
  showTrend?: boolean;
}

export function StatWithTrend({
  label,
  currentValue,
  previousValue,
  showTrend = true
}: StatWithTrendProps) {
  // Calculate delta
  const current = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue as string);
  const delta = previousValue !== undefined ? current - previousValue : 0;
  const isImprovement = delta > 0;
  const isDecline = delta < 0;
  const isStable = delta === 0;

  const TrendIcon = isImprovement ? ArrowUp : isDecline ? ArrowDown : Minus;
  const trendColor = isImprovement
    ? 'text-green-600 dark:text-green-400'
    : isDecline
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-400 dark:text-gray-500';

  const displayValue = typeof currentValue === 'number'
    ? currentValue.toFixed(1)
    : currentValue;

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {displayValue}
          </span>
          {showTrend && previousValue !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex items-center ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-semibold">
                      {isImprovement && `+${delta.toFixed(1)} depuis dernière évaluation`}
                      {isDecline && `${delta.toFixed(1)} depuis dernière évaluation`}
                      {isStable && 'Aucun changement'}
                    </p>
                    <p className="text-gray-400">
                      Avant: {previousValue.toFixed(1)}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
