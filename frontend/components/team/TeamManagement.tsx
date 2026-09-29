'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { useTeam } from '@/contexts/TeamContext';
import { PlayerType } from '@/types/player';
import { VolleyballPosition } from '@/hooks/useCourtStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Users,
  Trophy,
  Star,
  Plus,
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Target,
  Zap,
  Brain,
  Activity,
  Crown,
  Shield,
  Sword,
  TrendingUp
} from 'lucide-react';
import { getPositionColor, getPositionAbbreviation } from '@/utils/volleyballUtils';
import Link from 'next/link';
import DragAndDropLineupBuilder from './DragAndDropLineupBuilder';
import { lineupService, LineupPosition as ServiceLineupPosition } from '@/services/lineupService';

interface TeamInfo {
  name: string;
  logo?: string;
  description: string;
  founded: string;
  location: string;
  category: string;
  level: string;
  coach: {
    name: string;
    email: string;
    phone: string;
    experience: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
    address: string;
  };
  objectives: string[];
  season: {
    start: string;
    end: string;
    goals: string;
  };
}

interface LineupPosition {
  courtPosition: number; // 1-6
  player?: PlayerType;
  position?: VolleyballPosition;
  role?: string;
}

export default function TeamManagement() {
  const { currentTeamId } = useTeam();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch players via Apollo Client
  const { data } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId
  });
  const players: PlayerType[] = data?.playersByTeam || [];

  const [lineup, setLineup] = useState<LineupPosition[]>([]);

  const [teamInfo, setTeamInfo] = useState<TeamInfo>({
    name: 'VolleyCoaching Academy',
    logo: '',
    description: 'Une équipe de volleyball passionnée et déterminée à atteindre l\'excellence.',
    founded: '2024',
    location: 'Paris, France',
    category: 'Senior',
    level: 'Régional',
    coach: {
      name: 'Entraîneur Principal',
      email: 'coach@volleycoaching.com',
      phone: '+33 6 12 34 56 78',
      experience: '10 ans d\'expérience'
    },
    contact: {
      email: 'contact@volleycoaching.com',
      phone: '+33 1 23 45 67 89',
      website: 'https://volleycoaching.com',
      address: '123 Rue du Volleyball, 75001 Paris'
    },
    objectives: [
      'Développer l\'esprit d\'équipe',
      'Améliorer les techniques individuelles',
      'Participer aux championnats régionaux',
      'Former de nouveaux talents'
    ],
    season: {
      start: '2024-09-01',
      end: '2025-06-30',
      goals: 'Finir dans le top 3 du championnat régional'
    }
  });

  // Initialize lineup
  useEffect(() => {
    const initialLineup: LineupPosition[] = [
      { courtPosition: 1, position: 'OUTSIDE_HITTER' as VolleyballPosition },
      { courtPosition: 2, position: 'MIDDLE_BLOCKER' as VolleyballPosition },
      { courtPosition: 3, position: 'SETTER' as VolleyballPosition },
      { courtPosition: 4, position: 'OUTSIDE_HITTER' as VolleyballPosition },
      { courtPosition: 5, position: 'MIDDLE_BLOCKER' as VolleyballPosition },
      { courtPosition: 6, position: 'OPPOSITE' as VolleyballPosition }
    ];
    setLineup(initialLineup);
  }, []);

  const handleSaveLineup = async (newLineup: ServiceLineupPosition[]) => {
    try {
      // Convert ServiceLineupPosition to our local LineupPosition format
      const convertedLineup: LineupPosition[] = newLineup.map(pos => ({
        courtPosition: pos.courtPosition,
        position: pos.position,
        player: pos.player
      }));

      setLineup(convertedLineup);
      await lineupService.saveCurrentLineup(newLineup);

      // Show success feedback
      toast.success('Composition sauvegardée !', {
        description: 'Votre équipe sera maintenant visible sur la page d\'accueil'
      });

      // Force window reload to sync data across tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'volleyball_lineup',
        newValue: JSON.stringify({
          positions: newLineup,
          updatedAt: new Date().toISOString()
        })
      }));

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde', {
        description: (error as Error).message
      });
    }
  };

  const handleTeamInfoChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTeamInfo(prev => ({
        ...prev,
        [parent]: {
          ...(typeof prev[parent as keyof TeamInfo] === "object" ? prev[parent as keyof TeamInfo] as object : {}),
          [child]: value
        }
      }));
    } else {
      setTeamInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const assignPlayerToPosition = (courtPosition: number, player: PlayerType) => {
    setLineup(prev => prev.map(pos =>
      pos.courtPosition === courtPosition
        ? { ...pos, player }
        : pos
    ));
  };

  const removePlayerFromPosition = (courtPosition: number) => {
    setLineup(prev => prev.map(pos =>
      pos.courtPosition === courtPosition
        ? { ...pos, player: undefined }
        : pos
    ));
  };

  const getPlayersByContractLevel = (level: string) => {
    return players.filter(p => p.contractLevel === level);
  };

  const getPositionName = (courtPosition: number) => {
    const positionNames: Record<number, string> = {
      1: 'Arrière droite (Serveur)',
      2: 'Avant droite',
      3: 'Avant centre',
      4: 'Avant gauche',
      5: 'Arrière gauche',
      6: 'Arrière centre'
    };
    return positionNames[courtPosition] || `Position ${courtPosition}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Button>
          </Link>

          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Annuler</span>
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier l'équipe</span>
              </Button>
            )}
          </div>
        </div>

        {/* Team Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            {isEditing ? (
              <Input
                value={teamInfo.name}
                onChange={(e) => handleTeamInfoChange('name', e.target.value)}
                className="text-4xl font-bold text-center max-w-md"
              />
            ) : (
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{teamInfo.name}</h1>
            )}
          </div>
          {isEditing ? (
            <Textarea
              value={teamInfo.description}
              onChange={(e) => handleTeamInfoChange('description', e.target.value)}
              className="max-w-2xl mx-auto"
              rows={2}
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{teamInfo.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="lineup" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Composition</span>
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Joueurs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statistiques d'équipe */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>Statistiques de l'équipe</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{players.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Joueurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {players.length > 0 ? (Math.round(players.reduce((sum, p) => sum + (p.currentEvaluation?.overallRating || 0), 0) / players.length * 10) / 10).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {getPlayersByContractLevel('starter').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Titulaires</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {new Date().getFullYear() - parseInt(teamInfo.founded)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Années</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de l'équipe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span>Informations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Fondée en</div>
                    <div className="font-semibold">{teamInfo.founded}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Localisation</div>
                    <div className="font-semibold">{teamInfo.location}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Niveau</div>
                    <div className="font-semibold">{teamInfo.level}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Catégorie</div>
                    <div className="font-semibold">{teamInfo.category}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Objectifs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Objectifs de l'équipe</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamInfo.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>{objective}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Composition */}
        <TabsContent value="lineup">
          <DragAndDropLineupBuilder
            availablePlayers={players}
            onSaveLineup={handleSaveLineup}
            initialLineup={lineup.map(p=>({...p,position:p.position || "OUTSIDE_HITTER"}))}
          />
        </TabsContent>

        {/* Joueurs */}
        <TabsContent value="players">
          <div className="space-y-6">
            {/* Joueurs par catégorie */}
            {['starter', 'rotation', 'development', 'trial'].map(level => {
              const categoryPlayers = getPlayersByContractLevel(level);
              if (categoryPlayers.length === 0) return null;

              const categoryIcons = {
                starter: Crown,
                rotation: Star,
                development: TrendingUp,
                trial: Users
              };

              const categoryColors = {
                starter: 'text-yellow-600',
                rotation: 'text-blue-600',
                development: 'text-green-600',
                trial: 'text-gray-600'
              };

              const CategoryIcon = categoryIcons[level as keyof typeof categoryIcons];

              return (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${categoryColors[level as keyof typeof categoryColors]}`}>
                      <CategoryIcon className="h-5 w-5" />
                      <span className="capitalize">
                        {level === 'starter' ? 'Titulaires' :
                         level === 'rotation' ? 'Rotation' :
                         level === 'development' ? 'Développement' :
                         'Essais'}
                      </span>
                      <Badge variant="secondary">{categoryPlayers.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryPlayers.map(player => (
                        <div key={player.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Avatar>
                            <AvatarImage src={player.avatar || undefined} />
                            <AvatarFallback>
                              {player.firstName[0]}{player.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold">
                              {player.firstName} {player.lastName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {player.primaryPosition} • #{player.jerseyNumber}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Note: {player.currentEvaluation?.overallRating || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Nom de l'équipe</Label>
                  <Input
                    id="teamName"
                    value={teamInfo.name}
                    onChange={(e) => handleTeamInfoChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={teamInfo.description}
                    onChange={(e) => handleTeamInfoChange('description', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="founded">Année de fondation</Label>
                    <Input
                      id="founded"
                      value={teamInfo.founded}
                      onChange={(e) => handleTeamInfoChange('founded', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={teamInfo.location}
                      onChange={(e) => handleTeamInfoChange('location', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={teamInfo.category}
                      onValueChange={(value) => handleTeamInfoChange('category', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Vétéran">Vétéran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Niveau</Label>
                    <Select
                      value={teamInfo.level}
                      onValueChange={(value) => handleTeamInfoChange('level', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Départemental">Départemental</SelectItem>
                        <SelectItem value="Régional">Régional</SelectItem>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact et entraîneur */}
            <Card>
              <CardHeader>
                <CardTitle>Contact et staff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coachName">Entraîneur principal</Label>
                  <Input
                    id="coachName"
                    value={teamInfo.coach.name}
                    onChange={(e) => handleTeamInfoChange('coach.name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coachEmail">Email entraîneur</Label>
                  <Input
                    id="coachEmail"
                    type="email"
                    value={teamInfo.coach.email}
                    onChange={(e) => handleTeamInfoChange('coach.email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={teamInfo.contact.email}
                    onChange={(e) => handleTeamInfoChange('contact.email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Téléphone</Label>
                  <Input
                    id="contactPhone"
                    value={teamInfo.contact.phone}
                    onChange={(e) => handleTeamInfoChange('contact.phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={teamInfo.contact.website}
                    onChange={(e) => handleTeamInfoChange('contact.website', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
