'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StatChangeArrowProps {
  oldValue: number;
  newValue: number;
  label?: string;
  className?: string;
  showValue?: boolean;
}

export function StatChangeArrow({
  oldValue,
  newValue,
  label = 'Stat',
  className,
  showValue = true
}: StatChangeArrowProps) {
  const change = newValue - oldValue;
  const changeFormatted = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

  // Determine trend
  const trend = Math.abs(change) < 0.1 ? 'neutral' : change > 0 ? 'up' : 'down';

  // Icon and color based on trend
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const colorClass = trend === 'up'
    ? 'text-green-500'
    : trend === 'down'
    ? 'text-red-500'
    : 'text-gray-400';

  // Don't show arrow if no significant change
  if (Math.abs(change) < 0.1) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-1', className)}>
            <Icon className={cn('h-4 w-4', colorClass)} />
            {showValue && (
              <span className={cn('text-xs font-semibold', colorClass)}>
                {changeFormatted}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-900 border-slate-700">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white">{label}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-400">Avant: {oldValue.toFixed(1)}</span>
              <span className="text-gray-400">→</span>
              <span className="text-green-400">Après: {newValue.toFixed(1)}</span>
            </div>
            <p className={cn('text-xs font-bold', colorClass)}>
              Évolution: {changeFormatted}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
