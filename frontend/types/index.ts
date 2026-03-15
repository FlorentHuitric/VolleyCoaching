/**
 * CENTRALIZED TYPE EXPORTS
 * 
 * This file re-exports all types from their single source of truth locations.
 * Always import types from this file to maintain consistency.
 * 
 * Example:
 *   ❌ DON'T: import { PlayerProfile } from './types/player-evaluation'
 *   ✅ DO:    import { PlayerType } from '@/types'
 */

// Player types (Single Source of Truth)
export * from './player';
export type { PlayerType as PlayerProfile } from './player'; // Alias for backward compatibility

// Evaluation test types
export * from './evaluation-tests';

// Exercise types (if needed, import specific types to avoid conflicts)
// export * from './exercises';
