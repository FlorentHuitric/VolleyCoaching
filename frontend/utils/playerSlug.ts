/**
 * Player slug utilities for URL-friendly routes
 * Generates slugs like: /players/elena-phoenix
 */

import { PlayerProfile } from '@/types/player-evaluation';

/**
 * Generate URL-friendly slug from player name
 * @example generatePlayerSlug('Elena', 'Phoenix') => 'elena-phoenix'
 */
export function generatePlayerSlug(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate slug from PlayerProfile
 */
export function getPlayerSlug(player: PlayerProfile): string {
  return generatePlayerSlug(player.firstName, player.lastName);
}

/**
 * Find player by slug from array of players
 */
export function findPlayerBySlug(players: PlayerProfile[], slug: string): PlayerProfile | undefined {
  return players.find(p => getPlayerSlug(p) === slug);
}

/**
 * Parse slug back to names (for display purposes)
 * @example parsePlayerSlug('elena-phoenix') => { firstName: 'Elena', lastName: 'Phoenix' }
 */
export function parsePlayerSlug(slug: string): { firstName: string; lastName: string } {
  const parts = slug.split('-');
  if (parts.length < 2) {
    return { firstName: '', lastName: '' };
  }

  // Simple heuristic: first part is firstName, rest is lastName
  const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const lastName = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-');

  return { firstName, lastName };
}
