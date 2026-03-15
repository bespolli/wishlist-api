import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
        this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

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
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ===== LOGIN =====
  async login(email: string, password: string) {
    // 1. Find the user by email
    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) {
        throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Compare the password with the hash in the database
    //    bcrypt.compare("mypassword", "$2b$10$xK8f...") → true/false
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Everything is fine — issue a token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

    // ===== GOOGLE LOGIN =====
  // Step by step:
  // 1. Frontend gets a credential (token) from Google
  // 2. Frontend sends it to us: POST /auth/google { credential: "..." }
  // 3. We verify the token with Google's library
  // 4. Extract email + name from the token
  // 5. Find or create the user
  // 6. Return JWT + user info (same as regular login)
  async googleLogin(credential: string) {
    try {
      // Verify the Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { email, name } = payload;

      // Find existing user or create new one (without password)
      const user = await this.userService.findOrCreateGoogleUser(email, name);

      const token = this.generateToken(user.id, user.email, user.role);

      return {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      // If token verification fails — reject
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  // ===== TOKEN GENERATION =====
  private generateToken(userId: string, email: string, role: string): string {
    // Embed the user's id and email in the token
    // Later, when the user sends this token with a request,
    // we can identify WHO they are
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
