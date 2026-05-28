import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class InteractionService {
  constructor(
    @InjectModel('UserInteraction')
    private model: any,
  ) {}

  async track(userId: string, songId: string, type: string) {
    const weight =
      type === 'LIKE' ? 5 : type === 'PLAY' ? 3 : 1;

    return this.model.create({
      userId,
      songId,
      type,
      weight,
    });
  }
}