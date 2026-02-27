import { Test, TestingModule } from '@nestjs/testing';
import { WishService } from './wish.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  wish: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
};

describe('WishService', () => {
  let service: WishService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WishService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },

      ],
    }).compile();

    service = module.get<WishService>(WishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
