import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './user.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: any, @Res() res) {
    const data = await this.auth.register(dto, res);
    return res.status(201).json(data);
  }

  @Post('login')
  async login(@Body() dto: any, @Req() req, @Res() res) {
    
    const data = await this.auth.login(dto.email, dto.password, req, res);
    return res.status(200).json(data);
  }

  @Post('refresh')
  async refresh(@Req() req, @Res() res) {
    const data = await this.auth.refresh(req, res);
    return res.status(200).json(data);
  }

  @Post('logout')
  async logout(@Req() req, @Res() res) {
    const data = await this.auth.logout(req, res);
    return res.status(200).json(data);
  }
}