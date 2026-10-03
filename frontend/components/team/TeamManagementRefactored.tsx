'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_TEAM_WITH_PLAYERS } from '@/graphql/queries/teams';
import { SAVE_LINEUP, GET_ACTIVE_LINEUP } from '@/graphql/queries/lineups';
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



export default function TeamManagementRefactored() {
  const { user } = useAuth();
  const router = useRouter();
  const { currentTeamId, setCurrentTeamId } = useTeam();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: lineupData, loading: loadingLineup } = useQuery(GET_ACTIVE_LINEUP, {variables:{teamId:currentTeamId},skip:!currentTeamId});



  const [updateTeam] = useMutation(gql`mutation UpdateTeam($id: ID!, $input: UpdateTeamInput!) { updateTeam(id: $id, input: $input) { id name season description } }`, { refetchQueries: [GET_TEAM_WITH_PLAYERS] });
  // Fetch current team with players
  const { data, loading, error } = useQuery(GET_TEAM_WITH_PLAYERS, {
    variables: { id: currentTeamId },
    skip: !currentTeamId,
  });

  // Save lineup mutation
  const [saveLineup, { loading: savingLineup }] = useMutation(SAVE_LINEUP, {
    refetchQueries: [GET_ACTIVE_LINEUP],
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
      <div className="astren-workspace min-h-screen">
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
      <div className="astren-workspace min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Sélectionnez une équipe ou créez-en une nouvelle
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="mt-4">Créer mon équipe</Button>
              {user && <CreateTeamDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} coachId={user.id} orgId={user.orgId} onTeamCreated={setCurrentTeamId} />}
              <Button onClick={() => setShowCreateDialog(true)} className="mt-4">Créer mon équipe</Button>
              {user && <CreateTeamDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} coachId={user.id} orgId={user.orgId} onTeamCreated={setCurrentTeamId} />}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="astren-workspace min-h-screen">
      {/* Team title banner */}
      <div className="bg-white/80 dark:bg-gray-800/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {team.name}
          </h2>
          <Button variant="outline" className="mt-3" onClick={() => setShowCreateDialog(true)}>Nouvelle équipe</Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 team-tabs">
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
                onEdit={() => setActiveTab("settings")}
              />
            )}
          </TabsContent>

          <TabsContent value="composition">
            {loading || loadingLineup ? (
              <TeamCompositionSkeleton />
            ) : (
              <DragAndDropLineupBuilder
                key={currentTeamId + (lineupData?.activeLineup?.updatedAt || "")}
                initialLineup={lineupData?.activeLineup?.positions || []}
                availablePlayers={(team.players || []).map((p: {id:string;firstName:string;lastName:string;avatar?:string;jerseyNumber?:number;primaryPosition?:string}) => ({
                  id: p.id,
                  firstName: p.firstName,
                  lastName: p.lastName,
                  avatar: p.avatar,
                  jerseyNumber: p.jerseyNumber ?? null,
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
                        positions: lineup.map(position=>({courtPosition:position.courtPosition,position:position.position,player:position.player?{id:position.player.id}:null})),
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
                  router.push("/players/new");
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
                  <form key={team.id} className="space-y-4 max-w-xl" onSubmit={async event => {
                    event.preventDefault(); const form = new FormData(event.currentTarget);
                    try { await updateTeam({ variables: { id: team.id, input: { name: form.get('name'), season: form.get('season'), description: form.get('description') } } }); toast.success('Équipe mise à jour.'); }
                    catch (e) { toast.error(e instanceof Error ? e.message : 'Modification impossible.'); }
                  }}>
                    <h3 className="font-semibold text-xl">Informations de l’équipe</h3>
                    {['name','season','description'].map((field,i) => <label className="block" key={field}><span>{['Nom de l’équipe','Saison','Description'][i]}</span><input name={field} defaultValue={team[field] || ''} required={field==='name'} className="block w-full border rounded-md px-3 py-2 bg-background mt-1" /></label>)}
                    <Button type="submit">Enregistrer</Button>
                  </form>
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
        coachId={user?.id || ""}
        orgId={user?.orgId || ""}
        onTeamCreated={(teamId) => setCurrentTeamId(teamId)}
      />
    </div>
  );
}
