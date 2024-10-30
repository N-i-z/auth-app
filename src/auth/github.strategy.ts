import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';
import { AuthService } from './auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `http://localhost:3003/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Log the access token and profile for debugging
      console.log('Access Token:', accessToken);
      console.log('Profile:', profile);

      const { id, username, emails } = profile;
      const email = emails && emails.length > 0 ? emails[0].value : null;

      // Use the default tenant if none is provided
      const tenantId = await this.authService.ensureDefaultTenant();

      // Call oauthLogin to create or retrieve the user
      const user = await this.authService.oauthLogin(
        'github',
        id,
        email,
        username,
        tenantId,
      );

      // If user is not found or created, handle it accordingly
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (error) {
      console.error('Error during GitHub OAuth validation:', error); // Log the error
      done(error, null);
    }
  }
}
