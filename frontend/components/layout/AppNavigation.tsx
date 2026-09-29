'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { TeamSelector } from '@/components/team/TeamSelector';
import { UserMenu } from '@/components/layout/UserMenu';
import { useTeam } from '@/contexts/TeamContext';
import { AstrenMark } from './AstrenMark';
import { Home, Users, Trophy, ClipboardList, Dumbbell, Video } from 'lucide-react';
const links = [
  { href: '/', label: 'Tactique', icon: Home },
  { href: '/team', label: 'Mon équipe', icon: Trophy },
  { href: '/players', label: 'Joueurs', icon: Users },
  { href: '/training', label: 'Séances', icon: Dumbbell },
  { href: '/evaluation', label: 'Évaluations', icon: ClipboardList },
  { href: '/exercises', label: 'Exercices', icon: Video },
];
export function AppNavigation() {
  const pathname = usePathname();
  const { currentTeamId, setCurrentTeamId } = useTeam();
  return <header className="astren-header">
    <a href="#workspace" className="astren-skip">Aller au contenu</a>
    <div className="astren-topbar">
      <Link href="/team" className="astren-brand" aria-label="VolleyCoaching · mon équipe">
        <AstrenMark /><span>Volley<span className="font-normal">Coaching</span><small>Astren Orison · l’atelier du collectif</small></span>
      </Link>
      <div className="astren-header-actions"><ThemeToggle /><UserMenu /></div>
    </div>
    <div className="astren-navrow">
      <nav aria-label="Navigation principale" className="astren-nav">
        {links.map(({href,label,icon:Icon}) => <Link key={href} href={href} aria-current={(href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'page' : undefined}><Icon size={17}/><span>{label}</span></Link>)}
      </nav>
      <div className="astren-team"><span className="astren-eyebrow">Équipe active</span><TeamSelector currentTeamId={currentTeamId} onTeamChange={setCurrentTeamId}/></div>
    </div>
    <div id="workspace" tabIndex={-1}/>
  </header>;
}
