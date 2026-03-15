'use client';

import { ApolloProvider } from '@apollo/client';
import apolloClient from '@/lib/apolloClient';
import React from 'react';

/**
 * Apollo Client Provider Wrapper
 * Must be a client component to use ApolloProvider
 */
export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
