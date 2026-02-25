import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ArtsearchService {
  private readonly logger = new Logger(ArtsearchService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  
  async search(query: string) {
    const apiKey = this.configService.get<string>('ARTSEARCH_API_KEY');
    
    this.logger.log(`Query: ${query}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api.artsearch.io/artworks', {
          params: {
            'api-key': apiKey,
            query: query,
          },
        }),
      );

      this.logger.log(`Success! Got ${JSON.stringify(response.data).substring(0, 200)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`=== REAL ERROR ===`);
      this.logger.error(`Status: ${error.response?.status}`);
      this.logger.error(`Data: ${JSON.stringify(error.response?.data)}`);
      this.logger.error(`Message: ${error.message}`);

      throw new HttpException(
        'External API error',
        HttpStatus.I_AM_A_TEAPOT,
      );
    }
  }
}
