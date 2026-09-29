import { rosterWhere } from '../utils/roster';
import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { PrismaClient, Position } from '@prisma/client';
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
    const positions = input.positions as any;
    if (!Array.isArray(positions) || positions.length>6 || positions.some(p=>!p || !Number.isInteger(p.courtPosition) || p.courtPosition<1 || p.courtPosition>6 || !Object.values(Position).includes(p.position)) || new Set(positions.map(p=>p.courtPosition)).size!==positions.length) throw new Error('Composition invalide.');
    const ids=positions.filter(p=>p.player).map(p=>p.player.id);
    if(ids.some(id=>typeof id!=='string') || new Set(ids).size!==ids.length || await this.prisma.player.count({where:{id:{in:ids},...rosterWhere(input.teamId)}})!==ids.length)throw new Error('Chaque joueur doit appartenir à cette équipe et occuper une seule place.');
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM teams WHERE id = ${input.teamId} FOR UPDATE`;
    // Deactivate all other lineups for this team
    await tx.lineup.updateMany({
      where: {
        teamId: input.teamId,
        isActive: true
      },
      data: { isActive: false }
    });

    // Create or update the active lineup
    const existing = await tx.lineup.findFirst({
      where: {
        teamId: input.teamId,
        name: input.name || 'Default Lineup'
      }
    });

    if (existing) {
      return tx.lineup.update({
        where: { id: existing.id },
        data: {
          positions: input.positions,
          isActive: true,
          updatedAt: new Date()
        }
      });
    }

    return tx.lineup.create({
      data: {
        teamId: input.teamId,
        name: input.name || 'Default Lineup',
        positions: input.positions,
        isActive: true
      }
    });
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
