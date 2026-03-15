import { ObjectType, Field, ID, registerEnumType } from 'type-graphql';
import { Role } from '@prisma/client';

// Register Role enum for GraphQL
registerEnumType(Role, {
  name: 'Role',
  description: 'User role in the system',
});

/**
 * User GraphQL type (without password field)
 */
@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  username!: string;

  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String)
  orgId!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
