'use client';

import { ThemeProvider } from "@/components/theme-provider";
import { ApolloWrapper } from "@/components/ApolloWrapper";
import { TeamProvider } from "@/contexts/TeamContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Toaster } from "sonner";

/**
 * Client-side providers wrapper
 * Must be a client component to use React Context
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ApolloWrapper>
        <TeamProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </TeamProvider>
      </ApolloWrapper>
    </AuthProvider>
  );
}
