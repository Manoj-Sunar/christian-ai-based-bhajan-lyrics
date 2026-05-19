import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import {UserRole } from '../Model/user.model';
import { CreateSongDto } from '../DTO/create-song.dto';


@Controller('admin/songs')
@UseGuards(AuthGuard,RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Post()
  create(@Body() dto: CreateSongDto) {
    return this.admin.createSong(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.admin.updateSong(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.admin.deleteSong(id);
  }
}