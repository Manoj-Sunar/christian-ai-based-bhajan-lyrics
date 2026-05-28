import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Song, SongDocument } from '../Model/lyrics.model';
import { EmbeddingService } from '../embedding/embedding.service';
import { RedisService } from '../redis/redis.service';
import { ErrorUtil } from '../error-handler/error.utils';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    @InjectModel(Song.name)
    private songModel: Model<SongDocument>,
    private embeddingService: EmbeddingService,
    private redis: RedisService,
  ) {}

  async exactSearch(q: string) {
    if (!q || q.trim().length < 2) {
      return [];
    }

    const searchRegex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    return this.songModel.find({
      isActive: true,
      $or: [
        { title: searchRegex },
        { slug: searchRegex },
        { tags: { $in: [searchRegex] } },
        { 'lyrics.lines': { $regex: searchRegex } },
      ],
    }).limit(50);
  }

  async searchByNumber(n: number) {
    if (!n || isNaN(n)) {
      throw ErrorUtil.badRequest('Valid number required');
    }
    return this.songModel.findOne({ number: n, isActive: true });
  }

  async semanticSearch(q: string) {
    if (!q || q.trim().length < 2) {
      return [];
    }

    try {
      const vector = await this.embeddingService.embed(q);
      
      if (!vector || vector.length === 0) {
        this.logger.warn('No embedding vector generated, falling back to text search');
        return this.exactSearch(q);
      }

      // Check if vector search index exists
      try {
        const results = await this.songModel.aggregate([
          {
            $vectorSearch: {
              index: 'song_vector_index',
              path: 'embedding',
              queryVector: vector,
              numCandidates: 100,
              limit: 20,
              filter: { isActive: { $eq: true } },
            },
          },
          {
            $project: {
              title: 1,
              slug: 1,
              number: 1,
              category: 1,
              scale: 1,
              tempo: 1,
              lyrics: { $slice: ['$lyrics', 3] }, // Return first 3 sections only
              tags: 1,
              viewCount: 1,
              likeCount: 1,
              score: { $meta: 'vectorSearchScore' },
            },
          },
        ]);
        
        return results;
      } catch (vectorError) {
        this.logger.warn(`Vector search failed: ${vectorError}, falling back to text search`);
        return this.exactSearch(q);
      }
    } catch (error) {
      this.logger.error(`Semantic search error: ${error}`);
      return this.exactSearch(q);
    }
  }

  async hybridSearch(q: string) {
    const cacheKey = `search:hybrid:${q.toLowerCase().trim()}`;
    
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [exact, semantic] = await Promise.all([
      this.exactSearch(q),
      this.semanticSearch(q),
    ]);

    const map = new Map();

    // Exact matches get higher base score
    exact.forEach((s: any) => {
      const id = s._id.toString();
      map.set(id, { 
        ...s.toObject(), 
        searchScore: 10,
        matchType: 'exact',
      });
    });

    // Semantic matches add to score
    semantic.forEach((s: any) => {
      const id = s._id.toString();
      const existing = map.get(id);
      if (existing) {
        existing.searchScore = (existing.searchScore || 0) + 5;
        existing.matchType = 'hybrid';
      } else {
        map.set(id, { 
          ...s, 
          searchScore: 5,
          matchType: 'semantic',
        });
      }
    });

    const results = [...map.values()]
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, 30);

    await this.redis.set(cacheKey, results, this.CACHE_TTL);
    
    return results;
  }

 

  

  async advancedSearch(filters: any) {
    const query: any = { isActive: true };
    
    if (filters.category) query.category = filters.category;
    if (filters.tempo) query.tempo = filters.tempo;
    if (filters.minNumber) query.number = { $gte: filters.minNumber };
    if (filters.maxNumber) query.number = { ...query.number, $lte: filters.maxNumber };
    if (filters.tags && filters.tags.length) query.tags = { $in: filters.tags };
    
    if (filters.title) {
      query.title = new RegExp(filters.title, 'i');
    }

    let results = this.songModel.find(query);
    
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
      results = results.sort({ [filters.sortBy]: sortOrder });
    } else {
      results = results.sort({ number: 1, title: 1 });
    }

    if (filters.limit) {
      results = results.limit(filters.limit);
    }

    return results.lean();
  }
}