'use client';

import { motion } from 'framer-motion';

interface VolleyballLoaderProps {
  size?: number;
  className?: string;
}

export function VolleyballLoader({ size = 80, className = '' }: VolleyballLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Volleyball SVG */}
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Main circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {/* Volleyball pattern - curved lines */}
          {/* Left curve */}
          <path
            d="M 20 15 Q 30 50 20 85"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Right curve */}
          <path
            d="M 80 15 Q 70 50 80 85"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Top curve */}
          <path
            d="M 15 20 Q 50 30 85 20"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Bottom curve */}
          <path
            d="M 15 80 Q 50 70 85 80"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Diagonal curve 1 */}
          <path
            d="M 25 25 Q 50 50 75 75"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Diagonal curve 2 */}
          <path
            d="M 75 25 Q 50 50 25 75"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function FullPageVolleyballLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 z-50">
      <div className="text-center">
        <VolleyballLoader size={120} />
        <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          Chargement...
        </p>
      </div>
    </div>
  );
}
