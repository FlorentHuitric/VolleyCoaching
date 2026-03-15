import { InputType, Field } from 'type-graphql';
import { TeamLevel } from './Team.types';

@InputType()
export class CreateTeamInput {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => TeamLevel, { defaultValue: TeamLevel.SENIOR })
  level!: TeamLevel;

  @Field(() => String, { nullable: true })
  season?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String)
  coachId!: string;

  @Field(() => String)
  orgId!: string;
}

@InputType()
export class UpdateTeamInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => TeamLevel, { nullable: true })
  level?: TeamLevel;

  @Field(() => String, { nullable: true })
  season?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;
}
