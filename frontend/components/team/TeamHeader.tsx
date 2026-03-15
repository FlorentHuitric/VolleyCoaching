'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TeamHeaderProps {
  teamName?: string;
  teamSelector?: React.ReactNode;
}

export function TeamHeader({ teamName, teamSelector }: TeamHeaderProps) {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            {teamName && (
              <h1 className="text-xl font-bold text-foreground">
                {teamName}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            {teamSelector}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
