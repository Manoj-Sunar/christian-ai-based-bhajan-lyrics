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
import { EmbeddingService } from '../embedding/embedding.service';

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
    private readonly embeddingService: EmbeddingService,
  ) { }

  private cacheKeys = {
    songById: (id: string) => `song:id:${id}`,
    songBySlug: (slug: string) => `song:slug:${slug}`,
    songsAll: () => `songs:all`,
    songsCategory: (category: string) => `songs:category:${category}`,
  };

  private generateSlug(title: string): string {
    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!slug || slug.length === 0) {
      return `song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    return slug;
  }

  private async clearSongCaches(): Promise<void> {
    await this.redis.deleteByPattern('songs:*');
    await this.redis.deleteByPattern('song:*');
  }

  async createSong(dto: CreateSongDto) {
    const session = await this.songModel.db.startSession();
    session.startTransaction();

    try {
      let slugSource = dto.slug?.trim();
      if (!slugSource) {
        slugSource = dto.title;
      }

      let slug = this.generateSlug(slugSource);
      if (!slug || slug.length === 0) {
        slug = `song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }

      const exists = await this.songModel.exists({
        $or: [
          { slug },
          ...(dto.number ? [{ number: dto.number }] : []),
        ],
      });

      if (exists) {
        throw ErrorUtil.conflict('Song already exists (slug or number conflict)');
      }

      // Create payload first to get ID
      const payload = {
        ...dto,
        slug,
      };

      const [song] = await this.songModel.create([payload], { session });

      // Generate and save embedding
      try {
        const embedding = await this.embeddingService.generateSongEmbedding(song);
        song.embedding = embedding;
        await song.save({ session });
      } catch (embedError) {
        this.logger.warn(`Embedding generation failed: ${embedError}`);
        // Continue without embedding
      }

      await session.commitTransaction();

      const saved = song.toObject();

      // Cache the song
      await Promise.all([
        this.redis.set(this.cacheKeys.songById(saved._id.toString()), saved, this.CACHE_TTL),
        this.redis.set(this.cacheKeys.songBySlug(slug), saved, this.CACHE_TTL),
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

  async updateSong(id: string, dto: UpdateSongDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw ErrorUtil.badRequest('Invalid song id');
    }

    const song = await this.songModel.findById(id);
    if (!song) throw ErrorUtil.notFound('Song not found');

    const oldSlug = song.slug;
    let needsNewEmbedding = false;

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
      needsNewEmbedding = true;
    }

    // Check if lyrics changed
    if (dto.lyrics && JSON.stringify(dto.lyrics) !== JSON.stringify(song.lyrics)) {
      needsNewEmbedding = true;
    }

    if (dto.tags && JSON.stringify(dto.tags) !== JSON.stringify(song.tags)) {
      needsNewEmbedding = true;
    }

    if (dto.category && dto.category !== song.category) {
      needsNewEmbedding = true;
    }

    Object.assign(song, dto);

    // Regenerate embedding if needed
    if (needsNewEmbedding) {
      try {
        const embedding = await this.embeddingService.generateSongEmbedding(song);
        song.embedding = embedding;
      } catch (embedError) {
        this.logger.warn(`Embedding update failed: ${embedError}`);
      }
    }

    await song.save();

    const updated = song.toObject();

    await Promise.all([
      this.redis.set(this.cacheKeys.songById(id), updated, this.CACHE_TTL),
      this.redis.set(this.cacheKeys.songBySlug(song.slug), updated, this.CACHE_TTL),
      oldSlug !== song.slug ? this.redis.del(this.cacheKeys.songBySlug(oldSlug)) : Promise.resolve(),
      this.clearSongCaches(),
    ]);

    return updated;
  }

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

  async getSongById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw ErrorUtil.badRequest('Invalid song id');
    }

    const cached = await this.redis.get(this.cacheKeys.songById(id));
    if (cached) return cached;

    const song = await this.songModel.findById(id).lean();
    if (!song) throw ErrorUtil.notFound('Song not found');

    await this.redis.set(this.cacheKeys.songById(id), song, this.CACHE_TTL);
    return song;
  }

  async getAllSongs() {
    const cached = await this.redis.get(this.cacheKeys.songsAll());
    if (cached) return cached;

    const songs = await this.songModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    await this.redis.set(this.cacheKeys.songsAll(), songs, this.CACHE_TTL);
    return songs;
  }

  
}