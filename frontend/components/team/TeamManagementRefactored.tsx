'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TEAM_WITH_PLAYERS } from '@/graphql/queries/teams';
import { SAVE_LINEUP } from '@/graphql/queries/lineups';
import { useTeam } from '@/contexts/TeamContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamOverview } from './TeamOverview';
import { TeamPlayers } from './TeamPlayers';
import { CreateTeamDialog } from './CreateTeamDialog';
import {
  TeamManagementSkeleton,
  TeamOverviewSkeleton,
  TeamPlayersSkeleton,
  TeamCompositionSkeleton,
  TeamSettingsSkeleton,
} from './TeamSkeleton';
import DragAndDropLineupBuilder from './DragAndDropLineupBuilder';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Hardcoded values for now - will be replaced with auth later
const COACH_ID = 'cmgcp7q5d000411vpbs7uzct6'; // Thomas Dubois
const ORG_ID = 'cmgcp7q29000011vp7z74liiu'; // VolleyCoaching Demo Club
const DEFAULT_TEAM_ID = 'cmgcp7q5k000811vp53bn2ttz'; // Elite Squad

export default function TeamManagementRefactored() {
  const { currentTeamId, setCurrentTeamId } = useTeam();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Initialize team ID if not set
  useEffect(() => {
    if (!currentTeamId) {
      setCurrentTeamId(DEFAULT_TEAM_ID);
    }
  }, [currentTeamId, setCurrentTeamId]);

  // Fetch current team with players
  const { data, loading, error } = useQuery(GET_TEAM_WITH_PLAYERS, {
    variables: { id: currentTeamId },
    skip: !currentTeamId,
  });

  // Save lineup mutation
  const [saveLineup, { loading: savingLineup }] = useMutation(SAVE_LINEUP, {
    onCompleted: () => {
      toast.success('Composition sauvegardée avec succès !');
    },
    onError: (error) => {
      toast.error(`Erreur lors de la sauvegarde: ${error.message}`);
    },
  });

  // Show skeleton during initial load
  if (loading && !data) {
    return <TeamManagementSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">
                Erreur lors du chargement de l'équipe: {error.message}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const team = data?.teamWithPlayers;

  // No team selected
  if (!team) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Sélectionnez une équipe ou créez-en une nouvelle
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Team title banner */}
      <div className="bg-white/80 dark:bg-gray-800/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {team.name}
          </h2>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="composition">Composition</TabsTrigger>
            <TabsTrigger value="players">Joueurs</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {loading ? (
              <TeamOverviewSkeleton />
            ) : (
              <TeamOverview
                team={team}
                onEdit={() => setShowEditDialog(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="composition">
            {loading ? (
              <TeamCompositionSkeleton />
            ) : (
              <DragAndDropLineupBuilder
                availablePlayers={(team.players || []).map(p => ({
                  id: p.id,
                  firstName: p.firstName,
                  lastName: p.lastName,
                  avatar: p.avatar,
                  jerseyNumber: p.jerseyNumber || 0,
                  primaryPosition: p.primaryPosition as any || 'OUTSIDE_HITTER',
                  secondaryPositions: [],
                  status: 'active' as const,
                  contractLevel: 'starter' as const,
                  evaluationHistory: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as any))}
                onSaveLineup={async (lineup) => {
                  if (!currentTeamId) return;
                  await saveLineup({
                    variables: {
                      input: {
                        teamId: currentTeamId,
                        name: 'Default Lineup',
                        positions: lineup,
                      },
                    },
                  });
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="players">
            {loading ? (
              <TeamPlayersSkeleton />
            ) : (
              <TeamPlayers
                players={team.players || []}
                onAddPlayer={() => {
                  // TODO: Implement add player dialog
                  console.log('Add player');
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="settings">
            {loading ? (
              <TeamSettingsSkeleton />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    Paramètres de l'équipe - À venir
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        coachId={COACH_ID}
        orgId={ORG_ID}
        onTeamCreated={(teamId) => setCurrentTeamId(teamId)}
      />
    </div>
  );
}
