'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PLAYER } from '@/graphql/mutations/players';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { GET_TEAM } from '@/graphql/queries/teams';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, Plus, X, Save, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ImageCropDialog } from './ImageCropDialog';

interface PlayerFormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  dateOfBirth: Date | undefined;
  jerseyNumber: number;
  preferredName?: string;
  avatar?: string;
  nationality: string;
  dominantHand: string;

  // Informations volleyball
  teamId: string;
  primaryPosition: string;
  secondaryPositions: string[];
  experience: string;
  contractLevel: string;
  status: string;

  // Informations physiques
  height: number;
  weight: number;
  reach: number;
  wingspan: number;

  // Notes et commentaires
  notes: string;
  medicalNotes: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const positions = [
  { value: 'Outside Hitter', label: 'Attaquant de pointe (WS)', color: '#EF4444' },
  { value: 'Setter', label: 'Passeur (S)', color: '#F59E0B' },
  { value: 'Middle Blocker', label: 'Central (MB)', color: '#3B82F6' },
  { value: 'Opposite', label: 'Diagonal (Op)', color: '#8B5CF6' },
  { value: 'Libero', label: 'Libéro (L)', color: '#10B981' },
  { value: 'Defensive Specialist', label: 'Spécialiste défensif (DS)', color: '#6B7280' }
];

const experienceLevels = [
  { value: 'beginner', label: 'Débutant (0-1 an)' },
  { value: 'intermediate', label: 'Intermédiaire (1-3 ans)' },
  { value: 'advanced', label: 'Avancé (3-5 ans)' },
  { value: 'expert', label: 'Expert (5+ ans)' },
  { value: 'professional', label: 'Professionnel' }
];

const contractLevels = [
  { value: 'trial', label: 'Essai' },
  { value: 'development', label: 'Développement' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'starter', label: 'Titulaire' },
];

export default function NewPlayerForm() {
  const router = useRouter();
  const { currentTeamId } = useTeam();
  
  // Apollo Client mutations and queries
  const [createPlayerMutation] = useMutation(CREATE_PLAYER);
  const { data: playersData } = useQuery(GET_PLAYERS_BY_TEAM, {
    variables: { teamId: currentTeamId },
    skip: !currentTeamId
  });
  const { data: teamData } = useQuery(GET_TEAM, {
    variables: { id: currentTeamId },
    skip: !currentTeamId
  });
  const allPlayers = playersData?.playersByTeam || [];
  const currentTeamOrgId = teamData?.team?.orgId;
  
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2000, 0));
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jerseyError, setJerseyError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: undefined,
    jerseyNumber: 1,
    preferredName: '',
    avatar: '',
    nationality: 'France',
    dominantHand: 'RIGHT',
    teamId: currentTeamId || '', // Use current team from context
    primaryPosition: '',
    secondaryPositions: [],
    experience: '',
    contractLevel: 'trial',
    status: 'active',
    height: 180,
    weight: 70,
    reach: 230,
    wingspan: 180,
    notes: '',
    medicalNotes: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const handleInputChange = (field: keyof PlayerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate jersey number when it changes
    if (field === 'jerseyNumber') {
      const existingPlayer = allPlayers.find((p: any) =>
        p.jerseyNumber === value
      );

      if (existingPlayer) {
        setJerseyError(`Le numéro ${value} est déjà attribué à ${existingPlayer.firstName} ${existingPlayer.lastName}`);
      } else {
        setJerseyError(null);
      }
    }
  };

  const addSecondaryPosition = (position: string) => {
    if (!formData.secondaryPositions.includes(position) && position !== formData.primaryPosition) {
      setFormData(prev => ({
        ...prev,
        secondaryPositions: [...prev.secondaryPositions, position]
      }));
    }
  };

  const removeSecondaryPosition = (position: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryPositions: prev.secondaryPositions.filter(p => p !== position)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate orgId is available
      if (!currentTeamOrgId) {
        throw new Error('Organization ID not found. Please refresh the page.');
      }

      // Create player via GraphQL mutation
      const { data } = await createPlayerMutation({
        variables: {
          input: {
            orgId: currentTeamOrgId,
            teamId: formData.teamId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            preferredName: formData.preferredName || null,
            dateOfBirth: formData.dateOfBirth!.toISOString(),
            nationality: formData.nationality,
            email: null,
            phone: null,
            jerseyNumber: formData.jerseyNumber,
            avatar: formData.avatar || null,
            height: formData.height,
            weight: formData.weight,
            dominantHand: formData.dominantHand,
            primaryPosition: formData.primaryPosition.toUpperCase().replace(/ /g, '_'),
            secondaryPosition: formData.secondaryPositions[0]?.toUpperCase().replace(/ /g, '_') || null,
            contractLevel: formData.contractLevel.toUpperCase(),
            status: formData.status.toUpperCase()
          }
        },
        refetchQueries: ['GetPlayersByTeam']
      });

      // Show success toast
      toast.success('Joueur créé avec succès !', {
        description: `${formData.firstName} ${formData.lastName} a été ajouté à l'effectif`
      });

      // Redirect to players list
      router.push('/players');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec de la création du joueur';
      toast.error('Erreur lors de la création', {
        description: errorMessage
      });
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    // Upload cropped image to backend
    const uploadFormData = new FormData();
    uploadFormData.append('file', croppedImageBlob, 'avatar.jpg');

    try {
      const response = await fetch('http://api.localhost/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        handleInputChange('avatar', data.url);
        toast.success('Photo téléchargée !');
        setCropDialogOpen(false);
        URL.revokeObjectURL(tempImageUrl);
      } else {
        console.error('Upload error:', response.status, response.statusText);
        toast.error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Upload connection error:', error);
      toast.error('Erreur de connexion');
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.primaryPosition && formData.dateOfBirth && !jerseyError;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/players">
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux joueurs</span>
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-3">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <span>Ajouter un nouveau joueur</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un profil complet pour un nouveau membre de l'équipe
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>👤</span>
              <span>Informations personnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Prénom du joueur"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Nom de famille"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredName">Nom préféré</Label>
                <Input
                  id="preferredName"
                  value={formData.preferredName}
                  onChange={(e) => handleInputChange('preferredName', e.target.value)}
                  placeholder="Surnom ou nom d'usage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jerseyNumber">Numéro de maillot</Label>
                <Input
                  id="jerseyNumber"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.jerseyNumber}
                  onChange={(e) => handleInputChange('jerseyNumber', parseInt(e.target.value) || 1)}
                  className={jerseyError ? 'border-red-500' : ''}
                />
                {jerseyError && (
                  <p className="text-sm text-red-500">{jerseyError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="France"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominantHand">Main dominante</Label>
                <Select
                  value={formData.dominantHand}
                  onValueChange={(value) => handleInputChange('dominantHand', value)}
                >
                  <SelectTrigger id="dominantHand">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RIGHT">Droitier</SelectItem>
                    <SelectItem value="LEFT">Gaucher</SelectItem>
                    <SelectItem value="AMBIDEXTROUS">Ambidextre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date de naissance *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? (
                        format(formData.dateOfBirth, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionnez une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-3 space-y-3">
                      {/* Year and Month Selectors */}
                      <div className="flex gap-2">
                        <Select
                          value={calendarMonth.getFullYear().toString()}
                          onValueChange={(year) => {
                            setCalendarMonth(new Date(parseInt(year), calendarMonth.getMonth(), 1));
                          }}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Année" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: new Date().getFullYear() - 1960 + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={calendarMonth.getMonth().toString()}
                          onValueChange={(month) => {
                            setCalendarMonth(new Date(calendarMonth.getFullYear(), parseInt(month), 1));
                          }}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Mois" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Calendar for day selection */}
                      <Calendar
                        mode="single"
                        selected={formData.dateOfBirth}
                        onSelect={(date) => {
                          handleInputChange('dateOfBirth', date);
                          if (date) setCalendarMonth(date);
                        }}
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Photo/Avatar</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Create temporary URL for cropping
                      const url = URL.createObjectURL(file);
                      setTempImageUrl(url);
                      setCropDialogOpen(true);
                    }
                  }}
                  className="cursor-pointer"
                />
                {formData.avatar && (
                  <div className="mt-2">
                    <img src={formData.avatar} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations volleyball */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏐</span>
              <span>Informations volleyball</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryPosition">Poste principal *</Label>
                <Select
                  value={formData.primaryPosition}
                  onValueChange={(value) => handleInputChange('primaryPosition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un poste" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: position.color }}
                          />
                          <span>{position.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Niveau d'expérience</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => handleInputChange('experience', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractLevel">Statut dans l'équipe</Label>
                <Select
                  value={formData.contractLevel}
                  onValueChange={(value) => handleInputChange('contractLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contractLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut actuel</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="injured">Blessé</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Postes secondaires */}
            <div className="space-y-3">
              <Label>Postes secondaires</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.secondaryPositions.map((position) => (
                  <Badge key={position} variant="secondary" className="flex items-center space-x-1">
                    <span>{position}</span>
                    <button
                      type="button"
                      onClick={() => removeSecondaryPosition(position)}
                      className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addSecondaryPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un poste secondaire" />
                </SelectTrigger>
                <SelectContent>
                  {positions
                    .filter(p => p.value !== formData.primaryPosition && !formData.secondaryPositions.includes(p.value))
                    .map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: position.color }}
                          />
                          <span>{position.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Mensurations physiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📏</span>
              <span>Mensurations physiques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="150"
                  max="220"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 180)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="50"
                  max="120"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 70)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reach">Portée (cm)</Label>
                <Input
                  id="reach"
                  type="number"
                  min="200"
                  max="270"
                  value={formData.reach}
                  onChange={(e) => handleInputChange('reach', parseInt(e.target.value) || 230)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wingspan">Envergure (cm)</Label>
                <Input
                  id="wingspan"
                  type="number"
                  min="150"
                  max="220"
                  value={formData.wingspan}
                  onChange={(e) => handleInputChange('wingspan', parseInt(e.target.value) || 180)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts d'urgence et notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📝</span>
              <span>Informations complémentaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Nom du contact d'urgence"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Téléphone d'urgence</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes générales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notes sur le joueur, objectifs, style de jeu..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalNotes">Notes médicales</Label>
              <Textarea
                id="medicalNotes"
                value={formData.medicalNotes}
                onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
                placeholder="Blessures antérieures, allergies, traitements..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/players">
            <Button variant="outline" disabled={isSubmitting}>
              Annuler
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Création...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Créer le joueur</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        imageUrl={tempImageUrl}
        onCropComplete={handleCropComplete}
        onClose={() => {
          setCropDialogOpen(false);
          URL.revokeObjectURL(tempImageUrl);
        }}
      />
    </div>
  );
}