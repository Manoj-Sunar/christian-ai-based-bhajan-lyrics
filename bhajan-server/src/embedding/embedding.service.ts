import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  async embed(text: string): Promise<number[]> {
    const res = await fetch(
      'https://openrouter.ai/api/v1/embeddings',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      },
    );

    const data = await res.json();
    return data.data[0].embedding;
  }
}