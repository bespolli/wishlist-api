import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE — CREATE A WISH
  async create(createWishDto: CreateWishDto) {
    return this.prisma.wish.create({
      data: {
        title: createWishDto.title,
        description: createWishDto.description,
      },
    });
  }


  // READ LIST — GET ALL WISHES WITH PAGINATION AND SEARCH
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

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

  // READ ONE — GET A WISH BY ID
  async findOne(id: string) {
    const wish = await this.prisma.wish.findUnique({
      where: { id },
    });

    if (!wish) {
      throw new NotFoundException(`Wish with id ${id} not found`);
    }

    return wish;
  }

  // UPDATE — UPDATE A WISH
  async update(id: string, updateWishDto: UpdateWishDto) {
    // FIRSTLY CHECK IF THE RECORD EXISTS
    await this.findOne(id); // RETURNS 404 IF NOT FOUND

    return this.prisma.wish.update({
      where: { id },
      data: updateWishDto,
    });
  }

  // DELETE — DELETE A WISH
  async remove(id: string) {
    // FIRSTLY CHECK IF THE RECORD EXISTS
    await this.findOne(id); // RETURNS 404 IF NOT FOUND

    return this.prisma.wish.delete({
      where: { id },
    });
  }
}