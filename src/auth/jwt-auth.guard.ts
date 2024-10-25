import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing JWT token');
    }

    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);
      console.log('Decoded JWT payload:', payload); // Log payload for debugging

      // Attach the decoded payload (user data) to the request object
      request.user = payload;
    } catch (error) {
      console.error('JWT verification failed', error.message); // Log error details for debugging
      throw new UnauthorizedException('Invalid token'); // Rethrow an Unauthorized exception
    }

    // Proceed with the normal AuthGuard behavior, allowing access if the token is valid
    return (await super.canActivate(context)) as boolean;
  }
}
