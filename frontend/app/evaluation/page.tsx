'use client';

import EvaluationDashboard from '@/components/evaluation/EvaluationDashboard';
import { AppNavigation } from '@/components/layout/AppNavigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function EvaluationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <AppNavigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EvaluationDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}
