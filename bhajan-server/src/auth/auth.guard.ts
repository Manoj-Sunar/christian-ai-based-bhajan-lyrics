// src/auth/guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { JwtPayload } from '../types/jwt-payload.types';



@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const accessToken = req.cookies?.accessToken;
    const deviceId = req.cookies?.deviceId;

    if (!accessToken || !deviceId) {
      throw new UnauthorizedException('Unauthorized');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    // ✅ Check Redis session
    const session = await this.redisService.getSession<{
      tokenHash: string;
      role: string;
    }>(payload.sub, deviceId);

    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    // Attach user to request
    req.user = payload;
    req.deviceId = deviceId;

    return true;
  }
}