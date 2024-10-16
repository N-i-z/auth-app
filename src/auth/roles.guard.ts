import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum'; // Adjust the path as needed

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required for this route
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // JWT should already have decoded the user

    if (!user) {
      throw new ForbiddenException('No user found in request');
    }

    console.log('User role:', user.role); // Add logging to inspect the user role

    // Ensure the user's role matches one of the required roles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true; // User has the correct role
  }
}
