'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TeamContextType {
  currentTeamId: string | null;
  setCurrentTeamId: (teamId: string) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const TEAM_STORAGE_KEY = 'volleycoaching_current_team_id';

export function TeamProvider({ children }: { children: ReactNode }) {
  const [currentTeamId, setCurrentTeamIdState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TEAM_STORAGE_KEY);
    if (stored) {
      setCurrentTeamIdState(stored);
    }
  }, []);

  const setCurrentTeamId = (teamId: string) => {
    setCurrentTeamIdState(teamId);
    localStorage.setItem(TEAM_STORAGE_KEY, teamId);
  };

  return (
    <TeamContext.Provider value={{ currentTeamId, setCurrentTeamId }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
