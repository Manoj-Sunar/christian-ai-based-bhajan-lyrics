import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Song, SongSchema } from '../Model/lyrics.model';
import { EmbeddingModule } from '../embedding/embedding.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Song.name, schema: SongSchema }]),
    EmbeddingModule,
    RedisModule,
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}