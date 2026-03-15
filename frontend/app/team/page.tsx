'use client';

import { AppNavigation } from '@/components/layout/AppNavigation';
import TeamManagementRefactored from '@/components/team/TeamManagementRefactored';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function TeamPage() {
  return (
    <ProtectedRoute>
      <>
        <AppNavigation />
        <TeamManagementRefactored />
      </>
    </ProtectedRoute>
  );
}