import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';

export enum TeamLevel {
  YOUTH = 'YOUTH',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  ELITE = 'ELITE'
}

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
  description?: string;

  @Field(() => TeamLevel)
  level!: TeamLevel;

  @Field(() => String, { nullable: true })
  season?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

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
  playerCount?: number;

  // Team progression percentage (computed field)
  @Field(() => Number, { nullable: true })
  teamProgression?: number;
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
  avatar?: string;

  @Field(() => Number, { nullable: true })
  jerseyNumber?: number;

  @Field(() => String, { nullable: true })
  primaryPosition?: string;

  @Field(() => Number, { nullable: true })
  currentRating?: number;
}
