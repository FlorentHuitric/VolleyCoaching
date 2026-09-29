'use client';

import { useQuery } from '@apollo/client';
import { GET_MY_TEAMS } from '@/graphql/queries/teams';
import { useAuth } from '@/lib/auth/AuthContext';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TeamContextType {
  currentTeamId: string | null;
  setCurrentTeamId: (teamId: string) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const TEAM_STORAGE_KEY = 'volleycoaching_current_team_id';

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTeamId, setCurrentTeamIdState] = useState<string | null>(null);

  const { data } = useQuery(GET_MY_TEAMS, { skip: !user });
  useEffect(() => {
    if (!user || !data?.myTeams) return;
    const teams = data.myTeams;
    if (teams.length && !teams.some((team: {id: string}) => team.id === currentTeamId)) {
      setCurrentTeamIdState(teams[0].id);
      localStorage.setItem(TEAM_STORAGE_KEY + ':' + user.id, teams[0].id);
    }
  }, [data, user?.id, currentTeamId]);

  // Load from localStorage on mount
  useEffect(() => {
    setCurrentTeamIdState(null);
    if (!user) return;
    const stored = localStorage.getItem(TEAM_STORAGE_KEY + ":" + user.id);
    if (stored) {
      setCurrentTeamIdState(stored);
    }
  }, [user?.id]);

  const setCurrentTeamId = (teamId: string) => {
    setCurrentTeamIdState(teamId);
    if (user) localStorage.setItem(TEAM_STORAGE_KEY + ":" + user.id, teamId);
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
