import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        console.log('Decoded JWT payload:', payload); // Add this to inspect the payload
        request.user = payload; // Attach the decoded payload to the request
      } catch (error) {
        console.error('JWT verification failed', error); // Log any errors
        return false; // Token verification failed
      }
    }

    return (await super.canActivate(context)) as boolean;
  }
}
