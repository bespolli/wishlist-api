import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ArtsearchService } from './artsearch.service';

describe('ArtsearchService', () => {
  let service: ArtsearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [ArtsearchService],
    }).compile();

    service = module.get<ArtsearchService>(ArtsearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
