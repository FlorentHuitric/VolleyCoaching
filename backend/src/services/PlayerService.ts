import { assessmentUpdate } from '../utils/assessment';
import { rosterWhere } from '../utils/roster';
import { injectable, inject } from 'tsyringe';
import { PrismaClient, Prisma, Player, PlayerStatus, ContractLevel, Position } from '@prisma/client';
import { RedisService } from './RedisService';

/**
 * Player Service
 * Handles all business logic related to players
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles player operations
 * - Open/Closed: Can be extended without modification
 * - Liskov Substitution: Can be replaced by mock for testing
 * - Interface Segregation: Focused interface
 * - Dependency Inversion: Depends on PrismaClient abstraction
 */
@injectable()
export class PlayerService {
  constructor(
    @inject(PrismaClient) private prisma: PrismaClient,
    @inject(RedisService) private redis: RedisService
  ) {}

  /**
   * Create a new player
   */
  async createPlayer(data: {
    experienceLevel?: string;
    notes?: string;
    medicalNotes?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date | null;
    nationality: string;
    primaryPosition: Position;
    jerseyNumber?: number | null;
    teamId: string;
    orgId: string;
    email?: string;
    phone?: string;
    avatar?: string;
    secondaryPosition?: Position;
    dominantHand?: string;
    yearsOfExperience?: number;
    height?: number;
    weight?: number;
    armReach?: number;
    wingspan?: number;
    status?: PlayerStatus;
    contractLevel?: ContractLevel;
  }): Promise<Player> {
    // Validate jersey number uniqueness within team
    const existing = data.jerseyNumber == null ? null : await this.prisma.player.findUnique({
      where: {
        teamId_jerseyNumber: {
          teamId: data.teamId,
          jerseyNumber: data.jerseyNumber,
        },
      },
    });

    if (existing) {
      throw new Error(`Jersey number ${data.jerseyNumber} is already taken in this team`);
    }

    const player = await this.prisma.player.create({
      data: {
        ...data,
        status: data.status || PlayerStatus.ACTIVE,
        contractLevel: data.contractLevel || ContractLevel.TRIAL,
        dominantHand: data.dominantHand || 'right',
        yearsOfExperience: data.yearsOfExperience || 0,
      },
      include: {
        team: true,
        evaluations: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    });

    await this.redis.invalidatePattern(`players:team:${data.teamId}`);
    return player;
  }

  /**
   * Get player by ID
   * ✨ Now returns current stats from Player table + evaluation history
   */
  async getPlayerById(id: string): Promise<Player | null> {
    return this.prisma.player.findUnique({
      where: { id },
      include: {
        team: true,
        // Keep evaluations for history/arrows, but current stats come from Player table
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 5, // Last 5 evaluations for history
        },
        performanceMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        developmentPlans: {
          where: { status: 'ACTIVE' },
        },
      },
    });
  }

  /**
   * Get all players for a team
   * ✨ Returns current stats from Player table
   */
  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    const cacheKey = `players:team:${teamId}`;
    // Player evaluations must be visible immediately; avoid a stale JSON snapshot.

    const players = await this.prisma.player.findMany({
      where: rosterWhere(teamId),
      include: {
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 2,
        },
      },
      orderBy: [
        { contractLevel: 'desc' },
        { jerseyNumber: 'asc' },
      ],
    });


    return players;
  }

  /**
   * Get all players for an organization
   * ✨ Returns current stats from Player table
   */
  async getPlayersByOrganization(orgId: string): Promise<Player[]> {
    return this.prisma.player.findMany({
      where: { orgId },
      include: {
        team: true,
        // Include recent evaluations for stat change arrows
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 2,
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  /**
   * Update player information
   */
  async updatePlayer(
    id: string,
    data: Partial<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>> & { assessment?: unknown }
  ): Promise<Player> {
    // If jersey number is being updated, validate uniqueness
    if (data.jerseyNumber) {
      const player = await this.prisma.player.findUnique({ where: { id } });
      if (!player) {
        throw new Error('Player not found');
      }

      if (data.jerseyNumber !== player.jerseyNumber) {
        const existing = await this.prisma.player.findUnique({
          where: {
            teamId_jerseyNumber: {
              teamId: player.teamId,
              jerseyNumber: data.jerseyNumber,
            },
          },
        });

        if (existing && existing.id !== id) {
          throw new Error(`Jersey number ${data.jerseyNumber} is already taken in this team`);
        }
      }
    }

    const updated = await this.prisma.player.update({
      where: { id },
      data: await this.profileUpdate(id, data),
      include: {
        team: true,
        evaluations: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    });

    await Promise.all([updated.teamId,...updated.rosterTeamIds].map(id=>this.redis.invalidatePattern(`players:team:${id}`)));
    return updated;
  }

  private async profileUpdate(id: string, data: Partial<Player> & { assessment?: unknown }): Promise<Prisma.PlayerUncheckedUpdateInput> {
    const {assessment, ...fields}=data;
    const player=await this.prisma.player.findUniqueOrThrow({where:{id}});
    return {...fields, ...(assessment!=null?assessmentUpdate(player,assessment):{})} as Prisma.PlayerUncheckedUpdateInput;
  }

  /**
   * Delete player (soft delete by setting status to INACTIVE)
   */
  async deletePlayer(id: string): Promise<Player> {
    return this.prisma.player.update({
      where: { id },
      data: { status: PlayerStatus.INACTIVE },
    });
  }

  /**
   * Search players by name
   */
  async searchPlayers(query: string, orgId: string): Promise<Player[]> {
    return this.prisma.player.findMany({
      where: {
        orgId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        team: true,
        evaluations: {
          where: { isCurrent: true },
          take: 1,
        },
      },
      take: 20,
    });
  }

  /**
   * Get players by position
   */
  async getPlayersByPosition(position: Position, teamId: string): Promise<Player[]> {
    return this.prisma.player.findMany({
      where: {
        AND: [rosterWhere(teamId)],
        OR: [
          { primaryPosition: position },
          { secondaryPosition: position },
        ],
      },
      include: {
        evaluations: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    });
  }

  /**
   * Get players by status
   */
  async getPlayersByStatus(status: PlayerStatus, teamId: string): Promise<Player[]> {
    return this.prisma.player.findMany({
      where: { ...rosterWhere(teamId), status },
      include: {
        evaluations: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    });
  }

  /**
   * Get available players (ACTIVE status)
   */
  async getAvailablePlayers(teamId: string): Promise<Player[]> {
    return this.getPlayersByStatus(PlayerStatus.ACTIVE, teamId);
  }
}
