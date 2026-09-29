import { injectable, container } from 'tsyringe';
import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT Payload structure
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  orgId: string;
  issuedAtMs?: number;
  iat?: number;
}

// Token pair structure
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Authentication result
export interface AuthResult {
  user: Omit<User, 'password'>;
  tokens: TokenPair;
}

@injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly SALT_ROUNDS = 12;
  private prisma: PrismaClient;

  constructor() {
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)) throw new Error('JWT secrets required in production');
    // Resolve PrismaClient from container manually to avoid DI resolution issues
    this.prisma = container.resolve(PrismaClient);

    this.ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-change-in-production';
    this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.warn('⚠️  JWT secrets not configured! Using default values. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env');
    }
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain password with a hashed password
   */
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign({ ...payload, issuedAtMs: Date.now() }, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign({ ...payload, issuedAtMs: Date.now() }, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify an access token
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify a refresh token
   */
  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user
   */
  async signup(input: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role;
    orgName: string;
  }): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { username: input.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new Error('Email already in use');
      }
      throw new Error('Username already taken');
    }

    const orgName = input.orgName?.trim();
    if (!orgName || orgName.length > 120) throw new Error('Indiquez le nom de votre organisation.');
    if (input.password.length < 12 || input.password.length > 72) throw new Error('Le mot de passe doit contenir entre 12 et 72 caractères.');
    const hashedPassword = await this.hashPassword(input.password);
    const user = await this.prisma.$transaction(async tx => {
      const organization = await tx.organization.create({ data: { name: orgName } });
      return tx.user.create({ data: {
        email: input.email.trim().toLowerCase(), username: input.username.trim(),
        password: hashedPassword, firstName: input.firstName.trim(), lastName: input.lastName.trim(),
        role: Role.ADMIN, orgId: organization.id,
      } });
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Login a user
   */
  async login(emailOrUsername: string, password: string): Promise<AuthResult> {
    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const payload = this.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('Invalid or expired refresh token');
    }

    // Verify user still exists
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || (payload.issuedAtMs ?? (payload.iat || 0) * 1000) < user.updatedAt.getTime()) {
      throw new Error('User not found or session revoked');
    }

    // Generate new token pair
    return this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    });
  }

  /**
   * Get user from token
   */
  async getUserFromToken(token: string): Promise<Omit<User, 'password'> | null> {
    const payload = this.verifyAccessToken(token);

    if (!payload) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || (payload.issuedAtMs ?? (payload.iat || 0) * 1000) < user.updatedAt.getTime()) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !await this.comparePassword(currentPassword, user.password)) throw new Error('Mot de passe actuel incorrect.');
    if (newPassword.length < 12 || Buffer.byteLength(newPassword, 'utf8') > 72) throw new Error('Choisissez au moins 12 caractères (72 octets maximum).');
    await this.prisma.user.update({ where: { id: userId }, data: { password: await this.hashPassword(newPassword) } });
    return true;
  }

  /**
   * Validate that a user owns a resource
   */
  async validateUserOwnsTeam(userId: string, teamId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        orgId: user.orgId,
        ...(user.role === Role.ADMIN ? {} : { coachId: userId }),
      },
    });

    return !!team;
  }

  /**
   * Validate that a user owns a player (through team ownership)
   */
  async validateUserOwnsPlayer(userId: string, playerId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    const player = await this.prisma.player.findFirst({
      where: {
        id: playerId,
        orgId: user.orgId,
        team: user.role === Role.ADMIN ? { orgId: user.orgId } : { coachId: userId },
      },
    });

    return !!player;
  }

  /**
   * Validate that a user can access an evaluation (owns the player being evaluated)
   */
  async validateUserOwnsEvaluation(userId: string, evaluationId: string): Promise<boolean> {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: {
        id: evaluationId,
        player: {
          team: {
            coachId: userId,
          },
        },
      },
    });

    return !!evaluation;
  }

  /**
   * Validate that a user owns an exercise
   */
  async validateUserOwnsExercise(userId: string, exerciseId: string): Promise<boolean> {
    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        OR: [
          { createdById: userId },
          { isBaseExercise: true }, // Base exercises are accessible by everyone
        ],
      },
    });

    return !!exercise;
  }

  /**
   * Validate that a user owns a training session
   */
  async validateUserOwnsTrainingSession(userId: string, sessionId: string): Promise<boolean> {
    const session = await this.prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        coachId: userId,
      },
    });

    return !!session;
  }

  /**
   * Check if user belongs to the same organization as another user
   */
  async validateSameOrganization(userId: string, targetUserId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { orgId: true },
    });

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { orgId: true },
    });

    if (!user || !targetUser) {
      return false;
    }

    return user.orgId === targetUser.orgId;
  }
}
