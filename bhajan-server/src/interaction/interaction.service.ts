import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserInteraction, UserInteractionDocument, InteractionType } from '../Model/user.interaction.model';
import { Song, SongDocument } from '../Model/lyrics.model';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class InteractionService {
  private readonly logger = new Logger(InteractionService.name);

  constructor(
    @InjectModel(UserInteraction.name)
    private interactionModel: Model<UserInteractionDocument>,
    @InjectModel(Song.name)
    private songModel: Model<SongDocument>,
    private redis: RedisService,
  ) {}

  private getWeightByType(type: InteractionType): number {
    const weights = {
      [InteractionType.LIKE]: 10,
      [InteractionType.BOOKMARK]: 8,
      [InteractionType.PLAY]: 5,
      [InteractionType.VIEW]: 2,
      [InteractionType.SHARE]: 7,
    };
    return weights[type] || 1;
  }

  async track(userId: string, songId: string, type: InteractionType) {
    if (!Types.ObjectId.isValid(songId)) {
      this.logger.warn(`Invalid songId: ${songId}`);
      return null;
    }

    const weight = this.getWeightByType(type);

    try {
      // Create interaction
      const interaction = await this.interactionModel.create({
        userId,
        songId,
        type,
        weight,
      });

      // Update song analytics
      const updateFields: any = {};
      if (type === InteractionType.VIEW) updateFields.viewCount = 1;
      if (type === InteractionType.LIKE) updateFields.likeCount = 1;

      if (Object.keys(updateFields).length > 0) {
        await this.songModel.findByIdAndUpdate(songId, {
          $inc: updateFields,
        });
      }

      // Invalidate user recommendations cache
      await this.redis.del(`recommendations:${userId}`);

      this.logger.log(`Tracked ${type} for user ${userId} on song ${songId}`);
      return interaction;
    } catch (error) {
      this.logger.error(`Failed to track interaction: ${error}`);
      return null;
    }
  }

  async getUserInteractions(userId: string, limit: number = 100) {
    return this.interactionModel
      .find({ userId })
      .sort({ interactedAt: -1 })
      .limit(limit)
      .lean();
  }

  async getSongInteractions(songId: string) {
    return this.interactionModel
      .find({ songId })
      .sort({ interactedAt: -1 })
      .lean();
  }

  async getUserSongPreference(userId: string): Promise<Map<string, number>> {
    const interactions = await this.interactionModel
      .find({ userId })
      .select('songId weight')
      .lean();

    const scoreMap = new Map<string, number>();
    
    for (const interaction of interactions) {
      const songId = interaction.songId.toString();
      const currentScore = scoreMap.get(songId) || 0;
      scoreMap.set(songId, currentScore + interaction.weight);
    }

    return scoreMap;
  }

  async getSimilarUsers(userId: string, limit: number = 10): Promise<string[]> {
    // Get user's interacted songs
    const userSongs = await this.interactionModel
      .find({ userId })
      .distinct('songId');

    if (userSongs.length === 0) return [];

    // Find other users who interacted with same songs
    const similarUsers = await this.interactionModel.aggregate([
      {
        $match: {
          userId: { $ne: userId },
          songId: { $in: userSongs },
        },
      },
      {
        $group: {
          _id: '$userId',
          commonSongs: { $addToSet: '$songId' },
          score: { $sum: '$weight' },
        },
      },
      {
        $project: {
          userId: '$_id',
          commonCount: { $size: '$commonSongs' },
          score: 1,
        },
      },
      {
        $sort: { score: -1, commonCount: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return similarUsers.map(u => u.userId);
  }
}