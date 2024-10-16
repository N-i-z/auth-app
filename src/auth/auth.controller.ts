import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    const { username, password } = signInDto;
    return await this.authService.signIn(username, password);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-tokens')
  async refreshTokens(@Request() req) {
    const refreshToken = req.headers.authorization.split(' ')[1]; // Extract refresh token from the Authorization header
    return this.authService.refreshTokens(req.user.id, refreshToken);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password, role } = registerDto; // Assume role is optional
    return this.authService.register(username, password, role);
  }
}
