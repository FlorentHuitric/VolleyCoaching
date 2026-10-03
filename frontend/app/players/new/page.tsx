'use client';

import { AppNavigation } from '@/components/layout/AppNavigation';
import NewPlayerForm from '@/components/players/NewPlayerForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function NewPlayerPage() {
  return (
    <ProtectedRoute><AppNavigation/>
      <div className="min-h-screen astren-workspace">
        <NewPlayerForm />
      </div>
    </ProtectedRoute>
  );
}