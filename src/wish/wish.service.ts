import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE — now requires userId
  async create(createWishDto: CreateWishDto, userId: string) {
    return this.prisma.wish.create({
      data: {
        title: createWishDto.title,
        description: createWishDto.description,
        imageUrl: createWishDto.imageUrl,
        userId,
      },
    });
  }

  // READ LIST — only return wishes belonging to this user
  async findAll(userId: string, page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.wish.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wish.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // READ ONE — only if it belongs to this user
  async findOne(id: string, userId: string) {
    const wish = await this.prisma.wish.findUnique({
      where: { id },
    });

    if (!wish || wish.userId !== userId) {
      throw new NotFoundException(`Wish with id ${id} not found`);
    }

    return wish;
  }

  // UPDATE — only if it belongs to this user
  async update(id: string, updateWishDto: UpdateWishDto, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.wish.update({
      where: { id },
      data: updateWishDto,
    });
  }

  // DELETE — only if it belongs to this user
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.wish.delete({
      where: { id },
    });
  }
}
