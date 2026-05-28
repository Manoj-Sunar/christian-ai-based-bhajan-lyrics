import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt'; // Add this import
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { Song, SongSchema } from '../Model/lyrics.model';
import { UserInteraction, UserInteractionSchema } from '../Model/user.interaction.model';
import { RedisModule } from '../redis/redis.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Song.name, schema: SongSchema },
      { name: UserInteraction.name, schema: UserInteractionSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    EmbeddingModule,
  ],
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationModule {}