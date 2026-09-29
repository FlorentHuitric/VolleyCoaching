import { GraphQLError } from 'graphql';
import type { MiddlewareFn } from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';
import type { GraphQLContext } from './auth.context';

const forbidden = () => { throw new GraphQLError('Accès non autorisé à cette ressource.', { extensions: { code: 'FORBIDDEN' } }); };
const publicFields = new Set(['hello', 'login', 'signup', 'refreshToken']);

export async function authorizeOperation(db: PrismaClient, context: GraphQLContext, field: string, args: any, mutation: boolean) {
  if (publicFields.has(field)) return;
  const user = context.user;
  if (!user) throw new GraphQLError('Connectez-vous pour continuer.', { extensions: { code: 'UNAUTHENTICATED' } });
  if (['me', 'logout', 'changePassword'].includes(field)) return;
  if (!['ADMIN', 'COACH', 'ASSISTANT_COACH'].includes(user.role)) forbidden();
  const input = args.input || {};
  for (const orgId of [args.orgId, input.orgId]) if (orgId && orgId !== user.orgId) forbidden();
  for (const owner of [args.userId, args.evaluatorId, input.createdById, input.coachId]) {
    if (owner && owner !== user.id) forbidden();
  }
  if (field === 'createExerciseTag') input.orgId = user.orgId;
  const teamAccess = async (id: string) => {
    const team = await db.team.findUnique({ where: { id } });
    if (!team || team.orgId !== user.orgId || (user.role !== 'ADMIN' && team.coachId !== user.id)) forbidden();
    return team!;
  };
  for (const id of [args.teamId, input.teamId]) if (id) await teamAccess(id);
  if (['team', 'teamWithPlayers', 'updateTeam', 'deleteTeam'].includes(field)) await teamAccess(args.id);
  const playerId = ['player','updatePlayer','deletePlayer'].includes(field) ? args.id : args.playerId || input.playerId;
  let player;
  if (playerId) {
    player = await db.player.findUnique({ where: { id: playerId } });
    if (!player || player.orgId !== user.orgId) forbidden();
    await teamAccess(player!.teamId);
  }
  if (['completeEvaluationSession','completeTestBattery'].includes(field)) {
    const session = await db.evaluationSession.findUnique({ where: { id: args.sessionId }, include: { player: true } });
    if (!session || session.player.orgId !== user.orgId) forbidden();
    await teamAccess(session!.player.teamId);
    if (session!.status === 'COMPLETED') throw new GraphQLError('Cette évaluation est déjà terminée.');
  }
  const trainingId = ['trainingSession','completeTrainingSession','deleteTrainingPlan'].includes(field) ? args.id : input.sessionId;
  if (trainingId) {
    const session = await db.trainingSession.findUnique({ where: { id: trainingId }, include: { coach: true } });
    if (!session || session.coach.orgId !== user.orgId || (user.role !== 'ADMIN' && session.coachId !== user.id)) forbidden();
    if (session!.teamId) await teamAccess(session!.teamId);
    if (player && player.teamId !== session!.teamId && !player.rosterTeamIds.includes(session!.teamId || '')) forbidden();
  }
  if (field === 'deleteLineup') {
    const lineup = await db.lineup.findUnique({ where: { id: args.id } });
    if (!lineup) forbidden();
    await teamAccess(lineup!.teamId);
  }
  const exerciseId = ['exercise','cloneExercise','updateExercise','deleteExercise'].includes(field) ? args.id : input.exerciseId;
  if (exerciseId) {
    const exercise = await db.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise || (!exercise.isBaseExercise && exercise.orgId !== user.orgId)) forbidden();
    if (['updateExercise','deleteExercise'].includes(field) && exercise!.createdById !== user.id && !(user.role === 'ADMIN' && exercise!.orgId === user.orgId)) forbidden();
  }
  const tagIds = args.tagIds || input.tagIds;
  if (tagIds?.length) {
    const count = await db.exerciseTag.count({ where: { id: { in: [...new Set(tagIds)] as string[] }, OR: [{ orgId: user.orgId }, { orgId: null }] } });
    if (count !== new Set(tagIds).size) forbidden();
  }
}

// All root operations are protected, including resolvers without decorators.
export const AccessPolicy: MiddlewareFn<GraphQLContext> = async ({ context, args, info }, next) => {
  if (info.parentType.name === 'Query' || info.parentType.name === 'Mutation') {
    await authorizeOperation(container.resolve(PrismaClient), context, info.fieldName, args, info.parentType.name === 'Mutation');
  }
  return next();
};
