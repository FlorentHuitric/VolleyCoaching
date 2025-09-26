-- Initialisation de la base de données VolleyCoaching
-- Ce script s'exécute automatiquement lors du premier démarrage de PostgreSQL

-- Création des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Index pour les recherches textuelles rapides
CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(to_tsvector('french', firstName || ' ' || lastName));
CREATE INDEX IF NOT EXISTS idx_teams_search ON teams USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_exercises_search ON exercises USING gin(to_tsvector('french', name || ' ' || description));

-- Configuration des permissions
GRANT ALL PRIVILEGES ON DATABASE volleycoaching TO volleyuser;