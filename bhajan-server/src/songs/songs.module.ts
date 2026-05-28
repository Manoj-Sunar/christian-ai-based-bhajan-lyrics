import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Song, SongSchema } from '../Model/lyrics.model';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
import { AiModule } from '../ai/ai.module';
import { InteractionModule } from '../interaction/interaction.module'; // Import this

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Song.name, schema: SongSchema }]),
    JwtModule.register({}),
    RedisModule,
    AiModule,
    InteractionModule, // Add this - makes InteractionService available
  ],
  providers: [SongsService],
  controllers: [SongsController],
})
export class SongsModule {}