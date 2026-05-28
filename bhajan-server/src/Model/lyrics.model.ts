import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import slugify from 'slugify';

export type SongDocument = HydratedDocument<Song>;

export enum Category {
  PRAISE = 'praise',
  WORSHIP = 'worship',
  CROSS = 'cross',
  REPENTANCE = 'repentance',
  KHORAS = 'khoras',
  DEDICATION = 'dedication',
}

export enum Tempo {
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast',
}

@Schema({ _id: false })
export class LyricSection {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 80 })
  name!: string;

  @Prop({ required: true })
  id!: string;

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'Lines cannot be empty',
    },
  })
  lines!: string[];

  @Prop({ type: [[String]], default: [] })
  chords!: string[][];

  @Prop({ min: 1, max: 20, default: 1 })
  repeat!: number;
}

export const LyricSectionSchema =
  SchemaFactory.createForClass(LyricSection);

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
})
export class Song {
  @Prop({ required: true, index: true })
  title!: string;

  @Prop({ unique: true, lowercase: true, index: true })
  slug!: string;

  @Prop({ unique: true, sparse: true, index: true })
  number?: number;

  @Prop({ required: true, index: true })
  category!: Category;

  @Prop({ default: 'C Major' })
  scale!: string;

  @Prop({ index: true, default: Tempo.MEDIUM })
  tempo!: Tempo;

  @Prop({ type: [LyricSectionSchema], required: true })
  lyrics!: LyricSection[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  // ================= AI VECTOR =================
  @Prop({ type: [Number], default: [] })
  embedding!: number[];

  // ================= ANALYTICS =================
  @Prop({ default: 0 })
  viewCount!: number;

  @Prop({ default: 0 })
  likeCount!: number;
}

export const SongSchema = SchemaFactory.createForClass(Song);

// Auto slug
SongSchema.pre('validate', function () {
  if (!this.slug || this.slug.trim().length === 0) {
    this.slug = slugify(this.title || 'song', {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});