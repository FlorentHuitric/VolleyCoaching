export type Protocol = {
  id: string;
  name: string;
  instructions: string;
  category: 'TECHNICAL' | 'PHYSICAL';
  unit: string;
  aggregation: 'SUCCESS_COUNT' | 'BEST';
  attempts: number;
  direction: 'HIGHER' | 'LOWER';
  baseline: number;
  target: number;
};

// Starting examples are local coaching targets, not sex-, age- or league-wide norms.
export const defaultProtocols: Protocol[] = [
  { id:'service-zone', name:'Service dans la zone annoncée', instructions:'Annoncez la même zone avant chaque service. Comptez les ballons tombant dans cette zone.', category:'TECHNICAL', unit:'réussites', aggregation:'SUCCESS_COUNT', attempts:20, direction:'HIGHER', baseline:0, target:16 },
  { id:'reception-cible', name:'Réception vers le passeur', instructions:'Vingt services de difficulté comparable. Comptez les réceptions jouables dans la zone du passeur.', category:'TECHNICAL', unit:'réussites', aggregation:'SUCCESS_COUNT', attempts:20, direction:'HIGHER', baseline:0, target:16 },
  { id:'sprint-20', name:'Sprint 20 m', instructions:'Départ arrêté, même surface et même méthode de chronométrage. Repos complet entre les essais.', category:'PHYSICAL', unit:'s', aggregation:'BEST', attempts:2, direction:'LOWER', baseline:5, target:3 },
  { id:'detente-attaque', name:'Détente d’attaque', instructions:'Mesurez la hauteur d’atteinte avec élan et la hauteur debout, puis saisissez la différence en centimètres.', category:'PHYSICAL', unit:'cm', aggregation:'BEST', attempts:3, direction:'HIGHER', baseline:0, target:70 },
];

export function validateProtocols(value: unknown): Protocol[] {
  if (!Array.isArray(value) || value.length<1 || value.length>30) throw new Error('Entre 1 et 30 protocoles sont requis.');
  const ids = new Set<string>();
  return value.map((row: any) => {
    if (!row || typeof row.id !== 'string' || !/^[a-z0-9-]{2,60}$/.test(row.id) || ids.has(row.id)) throw new Error('Identifiant de protocole invalide ou en double.');
    ids.add(row.id);
    const aggregation = row.aggregation ?? (row.unit === 'réussites' ? 'SUCCESS_COUNT' : 'BEST');
    if (!['TECHNICAL','PHYSICAL'].includes(row.category) || !['HIGHER','LOWER'].includes(row.direction) || !['SUCCESS_COUNT','BEST'].includes(aggregation) ||
      typeof row.name !== 'string' || !row.name.trim() || row.name.length>100 ||
      typeof row.instructions !== 'string' || row.instructions.length>2000 ||
      typeof row.unit !== 'string' || !row.unit.trim() || row.unit.length>24 ||
      !Number.isInteger(row.attempts) || row.attempts<1 || row.attempts>50 ||
      !Number.isFinite(row.baseline) || !Number.isFinite(row.target) || row.baseline<0 || row.target<0 || row.baseline===row.target ||
      (aggregation==='SUCCESS_COUNT' && (row.direction!=='HIGHER' || !Number.isInteger(row.baseline) || !Number.isInteger(row.target) || row.target>row.attempts)) ||
      (row.direction==='HIGHER' && row.baseline>=row.target) || (row.direction==='LOWER' && row.baseline<=row.target)) throw new Error('Paramètres de protocole incohérents.');
    return {id:row.id,name:row.name.trim(),instructions:row.instructions.trim(),category:row.category,unit:row.unit.trim(),aggregation,attempts:row.attempts,direction:row.direction,baseline:row.baseline,target:row.target};
  });
}

export function scoreProtocol(protocol: Protocol, attempts: number[]) {
  if (attempts.length!==protocol.attempts || attempts.some(n=>!Number.isFinite(n)||n<0)) throw new Error('Mesures incomplètes ou invalides.');
  if (protocol.aggregation==='SUCCESS_COUNT' && attempts.some(n=>!Number.isInteger(n)||n>1)) throw new Error('Chaque essai doit valoir 0 ou 1.');
  const raw=protocol.aggregation==='SUCCESS_COUNT' ? attempts.reduce((a,b)=>a+b,0) : protocol.direction==='LOWER' ? Math.min(...attempts) : Math.max(...attempts);
  const fraction=(raw-protocol.baseline)/(protocol.target-protocol.baseline);
  return { raw, score:Math.round(Math.max(0,Math.min(1,fraction))*100)/10 };
}
