'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TEAM, GET_TEAMS_BY_COACH } from '@/graphql/queries/teams';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
  orgId: string;
  onTeamCreated: (teamId: string) => void;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  coachId,
  orgId,
  onTeamCreated,
}: CreateTeamDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'SENIOR',
    season: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  });

  const [createTeam, { loading }] = useMutation(CREATE_TEAM, {
    refetchQueries: [
      {
        query: GET_TEAMS_BY_COACH,
        variables: { coachId },
      },
    ],
    onCompleted: (data) => {
      toast.success('Équipe créée avec succès !');
      onTeamCreated(data.createTeam.id);
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        level: 'SENIOR',
        season: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      });
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de l\'équipe: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Le nom de l\'équipe est requis');
      return;
    }

    createTeam({
      variables: {
        input: {
          name: formData.name,
          description: formData.description || undefined,
          level: formData.level,
          season: formData.season,
          coachId,
          orgId,
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle équipe</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer votre équipe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'équipe *</Label>
            <Input
              id="name"
              placeholder="Ex: Elite Squad"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de l'équipe..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Niveau</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YOUTH">Jeunes</SelectItem>
                  <SelectItem value="JUNIOR">Junior</SelectItem>
                  <SelectItem value="SENIOR">Senior</SelectItem>
                  <SelectItem value="ELITE">Élite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Saison</Label>
              <Input
                id="season"
                placeholder="2024-2025"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer l'équipe
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
