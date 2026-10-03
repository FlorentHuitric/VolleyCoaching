import type { TrainingExercise, ExerciseCategory, ExerciseDifficulty } from '@/types/exercises';

type DatabaseExercise={id:string;name:string;description:string;instructions?:string|null;videoUrl?:string|null;instagramUrl?:string|null;thumbnailUrl?:string|null;category:string;difficulty:string;duration:number;minPlayers:number;maxPlayers:number;equipment:string[];targetSkills:string[];tags?:{tag?:{name:string}|null}[]};

const categories:Record<string,ExerciseCategory>={WARMUP:'physical',COOL_DOWN:'physical',TECHNICAL_DRILL:'technical',TACTICAL_DRILL:'tactical',GAME_SITUATION:'tactical',PHYSICAL_CONDITIONING:'physical'};

export function toTrainingExercise(row:DatabaseExercise):TrainingExercise {
  const skills=Object.fromEntries((row.targetSkills||[]).map(skill=>[skill,5]));
  const tags=(row.tags||[]).flatMap(item=>item.tag?.name?[item.tag.name.toLowerCase()]:[]);
  if(row.category==='WARMUP')tags.push('échauffement');
  if(row.category==='COOL_DOWN')tags.push('étirements');
  const safe=(value?:string|null)=>{if(!value)return null;try{const url=new URL(value);return url.protocol==='https:'?url.href:null}catch{return null}};
  const instagram=safe(row.instagramUrl),video=safe(row.videoUrl),thumbnail=safe(row.thumbnailUrl);
  return {id:row.id,name:row.name,description:row.description,category:categories[row.category]||'technical',difficulty:row.difficulty.toLowerCase() as ExerciseDifficulty,duration:row.duration,minPlayers:row.minPlayers,maxPlayers:row.maxPlayers,equipment:row.equipment||[],improvesSkills:skills,tags,setup:'',execution:row.instructions||row.description,coachingPoints:[],media:[instagram&&{type:'instagram' as const,url:instagram,thumbnail:thumbnail||undefined},video&&{type:'youtube' as const,url:video}].filter(Boolean) as TrainingExercise['media']};
}
