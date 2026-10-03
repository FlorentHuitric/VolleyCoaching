'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gql, useMutation, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppNavigation } from '@/components/layout/AppNavigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { GET_PLAYERS_BY_TEAM } from '@/graphql/queries/players';
import { Button } from '@/components/ui/button';

type Protocol={id:string;name:string;instructions:string;category:'PHYSICAL'|'TECHNICAL';unit:string;aggregation:'SUCCESS_COUNT'|'BEST';attempts:number;direction:'HIGHER'|'LOWER';baseline:number;target:number};
const QUERY=gql`query Protocols{assessmentProtocols}`;
const SAVE=gql`mutation SaveProtocols($protocols:JSON!){saveAssessmentProtocols(protocols:$protocols)}`;
const RECORD=gql`mutation RecordAssessment($playerId:ID!,$protocolId:String!,$attempts:[Float!]!){recordProtocolAssessment(playerId:$playerId,protocolId:$protocolId,attempts:$attempts)}`;

export default function ProtocolsPage(){return <ProtectedRoute><AppNavigation/><Content/></ProtectedRoute>}

function Content(){
  const {user}=useAuth();const {currentTeamId}=useTeam();
  const {data,refetch}=useQuery(QUERY);const {data:playersData}=useQuery(GET_PLAYERS_BY_TEAM,{variables:{teamId:currentTeamId},skip:!currentTeamId});
  const [save,{loading:saving}]=useMutation(SAVE);const [record,{loading:recording}]=useMutation(RECORD);
  const [protocols,setProtocols]=useState<Protocol[]>([]);const [editing,setEditing]=useState(false);
  const [protocolId,setProtocolId]=useState('');const [playerId,setPlayerId]=useState('');const [attempts,setAttempts]=useState<string[]>([]);
  const [lastResult,setLastResult]=useState<{raw:number;score:number;protocol:Protocol}|null>(null);
  useEffect(()=>{if(data?.assessmentProtocols && !editing)setProtocols(data.assessmentProtocols.map((p:Protocol)=>({...p,aggregation:p.aggregation??(p.unit==='réussites'?'SUCCESS_COUNT':'BEST')})))},[data,editing]);
  const protocol=protocols.find(p=>p.id===protocolId);
  useEffect(()=>{if(protocols.length&&!protocols.some(p=>p.id===protocolId))setProtocolId(protocols[0].id)},[protocolId,protocols]);
  useEffect(()=>{setAttempts(protocol?Array(protocol.attempts).fill(''):[])},[protocol?.id,protocol?.attempts]);
  const players=playersData?.playersByTeam||[];
  const update=(id:string,key:keyof Protocol,value:string)=>setProtocols(rows=>rows.map(p=>p.id===id?{...p,[key]:['attempts','baseline','target'].includes(key)?Number(value):value}:p));
  async function saveSettings(){try{await save({variables:{protocols}});await refetch();setEditing(false);toast.success('Barèmes du club enregistrés.')}catch(error){toast.error(error instanceof Error?error.message:'Barèmes invalides.')}}
  async function submit(event:React.FormEvent){event.preventDefault();if(!playerId||!protocol)return;
    const values=attempts.map(Number);if(attempts.some(x=>x.trim()==='')||values.some(x=>!Number.isFinite(x)||x<0)){toast.error('Tous les essais doivent être renseignés.');return}
    try{const result=await record({variables:{playerId,protocolId:protocol.id,attempts:values}});setLastResult(result.data.recordProtocolAssessment);setAttempts(Array(protocol.attempts).fill(''));toast.success('Relevé enregistré dans l’historique du joueur.')}catch(error){toast.error(error instanceof Error?error.message:'Relevé impossible.')}
  }
  return <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
    <div className="print:hidden"><Link href="/evaluation" className="text-sm text-primary">← Retour aux évaluations</Link></div>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-primary">Suivi des joueurs</p><h1 className="text-3xl font-semibold">Protocoles et relevés</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Mesurez les mêmes gestes dans les mêmes conditions. La note sur 10 compare le résultat aux objectifs de votre club ; le résultat brut reste visible.</p></div><Button type="button" variant="outline" onClick={()=>window.print()}>Imprimer la fiche</Button></header>
    <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3"><div><h2 className="text-xl font-semibold">Barèmes du club</h2><p className="text-sm text-muted-foreground">« Départ » vaut 0/10 et « Objectif » vaut 10/10. Adaptez ces repères avant de comparer les joueurs.</p></div>{user?.role==='ADMIN'&&<Button type="button" variant="outline" onClick={()=>setEditing(!editing)}>{editing?'Annuler':'Modifier les barèmes'}</Button>}</div>
      <div className="grid gap-3 sm:grid-cols-2">{protocols.map(p=><article key={p.id} className="rounded-xl border p-4 space-y-2"><h3 className="font-semibold">{p.name}</h3><p className="text-sm text-muted-foreground">{p.instructions}</p><p className="text-xs">{p.attempts} essais · {p.aggregation==='SUCCESS_COUNT'?'réussites cumulées':'meilleur essai'} · {p.direction==='LOWER'?'plus petite mesure':'plus grande mesure'} · {p.unit}</p>{editing?<div className="space-y-2"><label className="block text-xs">Nom<input className="mt-1 w-full rounded border bg-background p-2" value={p.name} onChange={e=>update(p.id,'name',e.target.value)}/></label><label className="block text-xs">Consignes<textarea className="mt-1 w-full rounded border bg-background p-2" value={p.instructions} onChange={e=>update(p.id,'instructions',e.target.value)}/></label><div className="grid grid-cols-2 gap-2"><label className="text-xs">Catégorie<select className="mt-1 w-full rounded border bg-background p-2" value={p.category} onChange={e=>update(p.id,'category',e.target.value)}><option value="TECHNICAL">Technique</option><option value="PHYSICAL">Physique</option></select></label><label className="text-xs">Mesure<select className="mt-1 w-full rounded border bg-background p-2" value={p.direction} onChange={e=>update(p.id,'direction',e.target.value)}><option value="HIGHER">Plus grand = mieux</option><option value="LOWER">Plus petit = mieux</option></select></label></div><label className="block text-xs">Calcul du résultat<select className="mt-1 w-full rounded border bg-background p-2" value={p.aggregation} onChange={e=>update(p.id,'aggregation',e.target.value)}><option value="SUCCESS_COUNT">Nombre d’essais réussis (0 ou 1)</option><option value="BEST">Meilleur essai mesuré</option></select></label><div className="grid grid-cols-2 gap-2"><label className="text-xs">Unité<input className="mt-1 w-full rounded border bg-background p-2" value={p.unit} onChange={e=>update(p.id,'unit',e.target.value)}/></label>{([['attempts','Essais'],['baseline','Départ'],['target','Objectif']] as const).map(([key,label])=><label key={key} className="text-xs">{label}<input className="mt-1 w-full rounded border bg-background p-2" type="number" min="0" step={key==='attempts'?'1':'0.1'} value={p[key]} onChange={e=>update(p.id,key,e.target.value)}/></label>)}</div><Button type="button" variant="ghost" size="sm" disabled={protocols.length<=1} onClick={()=>setProtocols(rows=>rows.filter(row=>row.id!==p.id))}>Retirer ce protocole</Button></div>:<p className="text-sm">Départ : <strong>{p.baseline} {p.unit}</strong> · Objectif : <strong>{p.target} {p.unit}</strong></p>}</article>)}</div>
      {editing&&<div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={()=>setProtocols(rows=>[...rows,{id:`protocole-${Date.now()}`,name:'Nouveau protocole',instructions:'Décrivez ici la préparation, le geste et ce qui est compté.',category:'TECHNICAL',unit:'réussites',aggregation:'SUCCESS_COUNT',attempts:10,direction:'HIGHER',baseline:0,target:8}])}>Ajouter un protocole</Button><Button type="button" disabled={saving} onClick={saveSettings}>{saving?'Enregistrement…':'Enregistrer les barèmes'}</Button></div>}
    </section>
    <form onSubmit={submit} className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4 print:hidden"><h2 className="text-xl font-semibold">Saisir un relevé</h2><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Joueur<select required className="mt-1 w-full min-h-11 rounded-lg border bg-background px-3" value={playerId} onChange={e=>setPlayerId(e.target.value)}><option value="">Choisir un joueur</option>{players.map((p:any)=><option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></label><label className="text-sm">Protocole<select className="mt-1 w-full min-h-11 rounded-lg border bg-background px-3" value={protocolId} onChange={e=>setProtocolId(e.target.value)}>{protocols.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
      {protocol&&<><p className="text-sm text-muted-foreground">{protocol.instructions}</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{attempts.map((value,index)=><label key={`${protocol.id}-${index}`} className="text-sm">Essai {index+1}<input required type="number" inputMode="decimal" min="0" max={protocol.aggregation==='SUCCESS_COUNT'?1:undefined} step={protocol.aggregation==='SUCCESS_COUNT'?'1':'0.01'} className="mt-1 w-full min-h-11 rounded-lg border bg-background px-3" value={value} onChange={e=>setAttempts(previous=>previous.map((v,i)=>i===index?e.target.value:v))}/></label>)}</div><p className="text-xs text-muted-foreground">{protocol.aggregation==='SUCCESS_COUNT'?'1 = réussi, 0 = manqué.':'Saisissez la mesure de chaque essai en '+protocol.unit+'.'} Les essais et le barème sont archivés avec le résultat.</p></>}
      <Button type="submit" disabled={!protocol||!playerId||recording}>{recording?'Enregistrement…':'Enregistrer ce relevé'}</Button>
      {lastResult&&<p role="status" className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">Relevé enregistré : {lastResult.raw} {lastResult.protocol.unit} · {lastResult.score}/10 selon le barème du jour.</p>}
    </form>
    <p className="hidden print:block text-sm">Joueur : ________________________ Date : __________ Entraîneur : ________________________</p>
  </main>
}
