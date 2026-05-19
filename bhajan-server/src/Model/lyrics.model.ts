import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import slugify from "slugify"

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
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  })
  name!: string;

  @Prop({
    required: true,
  })
  id!: string; // frontend UUID

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'Lines cannot be empty',
    },
  })
  lines!: string[];

  // FIXED: chord per line mapping
  @Prop({
    type: [[String]],
    default: [],
  })
  chords!: string[][];

  @Prop({
    min: 1,
    max: 20,
    default: 1,
  })
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
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200,
    index: true,
  })
  title!: string;

 @Prop({
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  minlength: 1, // 🔥 ADD THIS
  index: true,
})
slug!: string;

  @Prop({
    unique: true,
    sparse: true,
    min: 1,
    index: true,
  })
  number?: number;

  @Prop({
    enum: Category,
    required: true,
    index: true,
  })
  category!: Category;

  @Prop({
    trim: true,
    default: 'C Major',
  })
  scale!: string;

  @Prop({
    enum: Tempo,
    default: Tempo.MEDIUM,
    index: true,
  })
  tempo!: Tempo;

  @Prop({
    type: [LyricSectionSchema],
    required: true,
    validate: {
      validator: (v: LyricSection[]) => v.length > 0,
      message: 'At least one lyric section is required',
    },
  })
  lyrics!: LyricSection[];

  @Prop({
    type: [String],
    default: [],
    index: true,
  })
  tags!: string[];

  @Prop({
    default: true,
    index: true,
  })
  isActive!: boolean;
}

export const SongSchema =
  SchemaFactory.createForClass(Song);

  SongSchema.pre('validate', function () {
  if (!this.slug || this.slug.trim().length === 0) {
    this.slug = slugify(this.title || 'song', {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});