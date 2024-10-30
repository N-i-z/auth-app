import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  Get,
  Res,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    const { username, password } = signInDto;
    try {
      return await this.authService.signIn(username, password);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-tokens')
  async refreshTokens(@Request() req) {
    const refreshToken = req.headers.authorization?.split(' ')[1];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing.');
    }
    return this.authService.refreshTokens(req.user.id, refreshToken);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password, role } = registerDto; // Assume role is optional
    return this.authService.register(username, password, role);
  }

  // Route to initiate Google OAuth login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiating Google OAuth login flow
    return;
  }

  // Google OAuth callback route
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    if (!user || !user.emails || user.emails.length === 0) {
      throw new NotFoundException('User data not found.');
    }
    const { accessToken, refreshToken } = await this.authService.oauthLogin(
      'google',
      user.id,
      user.emails[0]?.value,
      user.username,
      user.tenantId,
    );
    return res.json({ accessToken, refreshToken });
  }

  // Route to initiate GitHub OAuth login
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // Initiating GitHub OAuth login flow
    return;
  }

  // GitHub OAuth callback route
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    if (!user || !user.emails || user.emails.length === 0) {
      throw new NotFoundException('User data not found.');
    }
    const { accessToken, refreshToken } = await this.authService.oauthLogin(
      'github',
      user.id,
      user.emails[0]?.value,
      user.username,
      user.tenantId,
    );
    return res.json({ accessToken, refreshToken });
  }
}
