import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../Model/user.model';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
import { AuthService } from './user.service';
import { AuthController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),

    JwtModule.register({

    }),
    RedisModule,
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class UserModule { }
