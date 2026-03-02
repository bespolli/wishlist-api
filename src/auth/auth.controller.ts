import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')  // all routes will start with /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register — register a new user
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  // POST /auth/login — log in to an account
  @Post('login')
  @HttpCode(HttpStatus.OK)  // 200 (by default POST returns 201, but login is not a creation)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
