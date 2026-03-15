import { Request } from 'express';
import { User, Role } from '@prisma/client';

/**
 * GraphQL Context with authenticated user
 */
export interface GraphQLContext {
  req: Request;
  user?: Omit<User, 'password'> | null;
  userId?: string;
  userRole?: Role;
  orgId?: string;
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Support both "Bearer TOKEN" and "TOKEN" formats
  const parts = authHeader.split(' ');

  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return null;
}
