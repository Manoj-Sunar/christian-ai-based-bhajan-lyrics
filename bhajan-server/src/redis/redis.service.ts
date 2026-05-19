import {
  Injectable,
  Logger,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger =
    new Logger(RedisService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {
    this.initListeners();
  }

  private initListeners() {
    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.redis.on('ready', () => {
      this.logger.log('Redis ready');
    });

    this.redis.on('error', (err) => {
      this.logger.error(
        `Redis error: ${err.message}`,
        err.stack,
      );
    });

    this.redis.on('close', () => {
      this.logger.warn(
        'Redis connection closed',
      );
    });

    this.redis.on(
      'reconnecting',
      () => {
        this.logger.warn(
          'Redis reconnecting...',
        );
      },
    );
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  // ====================================
  // BASIC CACHE METHODS
  // ====================================

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    const val = JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.set(
        key,
        val,
        'EX',
        ttlSeconds,
      );
    } else {
      await this.redis.set(key, val);
    }
  }

  async get<T>(
    key: string,
  ): Promise<T | null> {
    const data = await this.redis.get(
      key,
    );

    return data
      ? (JSON.parse(data) as T)
      : null;
  }

  async del(
    key: string,
  ): Promise<number> {
    return this.redis.del(key);
  }

  async delMany(
    keys: string[],
  ): Promise<number> {
    if (!keys.length) return 0;

    return this.redis.del(...keys);
  }

  async exists(
    key: string,
  ): Promise<boolean> {
    return (
      (await this.redis.exists(key)) ===
      1
    );
  }

  async ttl(
    key: string,
  ): Promise<number> {
    return this.redis.ttl(key);
  }

  // ====================================
  // PATTERN DELETE (PRODUCTION SAFE)
  // ====================================

  async deleteByPattern(
    pattern: string,
  ): Promise<void> {
    const stream =
      this.redis.scanStream({
        match: pattern,
        count: 100,
      });

    const pipeline =
      this.redis.pipeline();

    return new Promise(
      (resolve, reject) => {
        stream.on(
          'data',
          (keys: string[]) => {
            if (keys.length) {
              keys.forEach((key) => {
                pipeline.del(key);
              });
            }
          },
        );

        stream.on(
          'end',
          async () => {
            await pipeline.exec();
            resolve();
          },
        );

        stream.on('error', reject);
      },
    );
  }

  // ====================================
  // AUTH SESSION HELPERS
  // ====================================

  private sessionKey(
    userId: string,
    deviceId: string,
  ) {
    return `auth:session:${userId}:${deviceId}`;
  }

  async setSession(
    userId: string,
    deviceId: string,
    data: any,
    ttl: number,
  ) {
    await this.set(
      this.sessionKey(
        userId,
        deviceId,
      ),
      data,
      ttl,
    );
  }

  async getSession<T>(
    userId: string,
    deviceId: string,
  ): Promise<T | null> {
    return this.get<T>(
      this.sessionKey(
        userId,
        deviceId,
      ),
    );
  }

  async deleteSession(
    userId: string,
    deviceId: string,
  ) {
    return this.del(
      this.sessionKey(
        userId,
        deviceId,
      ),
    );
  }

  async deleteAllSessions(
    userId: string,
  ) {
    await this.deleteByPattern(
      `auth:session:${userId}:*`,
    );
  }

  getClient(): Redis {
    return this.redis;
  }
}