import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';


@Controller('search')
export class SearchController {
  constructor(private searchSearvice: SearchService) {}

  @Get()
  async search(@Query('q') q: string) {
    return {
      success: true,
      data: await this.searchSearvice.hybridSearch(q),
    };
  }

  @Get('number')
  async byNumber(@Query('n') n: number) {
    return {
      success: true,
      data: await this.searchSearvice.searchByNumber(n),
    };
  }
}