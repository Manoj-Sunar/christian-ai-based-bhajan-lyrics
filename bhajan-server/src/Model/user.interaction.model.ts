import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum InteractionType {
  VIEW = 'view',
  LIKE = 'like',
  PLAY = 'play',
}

@Schema({ timestamps: true })
export class UserInteraction {
  @Prop()
  userId!: string;

  @Prop()
  songId!: string;

  @Prop({ enum: InteractionType })
  type!: InteractionType;

  @Prop({ default: 1 })
  weight!: number;
}

export const UserInteractionSchema =
  SchemaFactory.createForClass(UserInteraction);