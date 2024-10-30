import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  // Google OAuth Login Route
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // Google OAuth Callback Route
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user; // Contains OAuth user information
    const payload = {
      username: user.username,
      sub: user.id,
      tenantId: user.tenantId,
    };
    const jwt = this.jwtService.sign(payload);

    // Attach the JWT to a cookie or return it in the response
    res.cookie('access_token', jwt, { httpOnly: true });
    return res.redirect('/');
  }

  // GitHub OAuth Login Route
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  // GitHub OAuth Callback Route
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req, @Res() res) {
    const user = req.user; // Contains OAuth user information
    const payload = {
      username: user.username,
      sub: user.id,
      tenantId: user.tenantId,
    };
    const jwt = this.jwtService.sign(payload);

    // Attach the JWT to a cookie or return it in the response
    res.cookie('access_token', jwt, { httpOnly: true });
    return res.redirect('/');
  }
}
