'use client';

import InteractiveCourt from "@/components/court/InteractiveCourt";
import ClientOnlyWrapper from "@/components/court/ClientOnlyWrapper";
import CompactControls from "@/components/controls/CompactControls";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AppNavigation />

      {/* Hero Section with Court */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Main Court Area */}
        <div className="relative z-10 h-full">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            {/* Court Container */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Court Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                      🏐 Terrain Tactique
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Phase:</span>
                    <span className="font-medium bg-white dark:bg-gray-700 px-2 py-1 rounded">Formation de base</span>
                  </div>
                </div>
              </div>

              {/* Court Area */}
              <div className="p-4 md:p-6">
                <ClientOnlyWrapper>
                  <InteractiveCourt />
                </ClientOnlyWrapper>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Controls - Responsive positioning */}
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
          <CompactControls />
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
