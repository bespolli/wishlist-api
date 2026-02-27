import { Test, TestingModule } from '@nestjs/testing';
import { ArtsearchController } from './artsearch.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ArtsearchService } from './artsearch.service';

describe('ArtsearchController', () => {
  let controller: ArtsearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [ArtsearchController],
      providers: [ArtsearchService],
    }).compile();

    controller = module.get<ArtsearchController>(ArtsearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
