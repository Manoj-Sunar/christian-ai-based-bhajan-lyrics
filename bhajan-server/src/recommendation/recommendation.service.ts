import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Song, SongDocument } from '../Model/lyrics.model';
import { UserInteraction, UserInteractionDocument, InteractionType } from '../Model/user.interaction.model';
import { RedisService } from '../redis/redis.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectModel(Song.name)
    private songModel: Model<SongDocument>,
    @InjectModel(UserInteraction.name)
    private interactionModel: Model<UserInteractionDocument>,
    private redis: RedisService,
    private embeddingService: EmbeddingService,
  ) {}

  async getRecommendations(userId: string, limit: number = 20): Promise<any[]> {
    const cacheKey = `recommendations:${userId}:${limit}`;
    
    try {
      const cached = await this.redis.get<any[]>(cacheKey);
      // Check if cached is a valid array
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    } catch (cacheError) {
      this.logger.warn(`Cache read failed: ${cacheError}`);
    }

    try {
      // Get user's interactions
      const userInteractions = await this.interactionModel
        .find({ userId })
        .sort({ weight: -1 })
        .limit(50)
        .lean()
        .exec();

      if (!userInteractions || userInteractions.length === 0) {
        // No interactions, return popular songs
        const popular = await this.getPopularSongs(limit);
        await this.cacheRecommendations(cacheKey, popular);
        return popular;
      }

      // Get user's liked songs
      const likedSongIds = userInteractions
        .filter(i => i.type === InteractionType.LIKE)
        .map(i => i.songId)
        .filter(id => id); // Remove undefined/null

      // Get user's viewed/played songs
      const interactedSongIds = [...new Set(
        userInteractions
          .map(i => i.songId?.toString())
          .filter(id => id)
      )];

      // Collaborative filtering: find similar users
      const similarUsers = await this.getSimilarUsers(userId, interactedSongIds);
      
      // Get songs liked by similar users that user hasn't interacted with
      let recommendations: any[] = [];
      
      if (similarUsers.length > 0 && interactedSongIds.length > 0) {
        const similarUserLikes = await this.interactionModel.aggregate([
          {
            $match: {
              userId: { $in: similarUsers },
              type: InteractionType.LIKE,
              songId: { $nin: interactedSongIds.map(id => new Types.ObjectId(id)) },
            },
          },
          {
            $group: {
              _id: '$songId',
              score: { $sum: '$weight' },
              likedBy: { $addToSet: '$userId' },
            },
          },
          {
            $sort: { score: -1 },
          },
          {
            $limit: limit,
          },
        ]).exec();

        const songIds = similarUserLikes.map(r => r._id).filter(id => id);
        if (songIds.length > 0) {
          const songs = await this.songModel
            .find({ _id: { $in: songIds }, isActive: true })
            .lean()
            .exec();
          
          // Add score to recommendations
          recommendations = songs.map(song => {
            const match = similarUserLikes.find(r => r._id.toString() === song._id.toString());
            return {
              ...song,
              recommendationScore: match?.score || 0,
              reason: 'Users with similar taste liked this',
            };
          });
        }
      }

      // If not enough recommendations, add content-based from liked songs
      if (recommendations.length < limit && likedSongIds.length > 0) {
        const remainingLimit = limit - recommendations.length;
        const contentBased = await this.getContentBasedRecommendations(likedSongIds, remainingLimit);
        if (contentBased && contentBased.length > 0) {
          recommendations.push(...contentBased);
        }
      }

      // If still not enough, add popular songs
      if (recommendations.length < limit) {
        const remainingLimit = limit - recommendations.length;
        const popular = await this.getPopularSongs(remainingLimit);
        if (popular && popular.length > 0) {
          recommendations.push(...popular);
        }
      }

      // Remove duplicates and limit
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations).slice(0, limit);

      await this.cacheRecommendations(cacheKey, uniqueRecommendations);
      return uniqueRecommendations;
    } catch (error) {
      this.logger.error(`Recommendation failed: ${error}`);
      const fallback = await this.getPopularSongs(limit);
      return fallback;
    }
  }

  private async cacheRecommendations(key: string, data: any[]): Promise<void> {
    try {
      if (data && Array.isArray(data)) {
        await this.redis.set(key, data, this.CACHE_TTL);
      }
    } catch (cacheError) {
      this.logger.warn(`Failed to cache recommendations: ${cacheError}`);
    }
  }

  private deduplicateRecommendations(recommendations: any[]): any[] {
    const seen = new Map();
    for (const item of recommendations) {
      if (item && item._id) {
        const id = item._id.toString();
        if (!seen.has(id)) {
          seen.set(id, item);
        }
      }
    }
    return Array.from(seen.values());
  }

  private async getSimilarUsers(userId: string, userSongIds: string[], limit: number = 5): Promise<string[]> {
    if (!userSongIds || userSongIds.length === 0) return [];

    try {
      const similarUsers = await this.interactionModel.aggregate([
        {
          $match: {
            userId: { $ne: userId },
            songId: { $in: userSongIds.map(id => new Types.ObjectId(id)) },
          },
        },
        {
          $group: {
            _id: '$userId',
            commonSongs: { $addToSet: '$songId' },
            totalWeight: { $sum: '$weight' },
          },
        },
        {
          $sort: { totalWeight: -1 },
        },
        {
          $limit: limit,
        },
      ]).exec();

      return similarUsers.map(u => u._id).filter(id => id);
    } catch (error) {
      this.logger.warn(`Failed to get similar users: ${error}`);
      return [];
    }
  }

  private async getContentBasedRecommendations(songIds: string[], limit: number): Promise<any[]> {
    if (!songIds || songIds.length === 0 || limit <= 0) return [];

    try {
      // Get the liked songs
      const likedSongs = await this.songModel
        .find({ _id: { $in: songIds }, isActive: true })
        .lean()
        .exec();
      
      if (!likedSongs || likedSongs.length === 0) return [];

      // Extract categories and tags from liked songs
      const categories = [...new Set(likedSongs.map(s => s.category).filter(c => c))];
      const allTags = likedSongs.flatMap(s => s.tags || []).filter(t => t);
      const tagFrequency = new Map<string, number>();
      for (const tag of allTags) {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      }
      const topTags = [...tagFrequency.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(t => t[0]);

      // Find similar songs by category and tags
      const similarSongs = await this.songModel.find({
        isActive: true,
        _id: { $nin: songIds.map(id => new Types.ObjectId(id)) },
        $or: [
          ...(categories.length > 0 ? [{ category: { $in: categories } }] : []),
          ...(topTags.length > 0 ? [{ tags: { $in: topTags } }] : []),
        ],
      })
      .limit(limit)
      .lean()
      .exec();

      return similarSongs.map(song => ({
        ...song,
        recommendationScore: 5,
        reason: 'Based on songs you like',
      }));
    } catch (error) {
      this.logger.warn(`Content-based recommendations failed: ${error}`);
      return [];
    }
  }

  private async getPopularSongs(limit: number): Promise<any[]> {
    if (limit <= 0) return [];

    try {
      const popular = await this.songModel
        .find({ isActive: true })
        .sort({ likeCount: -1, viewCount: -1, createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      return popular.map(song => ({
        ...song,
        recommendationScore: 1,
        reason: 'Popular among all users',
      }));
    } catch (error) {
      this.logger.error(`Failed to get popular songs: ${error}`);
      return [];
    }
  }

  async getSongRecommendations(songId: string, limit: number = 10): Promise<any[]> {
    const cacheKey = `recommendations:song:${songId}:${limit}`;
    
    try {
      const cached = await this.redis.get<any[]>(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    } catch (cacheError) {
      this.logger.warn(`Cache read failed: ${cacheError}`);
    }

    try {
      if (!Types.ObjectId.isValid(songId)) {
        this.logger.warn(`Invalid song ID: ${songId}`);
        return [];
      }

      const song = await this.songModel.findById(songId).lean().exec();
      if (!song) return [];

      // Find songs with same category or tags
      const similar = await this.songModel.find({
        isActive: true,
        _id: { $ne: new Types.ObjectId(songId) },
        $or: [
          { category: song.category },
          ...(song.tags && song.tags.length > 0 ? [{ tags: { $in: song.tags } }] : []),
        ],
      })
      .limit(limit)
      .lean()
      .exec();

      let allResults = [...similar];

      // If using embeddings, try semantic similarity
      if (song.embedding && song.embedding.length > 0 && Array.isArray(song.embedding)) {
        try {
          const semanticSimilar = await this.songModel.aggregate([
            {
              $vectorSearch: {
                index: 'song_vector_index',
                path: 'embedding',
                queryVector: song.embedding,
                numCandidates: 50,
                limit: limit,
                filter: { 
                  isActive: { $eq: true }, 
                  _id: { $ne: song._id } 
                },
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
                tags: 1,
                viewCount: 1,
                likeCount: 1,
                score: { $meta: 'vectorSearchScore' },
              },
            },
          ]).exec();
          
          // Merge results
          allResults = [...allResults, ...semanticSimilar];
        } catch (vectorError) {
          this.logger.warn(`Vector search failed: ${vectorError}`);
        }
      }

      // Remove duplicates
      const unique = this.deduplicateRecommendations(allResults);
      const results = unique.slice(0, limit);

      await this.cacheRecommendations(cacheKey, results);
      return results;
    } catch (error) {
      this.logger.error(`Song recommendation failed: ${error}`);
      return [];
    }
  }

  async getPersonalizedFeed(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    
    const recommendations = await this.getRecommendations(userId, safeLimit * 2);
    
    // Ensure recommendations is an array
    const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
    
    // Paginate
    const paginated = safeRecommendations.slice(skip, skip + safeLimit);
    
    return {
      recommendations: paginated,
      total: safeRecommendations.length,
      page: safePage,
      limit: safeLimit,
      hasMore: skip + safeLimit < safeRecommendations.length,
    };
  }

  // Helper method to clear user recommendations cache
  async clearUserRecommendationsCache(userId: string): Promise<void> {
    try {
      await this.redis.deleteByPattern(`recommendations:${userId}:*`);
      this.logger.log(`Cleared recommendations cache for user: ${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to clear cache for user ${userId}: ${error}`);
    }
  }

  // Helper method to refresh recommendations for a user
  async refreshRecommendations(userId: string): Promise<any[]> {
    await this.clearUserRecommendationsCache(userId);
    return this.getRecommendations(userId);
  }
}