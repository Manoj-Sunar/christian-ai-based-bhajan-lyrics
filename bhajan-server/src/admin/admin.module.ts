import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
import { Song, SongSchema } from '../Model/lyrics.model';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Song.name, schema: SongSchema }]),
    JwtModule.register({}),
    RedisModule,
    EmbeddingModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}