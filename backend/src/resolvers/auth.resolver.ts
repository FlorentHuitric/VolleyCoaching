import { Resolver, Mutation, Query, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { inject, injectable, container } from 'tsyringe';
import { AuthService } from '../services/auth.service';
import { AuthPayload, LoginInput, SignupInput, RefreshTokenInput, TokenPair } from '../types/auth.types';
import { UserType } from '../types/user.types';
import { GraphQLContext } from '../utils/auth.context';
import { CurrentUser, Authenticated } from '../utils/auth.decorators';
import { GraphQLError } from 'graphql';

@injectable()
@Resolver()
export class AuthResolver {
  private authService: AuthService;

  constructor() {
    // Resolve AuthService directly from container to avoid DI issues
    this.authService = container.resolve(AuthService);
  }

  /**
   * Login mutation
   */
  @Mutation(() => AuthPayload, { description: 'Login with email/username and password' })
  async login(
    @Arg('input', () => LoginInput) input: LoginInput
  ): Promise<AuthPayload> {
    try {
      const result = await this.authService.login(input.emailOrUsername, input.password);
      return {
        user: result.user as any,
        tokens: result.tokens,
      };
    } catch (error: any) {
      throw new GraphQLError(error.message || 'Login failed', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
  }

  /**
   * Signup mutation
   */
  @Mutation(() => AuthPayload, { description: 'Register a new user account' })
  async signup(
    @Arg('input', () => SignupInput) input: SignupInput
  ): Promise<AuthPayload> {
    try {
      const result = await this.authService.signup({
        email: input.email,
        username: input.username,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        orgId: input.orgId,
      });
      return {
        user: result.user as any,
        tokens: result.tokens,
      };
    } catch (error: any) {
      throw new GraphQLError(error.message || 'Signup failed', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  /**
   * Refresh access token
   */
  @Mutation(() => TokenPair, { description: 'Refresh access token using refresh token' })
  async refreshToken(
    @Arg('input', () => RefreshTokenInput) input: RefreshTokenInput
  ): Promise<TokenPair> {
    try {
      const tokens = await this.authService.refreshAccessToken(input.refreshToken);
      return tokens;
    } catch (error: any) {
      throw new GraphQLError(error.message || 'Token refresh failed', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
  }

  /**
   * Get current authenticated user
   */
  @UseMiddleware(Authenticated())
  @Query(() => UserType, { description: 'Get the currently authenticated user' })
  async me(
    @CurrentUser() user: UserType
  ): Promise<UserType> {
    return user;
  }

  /**
   * Logout (client-side token removal, no server action needed with JWT)
   */
  @UseMiddleware(Authenticated())
  @Mutation(() => Boolean, { description: 'Logout (clear tokens on client side)' })
  async logout(): Promise<boolean> {
    // With JWT, logout is handled client-side by removing tokens
    // This mutation exists for consistency and can be used for future extensions
    // (e.g., token blacklisting, refresh token revocation in Redis)
    return true;
  }
}
