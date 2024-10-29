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
    const payload = { username: user.email, sub: user.id };
    const jwt = this.jwtService.sign(payload);

    // You can attach the JWT to a cookie or return it in the response
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
    // Log the user data received from GitHub
    console.log('GitHub OAuth User Data:', req.user); // Added logging for debugging

    const user = req.user;
    const payload = { username: user.emails[0]?.value, sub: user.id }; // Use email safely
    const jwt = this.jwtService.sign(payload);

    // Attach the JWT to a cookie or return it in the response
    res.cookie('access_token', jwt, { httpOnly: true });
    return res.redirect('/');
  }
}
