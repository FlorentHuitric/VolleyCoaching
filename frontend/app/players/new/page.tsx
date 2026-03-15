'use client';

import NewPlayerForm from '@/components/players/NewPlayerForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function NewPlayerPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <NewPlayerForm />
      </div>
    </ProtectedRoute>
  );
}