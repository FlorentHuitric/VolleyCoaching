import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone pour Docker
  output: 'standalone',

  // Ignorer ESLint au build (erreurs non-bloquantes)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Vérifier les types avant toute mise en production
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuration optimisée pour le hot reload
  experimental: {
    // Optimisation des imports
    optimizePackageImports: ['@dnd-kit/core', '@dnd-kit/modifiers', 'lucide-react'],
  },

  // Configuration Turbopack moderne
  turbopack: {
    // Résolution d'alias pour éviter les conflits
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },

  // Configuration webpack pour le fallback
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configuration de polling pour WSL/Docker
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };

      // Désactiver le cache persistant qui peut causer des problèmes
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
