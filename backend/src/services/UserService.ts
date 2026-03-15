import { injectable, inject } from 'tsyringe';
import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

@injectable()
export class UserService {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  async createUser(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role;
    orgId: string;
    avatar?: string;
  }): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || Role.COACH,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        teams: true,
      },
    });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async validateCredentials(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateToken(userId: string): Promise<string> {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
  }
}
