import { Controller, Get, Param, Query, UseGuards, Req, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('recommendations')
@UseGuards(AuthGuard)
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Get()
  async getUserRecommendations(
    @Req() req: any,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.sub;
    const recommendations = await this.recommendationService.getRecommendations(userId, limit);
    return {
      success: true,
      data: recommendations,
      count: recommendations.length,
    };
  }

  @Get('feed')
  async getPersonalizedFeed(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.sub;
    const feed = await this.recommendationService.getPersonalizedFeed(userId, page, limit);
    return {
      success: true,
      ...feed,
    };
  }

  @Get('song/:songId')
  async getSongRecommendations(
    @Param('songId') songId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const recommendations = await this.recommendationService.getSongRecommendations(songId, limit);
    return {
      success: true,
      data: recommendations,
      count: recommendations.length,
    };
  }
}