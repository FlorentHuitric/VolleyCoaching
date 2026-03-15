import { injectable, inject } from 'tsyringe';
import { PrismaClient, Team, TeamLevel } from '@prisma/client';

@injectable()
export class TeamService {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  async createTeam(data: {
    name: string;
    description?: string;
    level?: TeamLevel;
    season?: string;
    avatar?: string;
    coachId: string;
    orgId: string;
  }): Promise<Team> {
    return this.prisma.team.create({
      data: {
        ...data,
        level: data.level || TeamLevel.SENIOR,
      },
      include: {
        coach: true,
        players: true,
      },
    });
  }

  async getTeamById(id: string): Promise<Team | null> {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        players: {
          include: {
            evaluations: {
              where: { isCurrent: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async getTeamsByOrganization(orgId: string): Promise<Team[]> {
    return this.prisma.team.findMany({
      where: { orgId },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { players: true },
        },
      },
    });
  }

  async updateTeam(id: string, data: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Team> {
    return this.prisma.team.update({
      where: { id },
      data,
    });
  }

  async deleteTeam(id: string): Promise<Team> {
    return this.prisma.team.delete({ where: { id } });
  }
}
