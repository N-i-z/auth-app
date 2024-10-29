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
      callbackURL: `http://localhost:3001/auth/github/callback`,
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
      // Extract necessary information from the GitHub profile
      const { id, username, emails } = profile;

      // Ensure emails exist and use the first one as the primary email
      const email = emails && emails.length > 0 ? emails[0].value : null;

      // Log profile data for debugging
      console.log('GitHub Profile:', profile);
      console.log('Extracted Email:', email);
      console.log('Extracted Username:', username);

      // Create or find a user in your database here
      const user = await this.authService.oauthLogin(
        'github',
        id,
        email,
        username,
      );

      // If user is not found or created, handle it accordingly
      if (!user) {
        return done(new Error('User not found'), null); // Or handle as you see fit
      }

      // Pass the user object to the next middleware
      done(null, user);
    } catch (error) {
      console.error('Error during GitHub OAuth validation:', error); // Log the error for debugging
      done(error, null); // Handle error during validation
    }
  }
}
