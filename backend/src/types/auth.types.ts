import { ObjectType, Field, InputType } from 'type-graphql';
import { UserType } from './user.types';

/**
 * Token pair object type
 */
@ObjectType()
export class TokenPair {
  @Field(() => String)
  accessToken!: string;

  @Field(() => String)
  refreshToken!: string;
}

/**
 * Authentication result (user + tokens)
 */
@ObjectType()
export class AuthPayload {
  @Field(() => UserType)
  user!: UserType;

  @Field(() => TokenPair)
  tokens!: TokenPair;
}

/**
 * Login input
 */
@InputType()
export class LoginInput {
  @Field(() => String)
  emailOrUsername!: string;

  @Field(() => String)
  password!: string;
}

/**
 * Signup input
 */
@InputType()
export class SignupInput {
  @Field(() => String)
  email!: string;

  @Field(() => String)
  username!: string;

  @Field(() => String)
  password!: string;

  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => String)
  orgId!: string;
}

/**
 * Refresh token input
 */
@InputType()
export class RefreshTokenInput {
  @Field(() => String)
  refreshToken!: string;
}
