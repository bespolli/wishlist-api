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

    // Find user by email, or create a new one without password (for Google login)
  // Why without password? Because Google already verified who this person is.
  // We trust Google — so we don't need our own password for them.
  async findOrCreateGoogleUser(email: string, name?: string) {
    // Step 1: check if user with this email already exists
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      // User found — return them as is
      // This works even if they originally registered with email+password
      // Now they can also log in via Google — same account
      return existingUser;
    }

    // Step 2: user doesn't exist — create a new one
    // Note: no password field! It will be null in the database
    return this.prisma.user.create({
      data: {
        email,
        name,
        // password is not set → it will be null
        // This user can only log in via Google
      },
    });
  }
}
