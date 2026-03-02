import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Find user by email (needed for authentication)
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID (useful for JWT validation)
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Create a new user (used during registration)
  async create(data: { email: string; password: string; name?: string }) {
    return this.prisma.user.create({
      data,
    });
  }
}
