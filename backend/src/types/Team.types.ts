import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';

import { TeamLevel } from '@prisma/client';
export { TeamLevel };

registerEnumType(TeamLevel, {
  name: 'TeamLevel',
  description: 'Team competition level'
});

@ObjectType()
export class Team {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => TeamLevel)
  level!: TeamLevel;

  @Field(() => String, { nullable: true })
  season?: string | null;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => String)
  coachId!: string;

  @Field(() => String)
  orgId!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  // Player count (computed field)
  @Field(() => Number, { nullable: true })
  playerCount?: number | null;

  // Team progression percentage (computed field)
  @Field(() => Number, { nullable: true })
  teamProgression?: number | null;
}

@ObjectType()
export class TeamWithPlayers extends Team {
  @Field(() => [SimplePlayer])
  players!: SimplePlayer[];
}

@ObjectType()
export class SimplePlayer {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => Number, { nullable: true })
  jerseyNumber?: number | null;

  @Field(() => String, { nullable: true })
  primaryPosition?: string | null;

  @Field(() => Number, { nullable: true })
  currentRating?: number | null;
}
