import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { SearchService } from './search.service';


@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@Query('q') q: string) {
    if (!q || q.trim().length < 2) {
      return {
        success: true,
        data: [],
        message: 'Search query must be at least 2 characters',
      };
    }
    
    const results = await this.searchService.hybridSearch(q);
    return {
      success: true,
      data: results,
      count: results,
    };
  }

  @Get('exact')
  async exactSearch(@Query('q') q: string) {
    const results = await this.searchService.exactSearch(q);
    return {
      success: true,
      data: results,
      count: results.length,
    };
  }

  @Get('semantic')
  async semanticSearch(@Query('q') q: string) {
    const results = await this.searchService.semanticSearch(q);
    return {
      success: true,
      data: results,
      count: results.length,
    };
  }

  @Get('number')
  async byNumber(@Query('n') n: number) {
    const result = await this.searchService.searchByNumber(n);
    return {
      success: true,
      data: result,
    };
  }

 

  

  @Get('advanced')
  async advancedSearch(@Query() filters: any) {
    const results = await this.searchService.advancedSearch(filters);
    return {
      success: true,
      data: results,
      count: results.length,
    };
  }
}