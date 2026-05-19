import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

import { Type } from 'class-transformer';
import { Category, Tempo } from '../Model/lyrics.model';



class LyricSectionDto {
  @IsString()
  name!: string;

  @IsString()
  id!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  lines!: string[];

  // ✅ FIXED: proper nested validation
  @IsArray()
  chords!: string[][];

  @IsOptional()
  repeat?: number;
}

export class CreateSongDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @IsEnum(Category)
  category!: Category;

  @IsOptional()
  @IsString()
  scale?: string;

  @IsEnum(Tempo)
  tempo!: Tempo;

  @ValidateNested({ each: true })
  @Type(() => LyricSectionDto)
  @ArrayMinSize(1)
  lyrics!: LyricSectionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}