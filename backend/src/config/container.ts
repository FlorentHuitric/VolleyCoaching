import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Services
import { PlayerService } from '../services/PlayerService';
import { EvaluationService } from '../services/EvaluationService';
import { TrainingService } from '../services/TrainingService';
import { ExerciseService } from '../services/ExerciseService';
import { UserService } from '../services/UserService';
import { TeamService } from '../services/TeamService';
import { AuthService } from '../services/auth.service';
import { RedisService } from '../services/RedisService';
import { ExportService } from '../services/ExportService';

/**
 * Dependency Injection Container
 * Centralizes all service registration for easy testing and maintainability
 */
export class DependencyContainer {
  static async initialize(): Promise<void> {
    // Register Prisma Client as singleton
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    container.registerInstance(PrismaClient, prisma);

    // Register all services
    container.registerSingleton(AuthService);
    container.registerSingleton(UserService);
    container.registerSingleton(TeamService);
    container.registerSingleton(PlayerService);
    container.registerSingleton(EvaluationService);
    container.registerSingleton(TrainingService);
    container.registerSingleton(ExerciseService);
    container.registerSingleton(ExportService);

    // Connect Redis cache
    const redis = container.resolve(RedisService);
    await redis.connect().catch((err: Error) => {
      console.warn('⚠️  Redis unavailable, running without cache:', err.message);
    });

    console.log('✅ Dependency Injection Container initialized');
  }

  static async cleanup(): Promise<void> {
    const prisma = container.resolve(PrismaClient);
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');

    const redis = container.resolve(RedisService);
    await redis.disconnect().catch(() => {});
    console.log('🔌 Redis connection closed');
  }
}

export { container };
