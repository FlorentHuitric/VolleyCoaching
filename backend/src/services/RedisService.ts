import { createClient, RedisClientType } from 'redis';
import { injectable } from 'tsyringe';

@injectable()
export class RedisService {
  private client: RedisClientType;
  private connected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379',
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.connected = true;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  /**
   * Get cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set cached value with TTL in seconds (default 5 minutes)
   */
  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  /**
   * Delete a cache key
   */
  async del(key: string): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Redis del error:', err);
    }
  }

  /**
   * Delete all keys matching a pattern (e.g. "players:*")
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.connected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (err) {
      console.error('Redis invalidatePattern error:', err);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
