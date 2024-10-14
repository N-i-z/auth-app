import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt-strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy'; // Import the refresh strategy
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '600s' }, // Access token expiration
      }),

      inject: [ConfigService],
    }),
    PrismaModule, // Add PrismaModule here
  ],

  providers: [AuthService, JwtStrategy, JwtRefreshStrategy], // Add refresh strategy here
  controllers: [AuthController],
})
export class AuthModule {}
