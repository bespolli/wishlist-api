import { Test, TestingModule } from '@nestjs/testing';
import { ArtsearchService } from './artsearch.service';

describe('ArtsearchService', () => {
  let service: ArtsearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtsearchService],
    }).compile();

    service = module.get<ArtsearchService>(ArtsearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
