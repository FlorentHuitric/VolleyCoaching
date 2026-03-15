'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { useTeam } from '@/contexts/TeamContext';
import { TrainingSession } from '@/types/exercises';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import TrainingGenerator from '@/components/training/TrainingGenerator';
import TrainingSessionDisplay from '@/components/training/TrainingSessionDisplay';
import ExerciseLibrary from '@/components/training/ExerciseLibrary';
import { Wand2, Library, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function TrainingPage() {
  const { currentTeamId } = useTeam();
  
  // Fetch players via Apollo Client
  const { data } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId
  });
  const players = data?.playersByTeam || [];
  
  const [generatedSession, setGeneratedSession] = useState<TrainingSession | null>(null);
  const [savedSessions, setSavedSessions] = useState<TrainingSession[]>([]);
  const [viewingSession, setViewingSession] = useState<TrainingSession | null>(null);

  const handleSessionGenerated = (session: TrainingSession) => {
    setGeneratedSession(session);
    setViewingSession(session);
  };

  const handleSaveSession = () => {
    if (generatedSession) {
      setSavedSessions([...savedSessions, generatedSession]);
      toast.success('Entraînement sauvegardé !');
    }
  };

  const handleMarkComplete = () => {
    if (viewingSession) {
      const updatedSession = { ...viewingSession, completed: true };
      setViewingSession(updatedSession);
      setSavedSessions(
        savedSessions.map(s => (s.id === updatedSession.id ? updatedSession : s))
      );
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet entraînement ?')) {
      setSavedSessions(savedSessions.filter(s => s.id !== sessionId));
      if (viewingSession?.id === sessionId) {
        setViewingSession(null);
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm md:text-lg">🏐</span>
                </div>
                <span className="hidden sm:block">Gestion des Entraînements</span>
                <span className="sm:hidden">Entraînements</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
              <span>Mes Séances ({savedSessions.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generator */}
              <div>
                <TrainingGenerator
                  availablePlayers={players}
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
            <ExerciseLibrary availablePlayerCount={players.length} />
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
