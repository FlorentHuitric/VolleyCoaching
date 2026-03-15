'use client';

import PlayerManagementDashboard from "@/components/players/PlayerManagementDashboard";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function PlayersPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <AppNavigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PlayerManagementDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}