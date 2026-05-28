import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SongsModule } from './songs/songs.module';
import { AiModule } from './ai/ai.module';
import { SearchModule } from './search/search.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { InteractionModule } from './interaction/interaction.module';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    // 1. Global Config
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true, // Optimizes ENV variable retrieval speed
    }),

    // 2. Rate Limiting (Protects against DDoS/Brute Force)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Max 100 requests per minute per IP
    }]),

    // 3. Database
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        if (!uri) throw new Error('MONGO_URI is not defined');
        return { uri };
      }
    }),

    // 4. Feature Modules
    RedisModule,
    AdminModule,
    UserModule,
    AuthModule,
    SongsModule,
    AiModule,
    SearchModule,
    EmbeddingModule,
    InteractionModule,
    RecommendationModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Apply Rate Limiter Globally
    }
  ],
})
export class AppModule {}