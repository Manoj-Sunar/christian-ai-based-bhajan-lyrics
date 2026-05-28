import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';

@Module({
  providers: [InteractionService]
})
export class InteractionModule {}
