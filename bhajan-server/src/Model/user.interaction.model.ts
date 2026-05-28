import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserInteractionDocument = HydratedDocument<UserInteraction>;

export enum InteractionType {
  VIEW = 'view',
  LIKE = 'like',
  PLAY = 'play',
  SHARE = 'share',
  BOOKMARK = 'bookmark',
}

@Schema({ timestamps: true })
export class UserInteraction {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  songId!: string;

  @Prop({ required: true, enum: InteractionType })
  type!: InteractionType;

  @Prop({ default: 1 })
  weight!: number;

  @Prop({ default: Date.now })
  interactedAt!: Date;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);

// Create compound index for efficient queries
UserInteractionSchema.index({ userId: 1, songId: 1 });
UserInteractionSchema.index({ userId: 1, type: 1 });