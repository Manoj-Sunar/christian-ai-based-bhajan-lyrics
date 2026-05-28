import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SongsModule } from './songs/songs.module';
import { AiService } from './ai/ai.service';
import { AiModule } from './ai/ai.module';
import { SearchModule } from './search/search.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { InteractionModule } from './interaction/interaction.module';
import { RecommendationModule } from './recommendation/recommendation.module';
@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');

        if (!uri) {
          throw new Error('MONGO_URI is not defined');

        }

        console.log('Mongo URI loaded');
        return { uri };
      }
    }),



    RedisModule,



    AdminModule,



    UserModule,



    AuthModule,



    SongsModule,



    AiModule,



    SearchModule,



    EmbeddingModule,



    InteractionModule,



    RecommendationModule],
  controllers: [AppController],
  providers: [AppService, AiService],
})
export class AppModule {

}
