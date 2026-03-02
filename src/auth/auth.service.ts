import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // ===== SIGN UP =====
  async register(email: string, password: string, name?: string) {
    // 1. Check if the email is already taken
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Hash the password (10 — number of hashing rounds)
    //    "mypassword" → "$2b$10$xK8f3Jk..."  (cannot be decrypted back)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save the user in the database (with the hashed password!)
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      name,
    });

    // 4. Immediately issue a token (so the user is logged in after registration)
    const token = this.generateToken(user.id, user.email);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // ===== LOGIN =====
  async login(email: string, password: string) {
    // 1. Find the user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Compare the password with the hash in the database
    //    bcrypt.compare("mypassword", "$2b$10$xK8f...") → true/false
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Everything is fine — issue a token
    const token = this.generateToken(user.id, user.email);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // ===== TOKEN GENERATION =====
  private generateToken(userId: string, email: string): string {
    // Embed the user's id and email in the token
    // Later, when the user sends this token with a request,
    // we can identify WHO they are
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
