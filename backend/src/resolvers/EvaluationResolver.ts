import { rosterWhere } from '../utils/roster';
import GraphQLJSON from 'graphql-type-json';
import { PrismaClient, TestCategory } from '@prisma/client';
import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { injectable, inject } from 'tsyringe';
import { EvaluationService } from '../services/EvaluationService';
import { EvaluationType, CompleteEvaluationInput } from '../types/Evaluation.types';

@injectable()
@Resolver(() => EvaluationType)
export class EvaluationResolver {
  constructor(@inject(PrismaClient) private db: PrismaClient, @inject(EvaluationService) private evaluationService: EvaluationService) {}

  @Query(() => GraphQLJSON)
  async recordedTests(@Arg('teamId', () => ID) teamId: string) {
    const [sessions,ratings]=await Promise.all([
      this.db.evaluationSession.findMany({where:{player:rosterWhere(teamId),status:'COMPLETED'},include:{tests:true},orderBy:{completedAt:'desc'},take:200}),
      this.db.evaluation.findMany({where:{player:rosterWhere(teamId)},orderBy:{evaluationDate:'desc'},take:200})
    ]);
    return [...sessions.map(s=>({...s,kind:'tests',date:s.completedAt})),...ratings.map(e=>({...e,kind:'rating',date:e.evaluationDate}))].sort((a,b)=>new Date(b.date!).getTime()-new Date(a.date!).getTime());
  }

  @Mutation(() => Boolean)
  async completeTestBattery(@Arg('sessionId', () => ID) sessionId: string, @Arg('tests', () => GraphQLJSON) tests: any) {
    if (!Array.isArray(tests) || !tests.length || tests.length>40 || JSON.stringify(tests).length>250000 || tests.some(t=>!t || typeof t.testId!=='string' || !Object.values(TestCategory).includes(String(t.category).toUpperCase() as TestCategory) || Object.keys(t).length<3) || new Set(tests.map(t=>t.testId)).size!==tests.length) throw new Error('Les résultats de tests sont incomplets.');
    await this.db.$transaction(async tx=>{
      await tx.$queryRaw`SELECT id FROM evaluation_sessions WHERE id = ${sessionId} FOR UPDATE`;
      const session=await tx.evaluationSession.findUniqueOrThrow({where:{id:sessionId}});
      if(session.status==='COMPLETED')throw new Error('Cette batterie est déjà enregistrée.');
      await tx.evaluationTest.createMany({data:tests.map(t=>({sessionId,testId:t.testId,category:String(t.category).toUpperCase() as TestCategory,results:t}))});
      await tx.evaluationSession.update({where:{id:sessionId},data:{status:'COMPLETED',completedAt:new Date()}});
      await tx.player.update({where:{id:session.playerId},data:{lastEvaluationDate:new Date()}});
    });
    return true;
  }

  @Query(() => EvaluationType, { nullable: true })
  async currentEvaluation(@Arg('playerId', () => ID) playerId: string): Promise<EvaluationType | null> {
    return this.evaluationService.getCurrentEvaluation(playerId) as any;
  }

  @Query(() => [EvaluationType])
  async evaluationHistory(@Arg('playerId', () => ID) playerId: string): Promise<EvaluationType[]> {
    return this.evaluationService.getEvaluationHistory(playerId) as any;
  }

  @Mutation(() => String)
  async createEvaluationSession(
    @Arg('playerId', () => ID) playerId: string,
    @Arg('evaluatorId', () => ID) evaluatorId: string,
    @Arg('batteryName', () => String) batteryName: string
  ): Promise<string> {
    const session = await this.evaluationService.createSession({
      playerId,
      evaluatorId,
      batteryName,
    });
    return session.id;
  }

  @Mutation(() => EvaluationType)
  async completeEvaluationSession(
    @Arg('sessionId', () => ID) sessionId: string,
    @Arg('evaluationData', () => CompleteEvaluationInput) evaluationData: CompleteEvaluationInput
  ): Promise<EvaluationType> {
    const result = await this.evaluationService.completeSession(sessionId, evaluationData as any);
    return result.evaluation as any;
  }
}
