import { rosterWhere } from '../utils/roster';
import { Resolver, Query, Mutation, Arg, ID, Ctx } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { PrismaClient, ExerciseDifficulty } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLContext } from '../utils/auth.context';

@injectable()
@Resolver()
export class TrainingPlanResolver {
 constructor(@inject(PrismaClient) private db: PrismaClient) {}
 @Query(() => GraphQLJSON)
 async savedTrainingPlans(@Arg('teamId', () => ID) teamId: string) {
  const rows = await this.db.trainingSession.findMany({ where: { teamId }, include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } }, attendances: true }, orderBy: { createdAt: 'desc' } });
  return rows.map(row => ({
   ...(row.plan as any || {name:row.name,date:row.scheduledAt || row.createdAt,duration:row.totalDuration,playersIds:row.attendances.map(a=>a.playerId),objectives:[],difficulty:row.difficulty.toLowerCase(),createdAt:row.createdAt,
    phases:[{id:row.id,phase:'technical',name:'Programme',duration:row.totalDuration,order:0,exercises:row.exercises.map(e=>({exerciseId:e.exerciseId,duration:e.duration || e.exercise.duration,notes:e.notes}))}],
    exerciseSnapshots:Object.fromEntries(row.exercises.map(({exercise:e})=>[e.id,{id:e.id,name:e.name,description:e.description,category:'technical',difficulty:e.difficulty.toLowerCase(),duration:e.duration,minPlayers:e.minPlayers,maxPlayers:e.maxPlayers,equipment:e.equipment,setup:'',execution:e.instructions || e.description,coachingPoints:[],improvesSkills:{},tags:[]}]))}),
   id:row.id, completed:row.status==='COMPLETED',createdBy:row.coachId,
  }));
 }
 @Mutation(() => GraphQLJSON)
 async saveTrainingPlan(@Arg('teamId', () => ID) teamId: string, @Arg('plan', () => GraphQLJSON) plan: any, @Ctx() ctx: GraphQLContext) {
  if (!plan || typeof plan.name!=='string' || !plan.name.trim() || plan.name.length>200 || !Number.isInteger(plan.duration) || plan.duration<1 || plan.duration>600 || !Array.isArray(plan.phases) || !plan.phases.length || !Array.isArray(plan.playersIds)) throw new Error('Programme incomplet ou durée invalide.');
  if (!Array.isArray(plan.objectives) || plan.objectives.some((x: unknown)=>typeof x!=='string') || plan.phases.some((phase: any)=>!phase || typeof phase.id!=='string' || typeof phase.name!=='string' || !Number.isFinite(phase.duration) || phase.duration<0 || !Array.isArray(phase.exercises) || phase.exercises.some((e:any)=>!e || typeof e.exerciseId!=='string' || !Number.isFinite(e.duration) || e.duration<0))) throw new Error('Les phases du programme sont invalides.');
  if (JSON.stringify(plan).length>500000) throw new Error('Programme trop volumineux.');
  const difficulty=String(plan.difficulty).toUpperCase() as ExerciseDifficulty;
  if(!Object.values(ExerciseDifficulty).includes(difficulty))throw new Error('Difficulté invalide.');
  const ids=[...new Set(plan.playersIds)] as string[];
  if(ids.some(id=>typeof id!=='string') || await this.db.player.count({where:{id:{in:ids},...rosterWhere(teamId)}})!==ids.length)throw new Error('Un joueur ne fait pas partie de cette équipe.');
  const date=new Date(plan.date);if(!Number.isFinite(date.getTime()))throw new Error('Date invalide.');
  const snapshot={...plan,completed:false,createdBy:ctx.userId,createdAt:new Date().toISOString()};
  const row=await this.db.trainingSession.create({data:{name:plan.name.trim(),totalDuration:plan.duration,difficulty,intensity:'MODERATE',coachId:ctx.userId!,teamId,scheduledAt:date,plan:snapshot}});
  return {...snapshot,id:row.id};
 }
 @Mutation(() => Boolean)
 async deleteTrainingPlan(@Arg('id', () => ID) id: string) {
  await this.db.trainingSession.delete({where:{id}});return true;
 }
}
