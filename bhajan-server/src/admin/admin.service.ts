import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import slugify from 'slugify';

import {
  Song,
  SongDocument,
} from '../Model/lyrics.model';

import { RedisService } from '../redis/redis.service';
import { ErrorUtil } from '../error-handler/error.utils';

import { CreateSongDto } from '../DTO/create-song.dto';
import { UpdateSongDto } from '../DTO/update-song.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly CACHE_TTL = 3600;

  constructor(
    @InjectModel(Song.name)
    private readonly songModel: Model<SongDocument>,
    private readonly redis: RedisService,
  ) { }

  // -------------------------
  // CACHE KEYS
  // -------------------------
  private cacheKeys = {
    songById: (id: string) => `song:id:${id}`,
    songBySlug: (slug: string) => `song:slug:${slug}`,
    songsAll: () => `songs:all`,
    songsPage: (page: number, limit: number) =>
      `songs:page:${page}:limit:${limit}`,
    songsCategory: (category: string) =>
      `songs:category:${category}`,
  };

  // -------------------------
  // HELPERS
  // -------------------------
  private generateSlug(title: string): string {
    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    // fallback for non-latin titles (Nepali, Chinese, etc.)
    if (!slug || slug.length === 0) {
      return `song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    return slug;
  }

  private async clearSongCaches() {
    await this.redis.deleteByPattern('songs:*');
  }

  // -------------------------
  // CREATE SONG (SAFE)
  // -------------------------
  async createSong(dto: CreateSongDto) {
    const session = await this.songModel.db.startSession();
    session.startTransaction();

    try {
      // 1. Normalize input slug (DO NOT re-slugify if already valid)
      let slugSource = dto.slug?.trim();

      if (!slugSource) {
        slugSource = dto.title;
      }

      // 2. Generate slug safely (handles Nepali + fallback)
      let slug = this.generateSlug(slugSource);

      // 3. FINAL safety fallback (VERY IMPORTANT for non-latin languages)
      if (!slug || slug.length === 0) {
        slug = `song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }

      // 4. Check duplicate
      const exists = await this.songModel.exists({
        $or: [
          { slug },
          ...(dto.number ? [{ number: dto.number }] : []),
        ],
      });

      if (exists) {
        throw ErrorUtil.conflict('Song already exists');
      }

      // 5. Create payload
      const payload = {
        ...dto,
        slug,
      };

      // 6. Save in transaction
      const song = await this.songModel.create([payload], { session });

      const saved = song[0].toObject();

      await session.commitTransaction();

      // 7. Cache safely AFTER commit
      await Promise.all([
        this.redis.set(
          this.cacheKeys.songById(saved._id.toString()),
          saved,
          this.CACHE_TTL,
        ),
        this.redis.set(
          this.cacheKeys.songBySlug(slug),
          saved,
          this.CACHE_TTL,
        ),
        this.clearSongCaches(),
      ]);

      return saved;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // -------------------------
  // UPDATE SONG
  // -------------------------
  async updateSong(id: string, dto: UpdateSongDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw ErrorUtil.badRequest('Invalid song id');
    }

    const song = await this.songModel.findById(id);
    if (!song) throw ErrorUtil.notFound('Song not found');

    const oldSlug = song.slug;

    if (dto.title && dto.title !== song.title) {
      const newSlug = this.generateSlug(dto.title);

      const exists = await this.songModel.exists({
        slug: newSlug,
        _id: { $ne: song._id },
      });

      if (exists) {
        throw ErrorUtil.conflict('Slug already exists');
      }

      dto.slug = newSlug;
    }

    Object.assign(song, dto);
    await song.save();

    const updated = song.toObject();

    await Promise.all([
      this.redis.set(this.cacheKeys.songById(id), updated, this.CACHE_TTL),
      this.redis.set(this.cacheKeys.songBySlug(song.slug), updated, this.CACHE_TTL),

      oldSlug !== song.slug
        ? this.redis.del(this.cacheKeys.songBySlug(oldSlug))
        : Promise.resolve(),

      this.clearSongCaches(),
    ]);

    return updated;
  }

  // -------------------------
  // DELETE SONG
  // -------------------------
  async deleteSong(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw ErrorUtil.badRequest('Invalid song id');
    }

    const deleted = await this.songModel.findByIdAndDelete(id);

    if (!deleted) {
      throw ErrorUtil.notFound('Song not found');
    }

    await Promise.all([
      this.redis.del(this.cacheKeys.songById(id)),
      this.redis.del(this.cacheKeys.songBySlug(deleted.slug)),
      this.clearSongCaches(),
    ]);

    return {
      success: true,
      message: 'Song deleted successfully',
    };
  }
}