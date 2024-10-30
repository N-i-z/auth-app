import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:3003/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, displayName } = profile;
      const email = emails && emails.length > 0 ? emails[0].value : null;

      // Use the default tenant if none is provided
      const tenantId = await this.authService.ensureDefaultTenant();

      // Call oauthLogin to create or retrieve the user
      const user = await this.authService.oauthLogin(
        'google',
        id,
        email,
        displayName,
        tenantId,
      );

      done(null, user);
    } catch (error) {
      console.error('Error during Google OAuth validation:', error); // Log the error
      done(error, null);
    }
  }
}
