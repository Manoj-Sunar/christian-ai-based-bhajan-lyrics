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
import { InteractionService } from '../interaction/interaction.service';
import { InteractionType } from '../Model/user.interaction.model';

import slugify from 'slugify';
import crypto from 'crypto';

@Injectable()
export class SongsService {
    private readonly logger = new Logger(SongsService.name);
    private readonly CACHE_TTL = 3600;

    constructor(
        @InjectModel(Song.name)
        private readonly songModel: Model<SongDocument>,
        private readonly aiService: AiService,
        private readonly redis: RedisService,
        private readonly interactionService: InteractionService,
    ) { }

    private cacheKeys = {
        songById: (id: string) => `song:id:${id}`,
        songBySlug: (slug: string) => `song:slug:${slug}`,
        songsAll: () => `songs:all`,
    };

    private cleanAIResponse(text: string): string {
        if (!text) return '';
        return text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
    }

    private extractJSON(text: string) {
        try {
            const match = text.match(/(\{[\s\S]*\})/);
            if (!match?.[1]) return null;
            return JSON.parse(match[1]);
        } catch (error) {
            this.logger.error('JSON extraction failed', error);
            return null;
        }
    }

    private cleanAIText(text: string): string {
        if (!text) return '';
        return text
            .replace(/\*\*/g, '')
            .replace(/\\n/g, '\n')
            .replace(/\\/g, '')
            .replace(/^\s*\*\s?/gm, '• ')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    private normalizeExplanation(data: any[]) {
        if (!Array.isArray(data)) return [];
        return data.map((item) => ({
            title: this.cleanAIText(item?.title || ''),
            content: this.cleanAIText(item?.content || ''),
        }));
    }

    private generateSlug(title: string) {
        return `${slugify(title, { lower: true, strict: true, trim: true })}-${Date.now()}`;
    }

    async getSongById(id: string, trackView: boolean = false, userId?: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw ErrorUtil.badRequest('Invalid song id');
        }

        const cacheKey = this.cacheKeys.songById(id);
        const cached = await this.redis.get(cacheKey);

        let song;
        if (cached) {
            song = cached;
        } else {
            song = await this.songModel.findById(id).lean();
            if (!song) throw ErrorUtil.notFound('Song not found');
            await this.redis.set(cacheKey, song, this.CACHE_TTL);
        }

        // Track view if requested
        if (trackView && userId) {
            await this.interactionService.track(userId, id, InteractionType.VIEW);
        }

        return song;
    }

    async getSongBySlug(slug: string, trackView: boolean = false, userId?: string) {
        const cacheKey = this.cacheKeys.songBySlug(slug);
        const cached = await this.redis.get(cacheKey);

        let song;
        if (cached) {
            song = cached;
        } else {
            song = await this.songModel.findOne({ slug }).lean();
            if (!song) throw ErrorUtil.notFound('Song not found');
            await this.redis.set(cacheKey, song, this.CACHE_TTL);
        }

        if (trackView && userId) {
            await this.interactionService.track(userId, song._id.toString(), InteractionType.VIEW);
        }

        return song;
    }

    async getAllSongs() {
        const cacheKey = this.cacheKeys.songsAll();
        const cached = await this.redis.get(cacheKey);

        if (cached) return cached;

        const songs = await this.songModel
            .find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        await this.redis.set(cacheKey, songs, this.CACHE_TTL);
        return songs;
    }


    
    async explainLyrics(songId: string, language: string) {
        const song: any = await this.getSongById(songId);

        const lyricsText = song.lyrics
            .map((section: any) => `[${section.name.toUpperCase()}]\n${section.lines.join('\n')}`)
            .join('\n\n');

        const prompt = `
You are a Christian theologian and worship song analyst.

Analyze this worship song deeply.

IMPORTANT RULES:
- Output MUST be VALID JSON ONLY
- DO NOT use markdown
- DO NOT use code blocks
- Response language must be ${language}
- Use simple and meaningful Christian language
- Use only biblical/spiritual wording

RETURN FORMAT:
{
  "explanation": [
    {"title": "1. Main Meaning", "content": "..."},
    {"title": "2. Spiritual Message", "content": "..."},
    {"title": "3. Biblical Context", "content": "..."},
    {"title": "4. Related Bible Verses", "content": "..."},
    {"title": "5. Worship Theme", "content": "..."},
    {"title": "6. Emotional Tone", "content": "..."},
    {"title": "7. Practical Christian Life Application", "content": "..."}
  ]
}

SONG TITLE: ${song.title}
CATEGORY: ${song.category}
LYRICS: ${lyricsText}
`;

        try {
            const response = await this.aiService.generate(prompt);
            this.logger.log(response);

            let parsed: any;

            try {
                parsed = JSON.parse(this.cleanAIResponse(response));
            } catch {
                parsed = this.extractJSON(response);
            }

            if (!parsed || !Array.isArray(parsed.explanation)) {
                this.logger.error('Invalid AI explanation response', response);
                return {
                    song: song.title,
                    explanation: [{
                        title: 'Explanation Unavailable',
                        content: 'AI could not generate structured explanation.',
                    }],
                };
            }

            return {
                song: song.title,
                explanation: this.normalizeExplanation(parsed.explanation),
            };
        } catch (error) {
            this.logger.error('Explain lyrics failed', error);
            throw ErrorUtil.internal('Lyrics explanation failed');
        }
    }



    async convertLyrics(songId: string, language: string) {
        const song: any = await this.getSongById(songId);

        if (!song || !song.lyrics) {
            throw ErrorUtil.badRequest('Invalid song');
        }

        const lyricsText = song.lyrics
            .map((s: any) => {
                const chordText = s.chords && Array.isArray(s.chords)
                    ? s.chords.map((line: string[]) => line.join(' ')).join('\n')
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
- NO markdown, NO explanation, NO code blocks

Return format:
{
  "title": "translated title",
  "language": "${language}",
  "translatedSong": {
    "lyrics": [
      {
        "name": "Verse 1",
        "lines": ["line 1", "line 2"],
        "chords": [["C", "G"], ["Am", "F"]],
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

SONG:
${lyricsText}
`;

        try {
            const aiResponse = await this.aiService.generate(prompt);
            const cleaned = this.cleanAIResponse(aiResponse);
            let parsed: any;

            try {
                parsed = JSON.parse(cleaned);
            } catch {
                parsed = this.extractJSON(aiResponse);
            }

            if (!parsed || !parsed.translatedSong || !Array.isArray(parsed.translatedSong.lyrics)) {
                this.logger.error('Invalid AI response', aiResponse);
                throw ErrorUtil.internal('Invalid AI response format');
            }

            const convertedSong = {
                title: parsed.title,
                slug: this.generateSlug(parsed.title),
                category: song.category,
                scale: song.scale,
                tempo: song.tempo,
                lyrics: parsed.translatedSong.lyrics.map((sec: any, index: number) => ({
                    name: sec.name || `Section ${index + 1}`,
                    id: crypto.randomUUID(),
                    lines: Array.isArray(sec.lines) ? sec.lines : [],
                    chords: Array.isArray(sec.chords) ? sec.chords : [],
                    repeat: sec.repeat || 1,
                })),
                tags: song.tags || [],
                isActive: true,
            };

            return {
                originalSongId: song._id,
                originalTitle: song.title,
                language,
                convertedSong,
            };
        } catch (err) {
            this.logger.error(err);
            throw ErrorUtil.internal('Lyrics conversion failed');
        }
    }
}