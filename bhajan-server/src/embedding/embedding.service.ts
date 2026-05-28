import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('OPEN_ROUTER_API_KEY')!;
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.substring(0, 8000), // Limit text length
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.data?.[0]?.embedding) {
        throw new Error('Invalid embedding response');
      }

      return data.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding failed: ${error}`);
      // Return empty array as fallback
      return [];
    }
  }

  async generateSongEmbedding(song: any): Promise<number[]> {
    // Combine title, category, tags, and lyrics for better semantic search
    const lyricsText = song.lyrics
      .map((section: any) => section.lines.join(' '))
      .join(' ')
      .substring(0, 4000);

    const textToEmbed = `
      Title: ${song.title}
      Category: ${song.category}
      Tags: ${(song.tags || []).join(', ')}
      Lyrics: ${lyricsText}
    `;

    return this.embed(textToEmbed);
  }
}