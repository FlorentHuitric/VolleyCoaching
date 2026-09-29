import 'reflect-metadata';
import { PrismaClient, Prisma, Position } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const db=new PrismaClient();
const file=process.argv[2];const apply=process.argv.includes('--apply');
if(!file)throw new Error('Usage: npx tsx scripts/import-club.ts /private/payload.json [--apply]');
const raw=readFileSync(file,'utf8');const payload=JSON.parse(raw);const hash=createHash('sha256').update(raw).digest('hex');
const key=payload.importKey;
const required=['importKey','coachId','orgId','expected','players','season'];for(const k of required)if(!payload[k])throw new Error('Missing '+k);
if(payload.players.length!==37||new Set(payload.players.map((p:any)=>p.externalKey)).size!==37)throw new Error('Expected 37 unique source people');
async function run(){
 const done=await db.$queryRaw<Array<{source_hash:string}>>`SELECT source_hash FROM coaching_data_imports WHERE key=${key}`;
 if(done.length){if(done[0].source_hash!==hash)throw new Error('Import key already used with different source');console.log('ALREADY_IMPORTED');return;}
 const coach=await db.user.findUniqueOrThrow({where:{id:payload.coachId}});if(coach.orgId!==payload.orgId||coach.role!=='ADMIN')throw new Error('Admin organization mismatch');
 const summary={players:37,coreA:7,coreB:5,coreC:5,shared:20,estimated:37};
 const verify=async(tx:Prisma.TransactionClient)=>{
  for(const [model,expected]of [['player',payload.expected.playerIds],['team',payload.expected.teamIds],['user',payload.expected.userIds]] as const){const rows=await (tx[model] as any).findMany({where:{orgId:payload.orgId},select:{id:true}});const ids=rows.map((r:any)=>r.id).sort();if(JSON.stringify(ids)!==JSON.stringify([...expected].sort()))throw new Error('Unexpected production '+model+' records. Import stopped.');}
 };
 if(!apply){await verify(db);console.log('DRY_RUN_OK',JSON.stringify(summary));return;}
 await db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  const existing=await tx.$queryRaw<Array<{key:string}>>`SELECT key FROM coaching_data_imports WHERE key=${key}`;if(existing.length)throw new Error('Concurrent import detected');
  await verify(tx);
  // Only the explicitly inventoried demo organization is replaced.
  await tx.trainingSession.deleteMany({where:{coach:{orgId:payload.orgId}}});
  await tx.player.deleteMany({where:{id:{in:payload.expected.playerIds},orgId:payload.orgId}});
  await tx.team.deleteMany({where:{id:{in:payload.expected.teamIds},orgId:payload.orgId}});
  // Keep reusable exercises; remove their dependency on fictional coach accounts.
  await tx.exercise.updateMany({where:{createdById:{in:payload.expected.userIds}} ,data:{createdById:coach.id}});
  await tx.user.deleteMany({where:{id:{in:payload.expected.userIds.filter((id:string)=>id!==coach.id)},orgId:payload.orgId}});
  await tx.organization.update({where:{id:payload.orgId},data:{name:'USB Volley',type:'CLUB'}});
  await tx.user.update({where:{id:coach.id},data:{firstName:'Florent',lastName:'Huitric',email:payload.coachEmail}});
  const teams:Record<string,string>={};
  for(const name of ['USB A','USB B','USB C','USB · Pool B/C']){const team=await tx.team.create({data:{name,season:payload.season,level:'SENIOR',coachId:coach.id,orgId:payload.orgId,description:name.includes('Pool')?'Effectif commun disponible en B et C. Chaque personne possède une seule fiche.':'Noyau de '+name+(name==='USB A'?'':', complété par le pool commun B/C.')}});teams[name]=team.id;}
  for(const row of payload.players){
   const pool=!!row.sharedPoolFor?.length;
   const p=await tx.player.create({data:{firstName:row.firstName,lastName:row.lastName||'',preferredName:row.displayName,nationality:'',dateOfBirth:null,jerseyNumber:null,primaryPosition:row.primaryPosition as Position,secondaryPosition:row.secondaryPosition as Position||null,dominantHand:row.dominantHand||'unknown',teamId:teams[pool?'USB · Pool B/C':row.currentTeam],rosterTeamIds:pool?[teams['USB B'],teams['USB C']]:[],orgId:payload.orgId,status:'ACTIVE',contractLevel:pool?'ROTATION':'STARTER',experienceLevel:row.qualitativeLevel||'À évaluer',notes:row.notes,currentRating:row.estimate.overall,potentialRating:row.estimate.potential,currentTechnical:row.estimate.technical,currentPhysical:Prisma.DbNull,currentMental:Prisma.DbNull,strengths:row.estimate.strengths,weaknesses:row.estimate.weaknesses,assessmentKind:'ESTIMATED',statsUpdatedAt:new Date(),intakeProfile:{source:payload.sourceFile,sourceSha256:payload.sourceSha256,sourceRow:row.sourceRow??null,sourceLabel:row.sourceDisplayName||row.displayName,externalKey:row.externalKey,importKey:key,sourceProfile:row.sourceProfile,method:'ESTIMATE_FROM_QUALITATIVE_LEVEL_AND_POSSIBLE_POSITIONS_V1',estimatedAt:new Date().toISOString(),estimatedPosition:true,coachUserId:row.isCoach?coach.id:null}}});
   if(!p.id)throw new Error('Player creation failed');
  }
  await tx.$executeRaw`INSERT INTO coaching_data_imports(key,source_hash,summary) VALUES (${key},${hash},${JSON.stringify(summary)}::jsonb)`;
 },{timeout:60000});
 console.log('IMPORTED',JSON.stringify(summary));
}
run().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>db.$disconnect());
