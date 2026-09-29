import type { Player } from '@prisma/client';
const technical: Record<string,string[]>={serving:['power','accuracy','consistency'],passing:['control','reception','positioning'],setting:['tempo','decision','precision'],attacking:['power','variety','technique'],blocking:['timing','reading','positioning'],defense:['digging','positioning','anticipation']};
export function assessmentUpdate(player:Player,input:any){
 const rating=(v:unknown)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>10)throw new Error('Chaque note doit être comprise entre 0 et 10.');return v};
 const strengths=input?.strengths,weaknesses=input?.weaknesses;
 if(!Array.isArray(strengths)||!Array.isArray(weaknesses)||[...strengths,...weaknesses].some(v=>typeof v!=='string'||v.length>500)||strengths.length>20||weaknesses.length>20)throw new Error('Points forts et axes de travail invalides.');
 const currentTechnical=Object.fromEntries(Object.entries(technical).map(([category,keys])=>[category,Object.fromEntries(keys.map(k=>[k,rating(input.technical?.[category])]))]));
 const intake=(player.intakeProfile as Record<string,unknown>)||{};
 const history=Array.isArray(intake.assessmentHistory)?intake.assessmentHistory:[];
 return {currentRating:rating(input.overall),potentialRating:rating(input.potential),currentTechnical,strengths,weaknesses,assessmentKind:'COACH_REVIEWED',statsUpdatedAt:new Date(),intakeProfile:{...intake,assessmentHistory:[...history.slice(-29),{date:new Date().toISOString(),previousRating:player.currentRating,previousTechnical:player.currentTechnical,previousKind:player.assessmentKind}],lastReview:new Date().toISOString()}};
}
