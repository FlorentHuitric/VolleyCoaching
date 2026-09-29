import { rosterWhere } from '../utils/roster';
import { Resolver, Query, Mutation, Arg, ID, FieldResolver, Root, UseMiddleware } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { GraphQLError } from 'graphql';
const ForbiddenError = class extends GraphQLError { constructor(msg: string) { super(msg, { extensions: { code: 'FORBIDDEN' } }); } };
import { TeamService } from '../services/TeamService';
import { Team, TeamWithPlayers, SimplePlayer } from '../types/Team.types';
import { CreateTeamInput, UpdateTeamInput } from '../types/TeamInputs';
import { PrismaClient } from '@prisma/client';
import { Authenticated, CurrentUserId, RequireCoach } from '../utils/auth.decorators';
import { AuthService } from '../services/auth.service';

@injectable()
@Resolver(() => Team)
export class TeamResolver {
  constructor(
    @inject(TeamService) private teamService: TeamService,
    @inject(PrismaClient) private prisma: PrismaClient,
    @inject(AuthService) private authService: AuthService
  ) {}

  // Queries
  @UseMiddleware(Authenticated())
  @Query(() => Team, { nullable: true, description: 'Get a team by ID' })
  async team(
    @Arg('id', () => ID) id: string,
    @CurrentUserId() userId: string
  ): Promise<Team | null> {
    // Verify user owns this team
    const hasAccess = await this.authService.validateUserOwnsTeam(userId, id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this team');
    }
    return this.teamService.getTeamById(id);
  }

  @UseMiddleware(Authenticated())
  @Query(() => [Team], { description: 'Get all teams by organization (requires same org)' })
  async teamsByOrganization(
    @Arg('orgId', () => ID) orgId: string,
    @CurrentUserId() userId: string
  ): Promise<Team[]> {
    // Verify user belongs to the same organization
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.orgId !== orgId) {
      throw new ForbiddenError('You do not have access to teams in this organization');
    }
    return this.teamService.getTeamsByOrganization(orgId);
  }

  @UseMiddleware(Authenticated())
  @Query(() => [Team], { description: 'Get all teams for the current coach' })
  async myTeams(@CurrentUserId() userId: string): Promise<Team[]> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.prisma.team.findMany({
      where: user.role === "ADMIN" ? { orgId: user.orgId } : { coachId: userId },
      include: {
        _count: {
          select: { players: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  @UseMiddleware(Authenticated())
  @Query(() => TeamWithPlayers, { nullable: true, description: 'Get a team with its players' })
  async teamWithPlayers(
    @Arg('id', () => ID) id: string,
    @CurrentUserId() userId: string
  ): Promise<TeamWithPlayers | null> {
    // Verify user owns this team
    const hasAccess = await this.authService.validateUserOwnsTeam(userId, id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this team');
    }

    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            jerseyNumber: true,
            primaryPosition: true,
            currentRating: true,
          },
        },
      },
    });

    if (!team) return null;

    return {
      ...team,
      players: await this.prisma.player.findMany({where: rosterWhere(id)}),
    };
  }

  // Mutations
  @UseMiddleware(RequireCoach())
  @Mutation(() => Team, { description: 'Create a new team' })
  async createTeam(
    @Arg('input', () => CreateTeamInput) input: CreateTeamInput,
    @CurrentUserId() userId: string
  ): Promise<Team> {
    // Automatically set the current user as the coach
    return this.teamService.createTeam({ ...input, coachId: userId });
  }

  @UseMiddleware(RequireCoach())
  @Mutation(() => Team, { description: 'Update a team' })
  async updateTeam(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateTeamInput) input: UpdateTeamInput,
    @CurrentUserId() userId: string
  ): Promise<Team> {
    // Verify user owns this team
    const hasAccess = await this.authService.validateUserOwnsTeam(userId, id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this team');
    }
    return this.teamService.updateTeam(id, input);
  }

  @UseMiddleware(RequireCoach())
  @Mutation(() => Boolean, { description: 'Delete a team' })
  async deleteTeam(
    @Arg('id', () => ID) id: string,
    @CurrentUserId() userId: string
  ): Promise<boolean> {
    // Verify user owns this team
    const hasAccess = await this.authService.validateUserOwnsTeam(userId, id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this team');
    }
    await this.teamService.deleteTeam(id);
    return true;
  }

  // Field Resolvers
  @FieldResolver(() => Number)
  async playerCount(@Root() team: Team): Promise<number> {
    const count = await this.prisma.player.count({
      where: rosterWhere(team.id),
    });
    return count;
  }

  @FieldResolver(() => Number, { nullable: true })
  async teamProgression(@Root() team: Team): Promise<number | null> {
    // Get all players with their evaluations
    const players = await this.prisma.player.findMany({
      where: { teamId: team.id },
      include: {
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 2, // Get last 2 evaluations per player
        },
      },
    });

    if (players.length === 0) {
      return 0;
    }

    let totalProgression = 0;
    let playersWithProgression = 0;

    for (const player of players) {
      // If player has at least 2 evaluations, calculate progression
      if (player.evaluations.length >= 2) {
        const latest = player.evaluations[0];
        const previous = player.evaluations[1];

        if (previous.overallRating && latest.overallRating && previous.overallRating > 0) {
          const progression = ((latest.overallRating - previous.overallRating) / previous.overallRating) * 100;
          totalProgression += progression;
          playersWithProgression++;
        }
      }
    }

    // Return average progression, or 0 if no players have progression data
    return playersWithProgression > 0 ? Math.round(totalProgression / playersWithProgression) : 0;
  }
}
