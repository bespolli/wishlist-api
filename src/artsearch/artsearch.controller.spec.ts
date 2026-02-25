import { Test, TestingModule } from '@nestjs/testing';
import { ArtsearchController } from './artsearch.controller';

describe('ArtsearchController', () => {
  let controller: ArtsearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtsearchController],
    }).compile();

    controller = module.get<ArtsearchController>(ArtsearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
