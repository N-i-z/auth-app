import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async ensureDefaultTenant() {
    const defaultTenantId = 5;
    await this.prisma.tenant.upsert({
      where: { id: defaultTenantId },
      update: {},
      create: { id: defaultTenantId, name: 'Default Tenant' },
    });
    return defaultTenantId;
  }

  async signIn(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async oauthLogin(
    oauthProvider: string,
    oauthId: string,
    email: string,
    username: string,
    tenantId?: number,
  ) {
    tenantId = tenantId ?? (await this.ensureDefaultTenant());

    // Attempt to find an existing user by oauthId
    let user = await this.prisma.user.findUnique({
      where: { oauthId: oauthId },
    });

    if (!user) {
      // Create new user if not found
      try {
        user = await this.usersService.createUserWithOAuth({
          oauthProvider,
          oauthId,
          email,
          username,
          tenantId,
        });
      } catch (error) {
        console.error('Error creating new OAuth user:', error);
        throw new UnauthorizedException('Failed to create new OAuth user');
      }
    } else if (!user.isActive) {
      // Reactivate the user if they are inactive
      try {
        user = await this.usersService.recreateUser({
          oauthProvider,
          oauthId,
          email,
          username,
          tenantId,
        });
      } catch (error) {
        console.error('Error reactivating OAuth user:', error);
        throw new UnauthorizedException('Failed to reactivate OAuth user');
      }
    }

    // Refetch user after creation or reactivation to ensure access
    user = await this.prisma.user.findUnique({ where: { oauthId: oauthId } });

    if (!user) {
      throw new UnauthorizedException('User data not found after creation');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async generateRefreshToken(userId: number) {
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      },
    );

    await this.prisma.authRefreshToken.create({
      data: { refreshToken, userId },
    });
    return refreshToken;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const storedToken = await this.prisma.authRefreshToken.findUnique({
      where: { refreshToken },
    });

    if (!storedToken) throw new UnauthorizedException('Refresh token invalid');

    await this.prisma.authRefreshToken.delete({ where: { refreshToken } });

    const user = await this.usersService.findOneById(userId);
    const newAccessToken = this.jwtService.sign({
      username: user.username,
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    });
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async register(
    username: string,
    password: string,
    role?: Role,
    tenantId?: number,
  ) {
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    tenantId = tenantId ?? (await this.ensureDefaultTenant());
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || Role.User,
        tenant: { connect: { id: tenantId } },
      },
    });

    return user;
  }
}
