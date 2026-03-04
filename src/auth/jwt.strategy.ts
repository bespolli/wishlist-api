import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      // Where to get the token: from the Authorization header: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Do not accept expired tokens
      ignoreExpiration: false,
      // Secret key for verifying the token signature
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // This method is called AUTOMATICALLY after the token is successfully verified
  // payload — this is what we "embedded" in the token: { sub: userId, email }
  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id, email: user.email, name: user.name, role: user.role };
}
}
