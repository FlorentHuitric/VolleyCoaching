import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { Lineup, SaveLineupInput } from '../types/Lineup.types';

@injectable()
@Resolver(() => Lineup)
export class LineupResolver {
  constructor(
    @inject(PrismaClient) private prisma: PrismaClient
  ) {}

  @Query(() => Lineup, { nullable: true, description: 'Get active lineup for a team' })
  async activeLineup(@Arg('teamId', () => ID) teamId: string): Promise<Lineup | null> {
    return this.prisma.lineup.findFirst({
      where: {
        teamId,
        isActive: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  @Query(() => [Lineup], { description: 'Get all lineups for a team' })
  async teamLineups(@Arg('teamId', () => ID) teamId: string): Promise<Lineup[]> {
    return this.prisma.lineup.findMany({
      where: { teamId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  @Mutation(() => Lineup, { description: 'Save a lineup (creates or updates)' })
  async saveLineup(@Arg('input', () => SaveLineupInput) input: SaveLineupInput): Promise<Lineup> {
    // Deactivate all other lineups for this team
    await this.prisma.lineup.updateMany({
      where: {
        teamId: input.teamId,
        isActive: true
      },
      data: { isActive: false }
    });

    // Create or update the active lineup
    const existing = await this.prisma.lineup.findFirst({
      where: {
        teamId: input.teamId,
        name: input.name || 'Default Lineup'
      }
    });

    if (existing) {
      return this.prisma.lineup.update({
        where: { id: existing.id },
        data: {
          positions: input.positions,
          isActive: true,
          updatedAt: new Date()
        }
      });
    }

    return this.prisma.lineup.create({
      data: {
        teamId: input.teamId,
        name: input.name || 'Default Lineup',
        positions: input.positions,
        isActive: true
      }
    });
  }

  @Mutation(() => Boolean, { description: 'Delete a lineup' })
  async deleteLineup(@Arg('id', () => ID) id: string): Promise<boolean> {
    await this.prisma.lineup.delete({
      where: { id }
    });
    return true;
  }
}
