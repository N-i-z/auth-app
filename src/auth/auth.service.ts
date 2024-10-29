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

  async signIn(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async oauthLogin(oauthProvider: string, oauthId: string) {
    let user = await this.prisma.user.findUnique({
      where: { oauthId },
    });

    if (!user) {
      // If user does not exist, create a new one
      user = await this.usersService.createUserWithOAuth(
        oauthProvider,
        oauthId,
      );
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
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

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    await this.prisma.authRefreshToken.delete({ where: { refreshToken } });

    const user = await this.usersService.findOneById(userId);

    const newAccessToken = this.jwtService.sign({
      username: user.username,
      sub: user.id,
      role: user.role,
    });
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async register(username: string, password: string, role?: Role) {
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || Role.User,
      },
    });

    return user;
  }
}
