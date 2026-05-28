import {
    Controller,
    Get,
    Param,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
    HttpCode,
    HttpStatus,
    Logger,

    Res,
    Body,
    Post,
} from '@nestjs/common';

import { SongsService } from './songs.service';

@Controller('songs')
export class SongsController {

    private readonly logger =
        new Logger(SongsController.name);

    constructor(
        private readonly songsService: SongsService,
    ) { }


    // ====================================
    // GET ALL SONGS
    // GET /songs
    // ====================================

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllSongs(@Res() res) {

        this.logger.log(
            'Fetching all songs',
        );

        const songs =
            await this.songsService.getAllSongs();

        const data = {
            success: true,
            message:
                'Songs fetched successfully',
            data: songs,
        };

        return res.status(200).json(data);
    }



    



    // ====================================
    // GET SONG BY SLUG
    // GET /songs/slug/amazing-grace
    // ====================================

    @Get('slug/:slug')
    @HttpCode(HttpStatus.OK)
    async getSongBySlug(
        @Param('slug')
        slug: string,
    ) {

        this.logger.log(
            `Fetching song by slug: ${slug}`,
        );

        const song =
            await this.songsService.getSongBySlug(
                slug,
            );

        return {
            success: true,
            message:
                'Song fetched successfully',
            data: song,
        };
    }




    @Post('explain/:id')
    @HttpCode(HttpStatus.OK)
    async explainLyrics(
        @Param('id')
        id: string,
        @Body()
        language:{language:string}
    ) {

        this.logger.log(
            `Explaining lyrics for song id: ${id}`,
        );

        const result =
            await this.songsService.explainLyrics(
                id,
                language.language,
            );

        return {
            success: true,
            message:
                'Lyrics explanation generated successfully',
            data: result,
        };
    }


    @Post('convert/:id')
    @HttpCode(HttpStatus.OK)
    async convertLyrics(
        @Param('id')
        id: string,
        @Body()
        language:{language:string}
    ) {

        
        this.logger.log(
            `Converting lyrics for song id: ${id}`,
        );

        const result =
            await this.songsService.convertLyrics(
                id,
                language.language
            );

        return {
            success: true,
            message:
                `Lyrics converted into ${language.language} language`,
            data: result,
        };
    }

    // ====================================
    // GET SONG BY ID
    // GET /songs/:id
    // ====================================

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getSongById(
        @Param('id')
        id: string,
    ) {

        this.logger.log(
            `Fetching song by id: ${id}`,
        );

        const song =
            await this.songsService.getSongById(
                id,
            );

        return {
            success: true,
            message:
                'Song fetched successfully',
            data: song,
        };
    }








}