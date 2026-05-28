import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationService {
  constructor(
    private interactionModel: any,
    private songModel: any,
  ) {}

  async get(userId: string) {
    const interactions =
      await this.interactionModel.find({ userId });

    const score = new Map();

    for (const i of interactions) {
      score.set(
        i.songId,
        (score.get(i.songId) || 0) + i.weight,
      );
    }

    const topIds = [...score.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map((x) => x[0]);

    return this.songModel.find({
      _id: { $in: topIds },
    });
  }
}