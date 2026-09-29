'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppNavigation } from '@/components/layout/AppNavigation';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
 const { user, getAccessToken, logout } = useAuth();
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();const data=new FormData(event.currentTarget);setError('');
  if(data.get('newPassword')!==data.get('confirmPassword')){setError('Les deux nouveaux mots de passe sont différents.');return}
  setBusy(true);
  try {
   const response=await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${getAccessToken()}`},body:JSON.stringify({query:'mutation ChangePassword($currentPassword: String!, $newPassword: String!) { changePassword(currentPassword: $currentPassword, newPassword: $newPassword) }',variables:{currentPassword:data.get('currentPassword'),newPassword:data.get('newPassword')}})});
   const result=await response.json();if(result.errors||!result.data?.changePassword)throw new Error(result.errors?.[0]?.message||'Modification impossible.');
   logout();
  }catch(e){setError(e instanceof Error?e.message:'Erreur de connexion.')}finally{setBusy(false)}
 }
 return <ProtectedRoute><AppNavigation/><main className="max-w-xl mx-auto p-6 space-y-6"><h1 className="text-3xl font-bold">Mon compte</h1><p>{user?.firstName} {user?.lastName} · {user?.email}</p><form onSubmit={submit} className="rounded-xl border p-6 space-y-5"><h2 className="text-xl font-semibold">Changer mon mot de passe</h2><p className="text-sm text-muted-foreground">Choisissez entre 12 et 72 caractères. Après la modification, reconnectez-vous avec le nouveau mot de passe.</p>{[['currentPassword','Mot de passe actuel','current-password'],['newPassword','Nouveau mot de passe','new-password'],['confirmPassword','Confirmer le nouveau mot de passe','new-password']].map(([name,label,autocomplete])=><label className="block space-y-2" key={name}><span>{label}</span><input className="w-full rounded-md border bg-background px-3 py-2" name={name} type="password" autoComplete={autocomplete} required minLength={name==='currentPassword'?1:12} maxLength={72}/></label>)}{error&&<p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}<Button disabled={busy} type="submit">{busy?'Enregistrement…':'Modifier mon mot de passe'}</Button></form></main></ProtectedRoute>;
}
