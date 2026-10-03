import type { PlayerType } from '@/types/player';

export type TrainingFocusMode = 'weaknesses' | 'strengths' | 'manual';

export const skillLabels: Record<string, string> = {
  serving: 'Service', passing: 'Réception', setting: 'Passe', attacking: 'Attaque',
  blocking: 'Bloc', defense: 'Défense', speed: 'Déplacement', agility: 'Agilité',
  coordination: 'Coordination', endurance: 'Endurance', verticalJump: 'Détente'
};

export function normalizeSkill(value: string): string {
  const key=value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[_-]+/g,' ');
  if (/reception|passing|controle/.test(key)) return 'passing';
  if (/service|serving|serve/.test(key)) return 'serving';
  if (/passe|setting|set precision/.test(key)) return 'setting';
  if (/attaque|attacking|attack/.test(key)) return 'attacking';
  if (/bloc|blocking|block/.test(key)) return 'blocking';
  if (/defense|defensive|dig/.test(key)) return 'defense';
  if (/deplacement|vitesse|speed|sprint/.test(key)) return 'speed';
  if (/agilit/.test(key)) return 'agility';
  if (/coordination/.test(key)) return 'coordination';
  if (/endurance|stamina/.test(key)) return 'endurance';
  if (/detente|jump|saut/.test(key)) return 'verticalJump';
  return key.replace(/\s+/g,'');
}

export function normalizeEquipment(value:string):string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
}

/** A player contributes only where a skill has a documented score or coach note. */
export function teamSkillPriorities(players: PlayerType[], mode: Exclude<TrainingFocusMode,'manual'>): string[] {
  const tally=new Map<string,{count:number;weight:number}>();
  for (const player of players) {
    const byPlayer=new Map<string,number>();
    const technical=player.currentTechnical;
    if (technical) for (const skill of ['serving','passing','setting','attacking','blocking','defense'] as const) {
      const measurements=Object.values(technical[skill]||{}).filter((value):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=10);
      if (measurements.length) {
        const average=measurements.reduce((sum,value)=>sum+value,0)/measurements.length;
        if (mode==='weaknesses'&&average<6) byPlayer.set(skill,6-average);
        if (mode==='strengths'&&average>=7) byPlayer.set(skill,average-6);
      }
    }
    for (const note of mode==='weaknesses' ? (player.weaknesses||[]) : (player.strengths||[])) {
      const skill=normalizeSkill(note);
      if (skillLabels[skill]) byPlayer.set(skill,Math.max(byPlayer.get(skill)||0,1));
    }
    for (const [skill,weight] of byPlayer) {
      const current=tally.get(skill)||{count:0,weight:0};
      tally.set(skill,{count:current.count+1,weight:current.weight+weight});
    }
  }
  return [...tally].sort((a,b)=>b[1].count-a[1].count||b[1].weight-a[1].weight).map(([skill])=>skill);
}

export function stationCount(playerCount:number,minPlayers:number,maxPlayers:number):number|null {
  if(playerCount<minPlayers||maxPlayers<1)return null;
  const groups=Math.max(1,Math.ceil(playerCount/maxPlayers));
  if(groups>6||Math.floor(playerCount/groups)<minPlayers)return null;
  return groups;
}
