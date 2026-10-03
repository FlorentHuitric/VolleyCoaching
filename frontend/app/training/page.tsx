'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { AppNavigation } from '@/components/layout/AppNavigation';
import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { GET_EXERCISES } from '@/graphql/queries/exercises';
import { toTrainingExercise } from '@/services/exerciseCatalog';
import { useTeam } from '@/contexts/TeamContext';
import { TrainingSession } from '@/types/exercises';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import TrainingGenerator from '@/components/training/TrainingGenerator';
import TrainingSessionDisplay from '@/components/training/TrainingSessionDisplay';
import { Wand2, Library, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function TrainingPage() {
  const { currentTeamId } = useTeam();
  const { getAccessToken, user } = useAuth();
  const [saving,setSaving] = useState(false);
  const { data: savedData, refetch: reloadSessions } = useQuery(gql`query Plans($teamId: ID!) { savedTrainingPlans(teamId: $teamId) }`, {variables:{teamId:currentTeamId},skip:!currentTeamId});
  const {data:exerciseData,loading:exercisesLoading}=useQuery(GET_EXERCISES,{variables:{orgId:user?.orgId},skip:!user?.orgId});
  const catalog=(exerciseData?.exercises||[]).map(toTrainingExercise);
  async function mutate(query: string, variables: object) {
   const response=await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${getAccessToken()}`},body:JSON.stringify({query,variables})});
   const result=await response.json();if(result.errors)throw new Error(result.errors[0].message);return result.data;
  }
  
  // Fetch players via Apollo Client
  const { data } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId
  });
  const players = data?.playersByTeam || [];
  
  const [generatedSession, setGeneratedSession] = useState<TrainingSession | null>(null);
  const savedSessions: TrainingSession[] = savedData?.savedTrainingPlans || [];
  const [viewingSession, setViewingSession] = useState<TrainingSession | null>(null);

  const handleSessionGenerated = (session: TrainingSession) => {
    setGeneratedSession(session);
    setViewingSession(session);
  };

  useEffect(() => { setGeneratedSession(null); setViewingSession(null); }, [currentTeamId]);
  const handleSaveSession = async () => {
    if (!generatedSession || !currentTeamId || saving) return;
    setSaving(true);
    try {
      const exerciseSnapshots=generatedSession.exerciseSnapshots||{};
      const data=await mutate('mutation SavePlan($teamId: ID!, $plan: JSON!) { saveTrainingPlan(teamId: $teamId, plan: $plan) }',{teamId:currentTeamId,plan:{...generatedSession,exerciseSnapshots}});
      setGeneratedSession(data.saveTrainingPlan);setViewingSession(data.saveTrainingPlan);await reloadSessions();toast.success('Séance enregistrée sur le serveur.');
    } catch(e){toast.error(e instanceof Error?e.message:'Enregistrement impossible.')}finally{setSaving(false)}
  };
  const handleMarkComplete = async () => {
    if(!viewingSession)return;
    if(!savedSessions.some(s=>s.id===viewingSession.id)){toast.error('Enregistrez la séance avant de la terminer.');return}
    try{await mutate('mutation Complete($id: ID!) { completeTrainingSession(id: $id) { id } }',{id:viewingSession.id});setViewingSession({...viewingSession,completed:true});await reloadSessions();toast.success('Séance terminée.')}catch(e){toast.error(e instanceof Error?e.message:'Modification impossible.')}
  };
  const handleDeleteSession = async (id: string) => {
    if(!confirm('Supprimer définitivement cette séance ?'))return;
    try{await mutate('mutation Delete($id: ID!) { deleteTrainingPlan(id: $id) }',{id});if(viewingSession?.id===id)setViewingSession(null);await reloadSessions()}catch(e){toast.error(e instanceof Error?e.message:'Suppression impossible.')}
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen astren-workspace">
      <AppNavigation />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 training-tabs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="generator"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100"
            >
              <Wand2 className="h-4 w-4" />
              <span>Générateur</span>
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-900 dark:data-[state=active]:text-purple-100"
            >
              <Library className="h-4 w-4" />
              <span>Exercices</span>
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="flex items-center space-x-2 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30 data-[state=active]:text-green-900 dark:data-[state=active]:text-green-100"
            >
              <Calendar className="h-4 w-4" />
              <span>Séances ({savedSessions.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generator */}
              <div>
                <TrainingGenerator
                  key={currentTeamId || "empty"}
                  availablePlayers={players}
                  catalog={catalog}
                  onGenerated={handleSessionGenerated}
                />
              </div>

              {/* Preview */}
              <div>
                {viewingSession ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Aperçu de l'entraînement
                      </h3>
                      {generatedSession && !savedSessions.find(s => s.id === generatedSession.id) && (
                        <Button
                          onClick={handleSaveSession}
                          disabled={saving}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          💾 Sauvegarder
                        </Button>
                      )}
                    </div>
                    <TrainingSessionDisplay
                      session={viewingSession}
                      onMarkComplete={handleMarkComplete}
                    />
                  </div>
                ) : (
                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-12 text-center">
                      <Wand2 className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Générez un entraînement pour voir l'aperçu ici
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Exercise Library Tab */}
          <TabsContent value="library">
            <div className="rounded-xl border bg-card p-6"><h2 className="text-xl font-semibold">Bibliothèque du club</h2><p className="mt-2 text-sm text-muted-foreground">{exercisesLoading?'Chargement…':`${catalog.length} exercices disponibles pour composer les séances.`} Ajoutez les exercices et leurs liens vidéo ici.</p><Button asChild className="mt-4"><Link href="/exercises">Ouvrir la bibliothèque →</Link></Button></div>
          </TabsContent>

          {/* Saved Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            {savedSessions.length === 0 ? (
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Aucun entraînement sauvegardé
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Générez et sauvegardez des entraînements pour les retrouver ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedSessions.map(session => (
                  <Card
                    key={session.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    onClick={() => setViewingSession(session)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {session.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(session.date).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center">
                              <Wand2 className="h-4 w-4 mr-1" />
                              {session.duration} min
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                session.completed
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}
                            >
                              {session.completed ? '✅ Terminé' : '⏳ À venir'}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          size="sm"
                          variant="outline"
                          className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Viewing session */}
            {viewingSession && savedSessions.find(s => s.id === viewingSession.id) && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Détails de la séance
                  </h3>
                  <Button
                    onClick={() => setViewingSession(null)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Fermer
                  </Button>
                </div>
                <TrainingSessionDisplay
                  session={viewingSession}
                  onMarkComplete={handleMarkComplete}
                  onDelete={() => handleDeleteSession(viewingSession.id)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </ProtectedRoute>
  );
}
