import { Resolver, Query, Mutation, Arg, ID, FieldResolver, Root, UseMiddleware } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { GraphQLError } from 'graphql';
const ForbiddenError = class extends GraphQLError { constructor(msg: string) { super(msg, { extensions: { code: 'FORBIDDEN' } }); } };
import { PlayerService } from '../services/PlayerService';
import { PlayerType, CreatePlayerInput, UpdatePlayerInput } from '../types/Player.types';
import { EvaluationType } from '../types/Evaluation.types';
import { Position, PlayerStatus } from '@prisma/client';
import prisma from '../prisma';
import { Authenticated, CurrentUserId, RequireCoach } from '../utils/auth.decorators';
import { AuthService } from '../services/auth.service';

@injectable()
@Resolver(() => PlayerType)
export class PlayerResolver {
  constructor(
    @inject(PlayerService) private playerService: PlayerService,
    @inject(AuthService) private authService: AuthService
  ) {}

  @FieldResolver(() => [EvaluationType])
  async evaluations(@Root() player: PlayerType): Promise<EvaluationType[]> {
    const evaluations = await prisma.evaluation.findMany({
      where: { playerId: player.id },
      orderBy: { evaluationDate: 'desc' }
    });
    return evaluations as any;
  }

  @FieldResolver(() => Number, { nullable: true })
  currentRating(@Root() player: PlayerType): number | null {
    if (player.currentRating == null) return null;
    return Math.round(player.currentRating * 10) / 10;
  }

  @FieldResolver(() => Number, { nullable: true })
  potentialRating(@Root() player: PlayerType): number | null {
    if (player.potentialRating == null) return null;
    return Math.round(player.potentialRating * 10) / 10;
  }

  @UseMiddleware(Authenticated())
  @Query(() => PlayerType, { nullable: true })
  async player(
    @Arg('id', () => ID) id: string,
    @CurrentUserId() userId: string
  ): Promise<PlayerType | null> {
    // Verify user owns this player
    const hasAccess = await this.authService.validateUserOwnsPlayer(userId, id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this player');
    }
    return this.playerService.getPlayerById(id) as any;
  }

  @UseMiddleware(Authenticated())
  @Query(() => [PlayerType])
  async playersByTeam(
    @Arg('teamId', () => ID) teamId: string,
    @CurrentUserId() userId: string
  ): Promise<PlayerType[]> {
    // Verify user owns this team
    const hasAccess = await this.authService.validateUserOwnsTeam(userId, teamId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this team');
    }
    return this.playerService.getPlayersByTeam(teamId) as any;
  }

  @Query(() => [PlayerType])
  async playersByOrganization(@Arg('orgId', () => ID) orgId: string): Promise<PlayerType[]> {
    return this.playerService.getPlayersByOrganization(orgId) as any;
  }

  @Query(() => [PlayerType])
  async playersByPosition(
    @Arg('position', () => Position) position: Position,
    @Arg('teamId', () => ID) teamId: string
  ): Promise<PlayerType[]> {
    return this.playerService.getPlayersByPosition(position, teamId) as any;
  }

  @Query(() => [PlayerType])
  async availablePlayers(@Arg('teamId', () => ID) teamId: string): Promise<PlayerType[]> {
    return this.playerService.getAvailablePlayers(teamId) as any;
  }

  @Query(() => [PlayerType])
  async searchPlayers(
    @Arg('query', () => String) query: string,
    @Arg('orgId', () => ID) orgId: string
  ): Promise<PlayerType[]> {
    return this.playerService.searchPlayers(query, orgId) as any;
  }

  @UseMiddleware(RequireCoach())
  @Mutation(() => PlayerType)
  async createPlayer(
    @Arg('input', () => CreatePlayerInput) input: CreatePlayerInput,
    @CurrentUserId() userId: string
  ): Promise<PlayerType> {
    // Verify user owns the team
    const hasAccess = await this.authService.validateUserOwnsTeam(userId, input.teamId);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this team');
    }
    return this.playerService.createPlayer(input as any) as any;
  }

  @UseMiddleware(RequireCoach())
  @Mutation(() => PlayerType)
  async updatePlayer(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdatePlayerInput) input: UpdatePlayerInput,
    @CurrentUserId() userId: string
  ): Promise<PlayerType> {
    // Verify user owns this player
    const hasAccess = await this.authService.validateUserOwnsPlayer(userId, id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this player');
    }
    return this.playerService.updatePlayer(id, input as any) as any;
  }

  @UseMiddleware(RequireCoach())
  @Mutation(() => PlayerType)
  async deletePlayer(
    @Arg('id', () => ID) id: string,
    @CurrentUserId() userId: string
  ): Promise<PlayerType> {
    // Verify user owns this player
    const hasAccess = await this.authService.validateUserOwnsPlayer(userId, id);
    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this player');
    }
    return this.playerService.deletePlayer(id) as any;
  }
}
