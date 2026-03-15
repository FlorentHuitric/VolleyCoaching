import { createParameterDecorator, MiddlewareFn } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { GraphQLContext } from './auth.context';
import { Role } from '@prisma/client';

class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'UNAUTHENTICATED' } });
  }
}

class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'FORBIDDEN' } });
  }
}

/**
 * Decorator to get the current authenticated user from context
 * Throws error if user is not authenticated
 */
export function CurrentUser() {
  return createParameterDecorator<GraphQLContext>(({ context }) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to access this resource');
    }
    return context.user;
  });
}

/**
 * Decorator to get the current user ID from context
 * Throws error if user is not authenticated
 */
export function CurrentUserId() {
  return createParameterDecorator<GraphQLContext>(({ context }) => {
    if (!context.userId) {
      throw new AuthenticationError('You must be logged in to access this resource');
    }
    return context.userId;
  });
}

/**
 * Decorator to get the current user's organization ID from context
 * Throws error if user is not authenticated
 */
export function CurrentOrgId() {
  return createParameterDecorator<GraphQLContext>(({ context }) => {
    if (!context.orgId) {
      throw new AuthenticationError('You must be logged in to access this resource');
    }
    return context.orgId;
  });
}

/**
 * Middleware to require authentication on a resolver
 */
export const AuthenticatedMiddleware: MiddlewareFn<GraphQLContext> = async ({ context }, next) => {
  if (!context.user || !context.userId) {
    throw new AuthenticationError('You must be logged in to access this resource');
  }
  return next();
};

/**
 * Decorator to require authentication on a resolver
 */
export function Authenticated() {
  return AuthenticatedMiddleware;
}

/**
 * Factory to create role-checking middleware
 */
export function createRoleMiddleware(...roles: Role[]): MiddlewareFn<GraphQLContext> {
  return async ({ context }, next) => {
    if (!context.user || !context.userId) {
      throw new AuthenticationError('You must be logged in to access this resource');
    }

    if (!context.userRole || !roles.includes(context.userRole)) {
      throw new ForbiddenError(`You must have one of the following roles: ${roles.join(', ')}`);
    }

    return next();
  };
}

/**
 * Middleware to require specific roles
 */
export function RequireRoles(...roles: Role[]) {
  return createRoleMiddleware(...roles);
}

/**
 * Middleware to require admin role
 */
export function RequireAdmin() {
  return createRoleMiddleware(Role.ADMIN);
}

/**
 * Middleware to require coach or admin role
 */
export function RequireCoach() {
  return createRoleMiddleware(Role.ADMIN, Role.COACH, Role.ASSISTANT_COACH);
}
