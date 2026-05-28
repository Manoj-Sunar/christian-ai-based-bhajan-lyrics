import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Song, SongDocument } from '../Model/lyrics.model';
import { EmbeddingService } from '../embedding/embedding.service';


@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Song.name)
    private songModel: Model<SongDocument>,
    private embeddingService: EmbeddingService,
  ) {}

  // ================= EXACT SEARCH =================
  async exactSearch(q: string) {
    return this.songModel.find({
      isActive: true,
      $or: [
        { title: new RegExp(q, 'i') },
        { slug: new RegExp(q, 'i') },
        { tags: { $in: [q] } },
      ],
    });
  }

  // ================= NUMBER SEARCH =================
  async searchByNumber(n: number) {
    return this.songModel.findOne({ number: n });
  }

  // ================= VECTOR SEARCH =================
  async semanticSearch(q: string) {
    const vector = await this.embeddingService.embed(q);

    return this.songModel.aggregate([
      {
        $vectorSearch: {
          index: 'song_vector_index',
          path: 'embedding',
          queryVector: vector,
          numCandidates: 100,
          limit: 10,
        },
      },
    ]);
  }

  // ================= HYBRID =================
  async hybridSearch(q: string) {
    const [exact, semantic] = await Promise.all([
      this.exactSearch(q),
      this.semanticSearch(q),
    ]);

    const map = new Map();

    exact.forEach((s: any) =>
      map.set(s._id.toString(), { ...s, score: 10 }),
    );

    semantic.forEach((s: any) => {
      const id = s._id.toString();
      map.set(id, {
        ...s,
        score: (map.get(id)?.score || 0) + 5,
      });
    });

    return [...map.values()].sort((a, b) => b.score - a.score);
  }
}