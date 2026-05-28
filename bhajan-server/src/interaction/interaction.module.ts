import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInteraction, UserInteractionSchema } from '../Model/user.interaction.model';
import { Song, SongSchema } from '../Model/lyrics.model';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserInteraction.name, schema: UserInteractionSchema },
      { name: Song.name, schema: SongSchema },
    ]),
    RedisModule,
  ],
  providers: [InteractionService],
  exports: [InteractionService],
})
export class InteractionModule {}