import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis";


export const RedisProvider: Provider = {
    provide: 'REDIS_CLIENT',
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST');
        const port = config.get<number>('REDIS_PORT');

        if (!host || !port) {
            throw new Error(`Redis env variables missing`);
        }

        const redis = new Redis({
            host,
            port,

            // 🔥 important for stability
            retryStrategy: (times) => {
                return Math.min(times * 100, 2000);
            },
        });

        redis.on('connect', () => {
            console.log('✅ Redis connected');
        });

        redis.on('error', (err) => {
            console.error('❌ Redis error:', err.message);
        });

        return redis;
    }

}