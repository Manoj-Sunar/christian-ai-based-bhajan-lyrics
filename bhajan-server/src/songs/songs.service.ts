import {
    Injectable,
    Logger,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import {
    Song,
    SongDocument,
} from '../Model/lyrics.model';

import {
    Model,
    Types,
} from 'mongoose';

import { RedisService } from '../redis/redis.service';

import { ErrorUtil } from '../error-handler/error.utils';

import { AiService } from '../ai/ai.service';

import slugify from 'slugify';

import crypto from 'crypto';

@Injectable()
export class SongsService {
    private readonly logger =
        new Logger(SongsService.name);

    private readonly CACHE_TTL = 3600;

    constructor(
        @InjectModel(Song.name)
        private readonly songModel: Model<SongDocument>,

        private readonly aiService: AiService,

        private readonly redis: RedisService,
    ) { }

    // ====================================
    // CACHE KEYS
    // ====================================

    private cacheKeys = {
        songById: (id: string) =>
            `song:id:${id}`,

        songBySlug: (slug: string) =>
            `song:slug:${slug}`,

        songsAll: () => `songs:all`,

        songsPage: (
            page: number,
            limit: number,
        ) =>
            `songs:page:${page}:limit:${limit}`,

        songsCategory: (
            category: string,
        ) =>
            `songs:category:${category}`,
    };

    // ====================================
    // CLEAN AI RESPONSE
    // ====================================

    private cleanAIResponse(
        text: string,
    ): string {
        return text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
    }

    // ====================================
    // SAFE JSON EXTRACTION
    // ====================================

    private extractJSON(text: string) {
        try {
            const match =
                text.match(
                    /\{[\s\S]*\}/,
                );

            if (!match) {
                return null;
            }

            return JSON.parse(
                match[0],
            );
        } catch {
            return null;
        }
    }

    // ====================================
    // GENERATE UNIQUE SLUG
    // ====================================

    private generateSlug(
        title: string,
    ) {
        return `${slugify(title, {
            lower: true,
            strict: true,
            trim: true,
        })}-${Date.now()}`;
    }




    
    // ====================================
    // GET SONG BY ID
    // ====================================

    async getSongById(id: string) {
        if (
            !Types.ObjectId.isValid(id)
        ) {
            throw ErrorUtil.badRequest(
                'Invalid song id',
            );
        }

        const cacheKey =
            this.cacheKeys.songById(
                id,
            );

        const cached =
            await this.redis.get(
                cacheKey,
            );

        if (cached) {
            return cached;
        }

        const song =
            await this.songModel
                .findById(id)
                .lean();

        if (!song) {
            throw ErrorUtil.notFound(
                'Song not found',
            );
        }

        await this.redis.set(
            cacheKey,
            song,
            this.CACHE_TTL,
        );

        return song;
    }




    // ====================================
    // GET SONG BY SLUG
    // ====================================

    async getSongBySlug(
        slug: string,
    ) {
        const cacheKey =
            this.cacheKeys.songBySlug(
                slug,
            );

        const cached =
            await this.redis.get(
                cacheKey,
            );

        if (cached) {
            return cached;
        }

        const song =
            await this.songModel
                .findOne({ slug })
                .lean();

        if (!song) {
            throw ErrorUtil.notFound(
                'Song not found',
            );
        }

        await this.redis.set(
            cacheKey,
            song,
            this.CACHE_TTL,
        );

        return song;
    }





    // ====================================
    // GET ALL SONGS
    // ====================================

    async getAllSongs() {
        const cacheKey =
            this.cacheKeys.songsAll();

        const cached =
            await this.redis.get(
                cacheKey,
            );

        if (cached) {
            return cached;
        }

        const songs =
            await this.songModel
                .find({
                    isActive: true,
                })
                .sort({
                    createdAt: -1,
                })
                .lean();

        await this.redis.set(
            cacheKey,
            songs,
            this.CACHE_TTL,
        );

        return songs;
    }

    // ====================================
    // GET PAGINATED SONGS
    // ====================================

    async getPaginatedSongs(
        page = 1,
        limit = 10,
    ) {
        const cacheKey =
            this.cacheKeys.songsPage(
                page,
                limit,
            );

        const cached =
            await this.redis.get(
                cacheKey,
            );

        if (cached) {
            return cached;
        }

        const skip =
            (page - 1) * limit;

        const [songs, total] =
            await Promise.all([
                this.songModel
                    .find({
                        isActive: true,
                    })
                    .sort({
                        createdAt: -1,
                    })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                this.songModel.countDocuments(
                    {
                        isActive: true,
                    },
                ),
            ]);

        const result = {
            data: songs,
            total,
            page,
            limit,
            totalPages:
                Math.ceil(
                    total / limit,
                ),
        };

        await this.redis.set(
            cacheKey,
            result,
            this.CACHE_TTL,
        );

        return result;
    }

    // ====================================
    // EXPLAIN SONG LYRICS
    // ====================================

    async explainLyrics(
        songId: string,
    ) {
        const song: any =
            await this.getSongById(
                songId,
            );

        const lyricsText =
            song.lyrics
                .map(
                    (
                        section: any,
                    ) =>
                        `[${section.name.toUpperCase()}]\n${section.lines.join(
                            '\n',
                        )}`,
                )
                .join('\n\n');

        const prompt = `
You are a Christian theologian and worship song analyst.

Analyze this worship song deeply.

Song Title:
${song.title}

Category:
${song.category}

Lyrics:
${lyricsText}

Return response in this format:

1. Main Meaning
2. Spiritual Message
3. Biblical Context
4. Related Bible Verses
5. Worship Theme
6. Emotional Tone
7. Practical Christian Life Application

Important:
- Explain in simple human language
- Use proper Bible verses
- Do not hallucinate fake verses
- Keep theological consistency
- Response should feel pastoral and spiritual
`;

        const response =
            await this.aiService.generate(
                prompt,
            );

        return {
            song: song.title,
            explanation: response,
        };
    }

    // ====================================
    // CONVERT LYRICS
    // ====================================

    async convertLyrics(
        songId: string,
        language: string,
    ) {
        const song: any =
            await this.getSongById(
                songId,
            );

        if (
            !song ||
            !song.lyrics
        ) {
            throw ErrorUtil.badRequest(
                'Invalid song',
            );
        }

        const lyricsText =
            song.lyrics
                .map((s: any) => {
                    const chordText =
                        s.chords &&
                            Array.isArray(
                                s.chords,
                            )
                            ? s.chords
                                .map(
                                    (
                                        line: string[],
                                    ) =>
                                        line.join(
                                            ' ',
                                        ),
                                )
                                .join(
                                    '\n',
                                )
                            : '';

                    return `
[${s.name.toUpperCase()}]

Lyrics:
${s.lines.join('\n')}

Chords:
${chordText}
`;
                })
                .join('\n\n');

        const prompt = `
You are a professional Christian worship translator and arranger.

IMPORTANT:
- Output MUST be valid JSON only
- NO markdown
- NO explanation
- NO code blocks

Return format:

{
  "title": "translated title",
  "language": "${language}",
  "translatedSong": {
    "lyrics": [
      {
        "name": "Verse 1",
        "lines": [
          "line 1",
          "line 2"
        ],
        "chords": [
          ["C", "G"],
          ["Am", "F"]
        ],
        "repeat": 1
      }
    ]
  }
}

Rules:
- Worship style translation
- Preserve original meaning
- Keep singable structure
- chords MUST be string[][]
- chords count should match lines count
- Maintain worship tone

SONG:
${lyricsText}
`;

        try {
            const aiResponse =
                await this.aiService.generate(
                    prompt,
                );

            // CLEAN RESPONSE

            const cleaned =
                this.cleanAIResponse(
                    aiResponse,
                );

            let parsed: any;

            // TRY PARSE

            try {
                parsed =
                    JSON.parse(
                        cleaned,
                    );
            } catch {
                parsed =
                    this.extractJSON(
                        aiResponse,
                    );
            }

            if (
                !parsed ||
                !parsed.translatedSong
            ) {
                this.logger.error(
                    'Invalid AI response:',
                    aiResponse,
                );

                throw ErrorUtil.internal(
                    'Invalid AI response format',
                );
            }

            // VALIDATE LYRICS

            if (
                !Array.isArray(
                    parsed
                        .translatedSong
                        .lyrics,
                )
            ) {
                throw ErrorUtil.internal(
                    'AI lyrics format invalid',
                );
            }

            const convertedSong =
            {
                title:
                    parsed.title,

                slug: this.generateSlug(
                    parsed.title,
                ),

                category:
                    song.category,

                scale:
                    song.scale,

                tempo:
                    song.tempo,

                lyrics:
                    parsed.translatedSong.lyrics.map(
                        (
                            sec: any,
                            index: number,
                        ) => {
                            const lines =
                                Array.isArray(
                                    sec.lines,
                                )
                                    ? sec.lines
                                    : [];

                            const chords =
                                Array.isArray(
                                    sec.chords,
                                )
                                    ? sec.chords
                                    : [];

                            return {
                                name:
                                    sec.name ||
                                    `Section ${index + 1}`,

                                id:
                                    crypto.randomUUID(),

                                lines,

                                chords,

                                repeat:
                                    sec.repeat ||
                                    1,
                            };
                        },
                    ),

                tags:
                    song.tags ||
                    [],

                isActive: true,
            };

            return {
                originalSongId:
                    song._id,

                originalTitle:
                    song.title,

                language,

                convertedSong,
            };
        } catch (err) {
            this.logger.error(err);

            throw ErrorUtil.internal(
                'Lyrics conversion failed',
            );
        }
    }
}