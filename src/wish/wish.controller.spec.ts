import { Test, TestingModule } from '@nestjs/testing';
import { WishController } from './wish.controller';
import { WishService } from './wish.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  wish: {
    findMany:   jest.fn(), // ← MOCK ALL THE PRISMA SERVICE METHODS USED IN THE WISH SERVICE
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
};

describe('WishController', () => {
  let controller: WishController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishController],
      providers: [
        WishService,
        {
          provide: PrismaService, // ← PROVIDE THE MOCK PRISMA SERVICE INSTEAD OF THE REAL ONE
          useValue: mockPrismaService, // ← MOCK THE PRISMA SERVICE TO AVOID REAL DB INTERACTIONS
        },
      ],
    }).compile();

    controller = module.get<WishController>(WishController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
