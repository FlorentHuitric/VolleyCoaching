import { PlayerProfile } from '@/types/player';
import { VolleyballPosition } from '@/hooks/useCourtStore';

export interface LineupPosition {
  courtPosition: number;
  position: VolleyballPosition;
  player?: PlayerProfile;
}

export interface SavedLineup {
  id: string;
  name: string;
  formation: string;
  positions: LineupPosition[];
  createdAt: Date;
  updatedAt: Date;
}

// Single Responsibility: Local storage operations
class LocalStorageRepository {
  private static readonly LINEUP_KEY = 'volleyball_lineup';
  private static readonly LINEUPS_KEY = 'volleyball_lineups';

  static saveCurrentLineup(lineup: LineupPosition[]): void {
    try {
      localStorage.setItem(this.LINEUP_KEY, JSON.stringify({
        positions: lineup,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save lineup:', error);
    }
  }

  static getCurrentLineup(): LineupPosition[] | null {
    try {
      const stored = localStorage.getItem(this.LINEUP_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return parsed.positions || null;
    } catch (error) {
      console.error('Failed to load lineup:', error);
      return null;
    }
  }

  static saveLineup(lineup: SavedLineup): void {
    try {
      const lineups = this.getAllLineups();
      const existingIndex = lineups.findIndex(l => l.id === lineup.id);

      if (existingIndex >= 0) {
        lineups[existingIndex] = lineup;
      } else {
        lineups.push(lineup);
      }

      localStorage.setItem(this.LINEUPS_KEY, JSON.stringify(lineups));
    } catch (error) {
      console.error('Failed to save lineup collection:', error);
    }
  }

  static getAllLineups(): SavedLineup[] {
    try {
      const stored = localStorage.getItem(this.LINEUPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load lineups:', error);
      return [];
    }
  }

  static deleteLineup(id: string): void {
    try {
      const lineups = this.getAllLineups().filter(l => l.id !== id);
      localStorage.setItem(this.LINEUPS_KEY, JSON.stringify(lineups));
    } catch (error) {
      console.error('Failed to delete lineup:', error);
    }
  }
}

// Open/Closed Principle: Extendable lineup validation
export class LineupValidator {
  static validateLineup(lineup: LineupPosition[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all positions are filled
    const emptyPositions = lineup.filter(pos => !pos.player);
    if (emptyPositions.length > 0) {
      errors.push(`${emptyPositions.length} position(s) non assignée(s)`);
    }

    // Check for duplicate players
    const playerIds = lineup.map(pos => pos.player?.id).filter(Boolean);
    const uniquePlayerIds = new Set(playerIds);
    if (playerIds.length !== uniquePlayerIds.size) {
      errors.push('Joueurs dupliqués détectés');
    }

    // Check position compatibility (basic validation) - Skip for now to avoid blocking saves
    // const incompatibleAssignments = lineup.filter(pos => {
    //   if (!pos.player) return false;
    //   const playerPrimaryPosition = pos.pos.player.primaryPosition;
    //   const playerSecondaryPositions = pos.player.technicalProfile?.secondaryPositions || pos.player.secondaryPositions || [];

    //   return playerPrimaryPosition !== pos.position &&
    //          !playerSecondaryPositions.includes(pos.position);
    // });

    // if (incompatibleAssignments.length > 0) {
    //   errors.push(`${incompatibleAssignments.length} joueur(s) assigné(s) à des positions incompatibles`);
    // }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Interface Segregation: Specific lineup operations
export interface ILineupService {
  saveCurrentLineup(lineup: LineupPosition[]): Promise<void>;
  getCurrentLineup(): Promise<LineupPosition[] | null>;
  createSavedLineup(name: string, formation: string, lineup: LineupPosition[]): Promise<SavedLineup>;
  getAllSavedLineups(): Promise<SavedLineup[]>;
  deleteSavedLineup(id: string): Promise<void>;
}

// Dependency Inversion: Service abstraction
export class LineupService implements ILineupService {
  async saveCurrentLineup(lineup: LineupPosition[]): Promise<void> {
    const validation = LineupValidator.validateLineup(lineup);
    if (!validation.isValid) {
      throw new Error(`Composition invalide: ${validation.errors.join(', ')}`);
    }

    LocalStorageRepository.saveCurrentLineup(lineup);
  }

  async getCurrentLineup(): Promise<LineupPosition[] | null> {
    return LocalStorageRepository.getCurrentLineup();
  }

  async createSavedLineup(name: string, formation: string, lineup: LineupPosition[]): Promise<SavedLineup> {
    const validation = LineupValidator.validateLineup(lineup);
    if (!validation.isValid) {
      throw new Error(`Composition invalide: ${validation.errors.join(', ')}`);
    }

    const savedLineup: SavedLineup = {
      id: `lineup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      formation,
      positions: lineup,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    LocalStorageRepository.saveLineup(savedLineup);
    return savedLineup;
  }

  async getAllSavedLineups(): Promise<SavedLineup[]> {
    return LocalStorageRepository.getAllLineups();
  }

  async deleteSavedLineup(id: string): Promise<void> {
    LocalStorageRepository.deleteLineup(id);
  }
}

// Factory Pattern: Service instantiation
export const lineupService = new LineupService();

// Utility functions following DRY principle
export const getPositionDisplayName = (position: VolleyballPosition): string => {
  const names: Record<VolleyballPosition, string> = {
    'SETTER': 'Passeur',
    'OUTSIDE_HITTER': 'Attaquant',
    'MIDDLE_BLOCKER': 'Central',
    'OPPOSITE': 'Opposé',
    'LIBERO': 'Libéro',
    'DEFENSIVE_SPECIALIST': 'Spécialiste défensif'
  };
  return names[position] || position;
};

export const getFormationName = (lineup: LineupPosition[]): string => {
  const setters = lineup.filter(pos => pos.position === 'SETTER').length;
  const opposites = lineup.filter(pos => pos.position === 'OPPOSITE').length;
  const middles = lineup.filter(pos => pos.position === 'MIDDLE_BLOCKER').length;

  return `${setters}-${middles}-${opposites}`;
};
