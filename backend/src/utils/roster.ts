import type { Prisma } from '@prisma/client';
export const rosterWhere = (teamId: string): Prisma.PlayerWhereInput => ({ OR: [{teamId}, {rosterTeamIds: {has: teamId}}] });
