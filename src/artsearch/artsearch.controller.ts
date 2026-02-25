import { Controller, Get, Query } from '@nestjs/common';
import { ArtsearchService } from './artsearch.service';

@Controller('artsearch')
export class ArtsearchController {
  constructor(private readonly artsearchService: ArtsearchService) {}

  @Get()
  async search(@Query('query') query: string) {
    return this.artsearchService.search(query);
  }
}
