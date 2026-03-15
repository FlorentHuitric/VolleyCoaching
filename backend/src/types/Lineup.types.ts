import { ObjectType, Field, ID, InputType } from 'type-graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Lineup {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  teamId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => GraphQLJSON)
  positions!: any;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@InputType()
export class SaveLineupInput {
  @Field(() => String)
  teamId!: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => GraphQLJSON)
  positions!: any;
}
