'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { AstrenMark } from '@/components/layout/AstrenMark';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
function LoginForm() {
 const [emailOrUsername,setEmailOrUsername]=useState('');const [password,setPassword]=useState('');const [visible,setVisible]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const {login}=useAuth();const router=useRouter();const searchParams=useSearchParams();
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{await login(emailOrUsername,password);const redirect=searchParams?.get('redirect') || '/team';router.push(redirect.startsWith('/')&&!redirect.startsWith('//')?redirect:'/team');}catch{setError('Connexion impossible. Vérifiez votre identifiant et votre mot de passe.');setBusy(false);}}
 return <main className="astren-auth">
   <div className="astren-auth-theme"><ThemeToggle/></div>
   <div className="astren-auth-layout">
    <section className="astren-auth-story"><AstrenMark/><p className="astren-eyebrow">Astren Orison · VolleyCoaching</p><h1>Le talent s’éveille.<br/><em>Le collectif se construit.</em></h1><p>Un espace pour préparer vos séances, accompagner chaque joueur et donner forme à votre jeu.</p><div className="astren-auth-notes"><span>01 · Préparer</span><span>02 · Observer</span><span>03 · Progresser</span></div></section>
    <section className="astren-auth-card" aria-labelledby="login-title"><p className="astren-eyebrow">Votre espace de coaching</p><h2 id="login-title">Heureux de vous retrouver.</h2><p className="text-muted-foreground text-sm mb-7">Retrouvez votre équipe et préparez la suite.</p>
    <form onSubmit={submit} className="space-y-5">
     <div><label htmlFor="emailOrUsername">E-mail ou identifiant</label><input id="emailOrUsername" autoComplete="username" value={emailOrUsername} onChange={e=>setEmailOrUsername(e.target.value)} required disabled={busy} placeholder="Votre identifiant"/></div>
     <div><label htmlFor="password">Mot de passe</label><div className="relative"><input id="password" type={visible?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required disabled={busy} className="pr-12"/><button type="button" className="astren-password-toggle" aria-label={visible?'Masquer le mot de passe':'Afficher le mot de passe'} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
     {error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
     <Button type="submit" className="w-full h-12" disabled={busy}>{busy?<><LoaderCircle className="animate-spin"/>Connexion…</>:<>Entrer dans mon espace<ArrowRight/></>}</Button>
    </form><div className="astren-auth-footer">Votre premier entraînement ici ? <Link href="/signup">Créer un espace</Link></div><Link href="/presentation" className="text-sm text-muted-foreground underline underline-offset-4">Découvrir l’atelier de coaching</Link></section>
   </div>
 </main>;
}
export default function LoginPage(){return <Suspense fallback={<main className="astren-auth">Chargement de votre espace…</main>}><LoginForm/></Suspense>;}
