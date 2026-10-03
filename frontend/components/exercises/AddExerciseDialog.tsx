'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Instagram, Link2, Plus, Loader2, X, Check } from 'lucide-react';
import { CREATE_EXERCISE, CREATE_EXERCISE_TAG } from '@/graphql/mutations/exercises';

interface AddExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tags: any[];
  orgId: string;
  userId: string;
}

export default function AddExerciseDialog({
  open, onClose, onSuccess, tags, orgId, userId
}: AddExerciseDialogProps) {
  const {getAccessToken}=useAuth();
  const [activeTab, setActiveTab] = useState<'manual' | 'instagram'>('instagram');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [fetchingMeta, setFetchingMeta] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    instructions: '',
    category: 'TECHNICAL_DRILL',
    difficulty: 'INTERMEDIATE',
    intensity: 'MODERATE',
    duration: 15,
    minPlayers: 1,
    maxPlayers: 12,
    equipment: [] as string[],
    targetSkills: [] as string[],
    primaryFocus: '',
    videoUrl: '',
    instagramUrl: '',
    thumbnailUrl: '',
    tagIds: [] as string[],
  });

  const [newEquipment, setNewEquipment] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  const [createExercise, { loading: creating }] = useMutation(CREATE_EXERCISE);
  const [createTag] = useMutation(CREATE_EXERCISE_TAG);

  const validateInstagramUrl = (url: string) => {
    return /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+/.test(url);
  };

  const fetchInstagramMeta = async () => {
    if (!validateInstagramUrl(instagramUrl)) {
      toast.warning('URL Instagram invalide. Utilisez le format: https://www.instagram.com/reel/...');
      return;
    }

    setFetchingMeta(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/instagram/oembed?url=${encodeURIComponent(instagramUrl)}`,
        {headers:{Authorization:`Bearer ${getAccessToken()}`}}
      );

      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({
          ...prev,
          instagramUrl,
          name: prev.name || data.title || 'Exercice Instagram',
          description: prev.description || data.title || '',
          thumbnailUrl: data.thumbnail_url || '',
        }));
        toast.success('Informations Instagram recuperees !');
      } else {
        // Fallback - just use the URL directly
        setForm(prev => ({
          ...prev,
          instagramUrl,
          name: prev.name || 'Exercice Instagram',
        }));
        toast.info('URL ajoutee. Remplissez les details manuellement.');
      }
    } catch {
      // Still add the URL
      setForm(prev => ({
        ...prev,
        instagramUrl,
        name: prev.name || 'Exercice Instagram',
      }));
      toast.info('URL ajoutee. Remplissez les details manuellement.');
    }
    setFetchingMeta(false);
  };

  const handleSubmit = async () => {
    // Ensure Instagram URL from input field is captured even without fetch
    const finalInstagramUrl = form.instagramUrl || (activeTab === 'instagram' && instagramUrl ? instagramUrl : '');
    if (finalInstagramUrl && !validateInstagramUrl(finalInstagramUrl)) { toast.warning('Utilisez un lien Instagram HTTPS valide.'); return; }

    if (!form.name.trim()) {
      toast.warning('Le nom est obligatoire');
      return;
    }
    if (!form.description.trim()) {
      toast.warning('La description est obligatoire');
      return;
    }

    try {
      await createExercise({
        variables: {
          input: {
            name: form.name,
            description: form.description,
            instructions: form.instructions || undefined,
            category: form.category,
            difficulty: form.difficulty,
            intensity: form.intensity,
            duration: form.duration,
            minPlayers: form.minPlayers,
            maxPlayers: form.maxPlayers,
            equipment: form.equipment,
            targetSkills: form.targetSkills,
            primaryFocus: form.primaryFocus || undefined,
            videoUrl: form.videoUrl || undefined,
            instagramUrl: finalInstagramUrl || undefined,
            thumbnailUrl: form.thumbnailUrl || undefined,
            createdById: userId,
            orgId,
            tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
          },
        },
      });

      toast.success('Exercice cree avec succes !');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la creation');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const result = await createTag({
        variables: {
          input: { name: newTagName.trim(), color: newTagColor, orgId },
        },
      });
      const newTag = result.data?.createExerciseTag;
      if (newTag) {
        setForm(prev => ({ ...prev, tagIds: [...prev.tagIds, newTag.id] }));
        toast.success(`Tag "${newTagName}" cree`);
      }
      setNewTagName('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setForm(prev => ({ ...prev, equipment: [...prev.equipment, newEquipment.trim()] }));
      setNewEquipment('');
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setForm(prev => ({ ...prev, targetSkills: [...prev.targetSkills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const skillSuggestions = ['service', 'reception', 'passe', 'attaque', 'contre', 'defense', 'deplacement', 'coordination'];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un exercice</DialogTitle>
          <DialogDescription>
            Ajoutez un exercice et, si vous en avez un, le lien vers sa vidéo.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instagram" className="gap-2">
              <Instagram className="h-4 w-4" /> Lien Instagram
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Plus className="h-4 w-4" /> Creation manuelle
            </TabsTrigger>
          </TabsList>

          {/* Instagram Import Tab */}
          <TabsContent value="instagram" className="space-y-4">
            <div className="space-y-2">
              <Label>URL du post/reel Instagram</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="https://www.instagram.com/reel/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                />
                <Button
                  onClick={fetchInstagramMeta}
                  disabled={fetchingMeta || !instagramUrl}
                >
                  {fetchingMeta ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Depuis votre collection enregistrée, copiez le lien du post ou du reel. Les collections privées ne se synchronisent pas automatiquement.
              </p>
            </div>

            {(form.instagramUrl || instagramUrl) && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Lien Instagram prêt à être enregistré avec l’exercice
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <div className="space-y-2">
              <Label>URL video (optionnel)</Label>
              <Input
                placeholder="https://..."
                value={form.videoUrl}
                onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Common fields */}
        <div className="space-y-4 mt-4">
          {/* Name & Description */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Nom de l'exercice *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Attaque croisee avec bloc"
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Decrivez l'exercice..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Instructions detaillees</Label>
              <Textarea
                value={form.instructions}
                onChange={(e) => setForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Etapes detaillees..."
                rows={3}
              />
            </div>
          </div>

          {/* Category, Difficulty, Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Categorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WARMUP">Echauffement</SelectItem>
                  <SelectItem value="TECHNICAL_DRILL">Technique</SelectItem>
                  <SelectItem value="TACTICAL_DRILL">Tactique</SelectItem>
                  <SelectItem value="PHYSICAL_CONDITIONING">Physique</SelectItem>
                  <SelectItem value="GAME_SITUATION">Situation de jeu</SelectItem>
                  <SelectItem value="COOL_DOWN">Retour au calme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulte</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm(prev => ({ ...prev, difficulty: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Debutant</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediaire</SelectItem>
                  <SelectItem value="ADVANCED">Avance</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intensite</Label>
              <Select value={form.intensity} onValueChange={(v) => setForm(prev => ({ ...prev, intensity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIGHT">Legere</SelectItem>
                  <SelectItem value="MODERATE">Moderee</SelectItem>
                  <SelectItem value="HIGH">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration, Players */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Duree (min)</Label>
              <Input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => setForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Joueurs min</Label>
              <Input
                type="number"
                min={1}
                value={form.minPlayers}
                onChange={(e) => setForm(prev => ({ ...prev, minPlayers: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Joueurs max</Label>
              <Input
                type="number"
                min={1}
                value={form.maxPlayers}
                onChange={(e) => setForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 12 }))}
              />
            </div>
          </div>

          {/* Target Skills */}
          <div className="space-y-2">
            <Label>Competences ciblees</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter une competence..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button variant="outline" size="icon" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {skillSuggestions
                .filter(s => !form.targetSkills.includes(s))
                .map(skill => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer text-xs hover:bg-accent"
                    onClick={() => setForm(prev => ({ ...prev, targetSkills: [...prev.targetSkills, skill] }))}
                  >
                    + {skill}
                  </Badge>
                ))
              }
            </div>
            {form.targetSkills.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {form.targetSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        targetSkills: prev.targetSkills.filter((_, j) => j !== i),
                      }))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label>Materiel</Label>
            <div className="flex gap-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="Ajouter du materiel..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
              />
              <Button variant="outline" size="icon" onClick={addEquipment}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.equipment.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {form.equipment.map((eq, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    {eq}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        equipment: prev.equipment.filter((_, j) => j !== i),
                      }))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-1 flex-wrap mb-2">
              {tags.map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant={form.tagIds.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  style={form.tagIds.includes(tag.id) && tag.color ? { backgroundColor: tag.color } : {}}
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      tagIds: prev.tagIds.includes(tag.id)
                        ? prev.tagIds.filter(t => t !== tag.id)
                        : [...prev.tagIds, tag.id],
                    }));
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Creer un nouveau tag..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
              />
              <Input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-12 p-1 h-10"
              />
              <Button variant="outline" size="icon" onClick={handleCreateTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={creating} className="gap-2">
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Creer l'exercice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
