'use client';

import { useEffect, useState } from 'react';

export default function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="volleyball-court relative mx-auto bg-muted/20 rounded-lg shadow-xl transition-all duration-200 flex items-center justify-center"
        style={{
          width: 900,
          height: 450,
        }}
      >
        <div className="text-muted-foreground text-lg font-medium animate-pulse">
          Chargement du terrain...
        </div>
      </div>
    );
  }

  return <div suppressHydrationWarning={true}>{children}</div>;
}