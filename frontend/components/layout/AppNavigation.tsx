'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { TeamSelector } from '@/components/team/TeamSelector';
import { UserMenu } from '@/components/layout/UserMenu';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Home, Users, Trophy, ClipboardList, Dumbbell, Video } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Tactique', icon: <Home className="h-4 w-4" /> },
  { href: '/players', label: 'Joueurs', icon: <Users className="h-4 w-4" /> },
  { href: '/team', label: 'Équipe', icon: <Trophy className="h-4 w-4" /> },
  { href: '/evaluation', label: 'Évaluation', icon: <ClipboardList className="h-4 w-4" /> },
  { href: '/training', label: 'Entraînement', icon: <Dumbbell className="h-4 w-4" /> },
  { href: '/exercises', label: 'Exercices', icon: <Video className="h-4 w-4" /> },
];

export function AppNavigation() {
  const pathname = usePathname();
  const { currentTeamId, setCurrentTeamId } = useTeam();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm md:text-lg">🏐</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground hidden sm:block">
              VolleyCoaching
            </h1>
          </div>

          {/* Navigation centrale */}
          <nav className="hidden md:flex items-center space-x-2">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href} className={active ? '' : 'cursor-pointer'}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    disabled={active}
                    className={active ? 'cursor-default' : 'cursor-pointer'}
                  >
                    {link.icon}
                    <span className="ml-2">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Navigation mobile */}
          <nav className="flex md:hidden items-center space-x-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href} className={active ? '' : 'cursor-pointer'}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="icon"
                    disabled={active}
                    className={active ? 'cursor-default' : 'cursor-pointer'}
                  >
                    {link.icon}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Menu + Team Selector + Theme Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <TeamSelector
                currentTeamId={currentTeamId}
                onTeamChange={setCurrentTeamId}
              />
            </div>
            <UserMenu />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
