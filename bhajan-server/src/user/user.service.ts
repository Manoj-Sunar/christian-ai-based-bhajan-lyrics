import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
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
  ) { }



  // ================= REGISTER =================
  async register(dto: any, res: any) {
    const salt = Number(process.env.BCRYPT_ROUNDS) || 12;
    const hashed = await bcrypt.hash(dto.password, salt);

    let user;
    try {
      user = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ForbiddenException('Email already exists');
      }
      throw err;
    }

    const deviceId = randomUUID();

    const tokens = await this.issueTokens(user, deviceId);

    this.setCookies(res, tokens, deviceId);

    return {
      success: true,
      data: this.sanitizeUser(user),
    };
  }



  // ================= LOGIN =================
  async login(email: string, password: string, req: any, res: any) {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive)
      throw new ForbiddenException('Account disabled');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    user.lastLogin = new Date();
    await user.save();

    const deviceId = randomUUID();

    const tokens = await this.issueTokens(user, deviceId, req);

    this.setCookies(res, tokens, deviceId);

    return {
      success: true,
      data: this.sanitizeUser(user),
    };
  }



  // ================= REFRESH =================
  async refresh(req: any, res: any) {
    const { refreshToken, deviceId } = req.cookies;

    if (!refreshToken || !deviceId)
      throw new UnauthorizedException();

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    // 🔥 tokenVersion check
    if (payload.tokenVersion !== user.tokenVersion)
      throw new UnauthorizedException('Session expired');

    // 🔥 password change check
    if (user.passwordChangedAt) {
      const changed = Math.floor(
        user.passwordChangedAt.getTime() / 1000,
      );
      if (payload.iat < changed)
        throw new UnauthorizedException('Password changed');
    }

    const session = await this.redis.getSession<AuthSession>(payload.sub, deviceId);
    if (!session) throw new UnauthorizedException();

    const valid = await bcrypt.compare(
      refreshToken,
      session.tokenHash,
    );
    if (!valid) throw new UnauthorizedException();

    const tokens = await this.issueTokens(user, deviceId);

    this.setCookies(res, tokens, deviceId);

    return { success: true };
  }



  // ================= LOGOUT =================
  async logout(req: any, res: any) {
    const { deviceId, accessToken } = req.cookies;

    if (!accessToken || !deviceId)
      throw new UnauthorizedException();

    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException();
    }

    await this.redis.deleteSession(payload.sub, deviceId);

    this.clearCookies(res);

    return { success: true };
  }
















  


  // ================= ISSUE TOKENS =================
  private async issueTokens(user: UserDocument, deviceId: string, req?: any) {
    const payload = {
      sub: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await this.redis.setSession(
      user._id.toString(),
      deviceId,
      {
        tokenHash,
        ip: req?.ip,
        ua: req?.headers['user-agent'],
      },
      60 * 60 * 24 * 7,
    );

    return { accessToken, refreshToken };
  }



  // ================= HELPERS =================
  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }



  private setCookies(res: any, tokens: any, deviceId: string) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('deviceId', deviceId, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }

  private clearCookies(res: any) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('deviceId');
  }
}