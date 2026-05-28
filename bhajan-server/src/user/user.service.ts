import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { RedisService } from '../redis/redis.service';
import { User, UserDocument } from '../Model/user.model';
import { AuthSession } from '../types/session.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private redis: RedisService,
    private configService: ConfigService, // Injected ConfigService
  ) {}

  async register(dto: any, res: any) {
    const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS') || 12;
    const hashed = await bcrypt.hash(dto.password, Number(saltRounds));

    try {
      const user = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
      });

      const deviceId = randomUUID();
      const tokens = await this.issueTokens(user, deviceId);
      this.setCookies(res, tokens, deviceId);

      return { success: true, data: this.sanitizeUser(user) };
    } catch (err: any) {
      if (err.code === 11000) throw new ForbiddenException('Email already exists');
      throw err;
    }
  }

  async login(email: string, password: string, req: any, res: any) {
    const user = await this.userModel.findOne({ email });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials or disabled account');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    user.lastLogin = new Date();
    await user.save();

    const deviceId = randomUUID();
    const tokens = await this.issueTokens(user, deviceId, req);
    this.setCookies(res, tokens, deviceId);

    return { success: true, data: this.sanitizeUser(user) };
  }

  async refresh(req: any, res: any) {
    const { refreshToken, deviceId } = req.cookies;
    if (!refreshToken || !deviceId) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || payload.tokenVersion !== user.tokenVersion) throw new UnauthorizedException('Session expired');

      if (user.passwordChangedAt) {
        const changed = Math.floor(user.passwordChangedAt.getTime() / 1000);
        if (payload.iat < changed) throw new UnauthorizedException('Password changed');
      }

      const session = await this.redis.getSession<AuthSession>(payload.sub, deviceId);
      if (!session || !(await bcrypt.compare(refreshToken, session.tokenHash))) throw new UnauthorizedException();

      const tokens = await this.issueTokens(user, deviceId);
      this.setCookies(res, tokens, deviceId);

      return { success: true };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(req: any, res: any) {
    const { deviceId, accessToken } = req.cookies;
    if (!accessToken || !deviceId) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      await this.redis.deleteSession(payload.sub, deviceId);
      this.clearCookies(res);
      return { success: true };
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async issueTokens(user: UserDocument, deviceId: string, req?: any) {
    const payload = { sub: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.redis.setSession(
      user._id.toString(),
      deviceId,
      { tokenHash, ip: req?.ip, ua: req?.headers['user-agent'] },
      60 * 60 * 24 * 7,
    );
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument) {
    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }

  private setCookies(res: any, tokens: any, deviceId: string) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('deviceId', deviceId, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
  }

  private clearCookies(res: any) {
    res.clearCookie('accessToken'); res.clearCookie('refreshToken'); res.clearCookie('deviceId');
  }
}