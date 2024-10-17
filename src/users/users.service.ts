import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findOneById(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(username: string, password: string, role: Role) {
    const existingUser = await this.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });
  }

  async createUserWithOAuth(oauthProvider: string, oauthId: string) {
    // Logic to create a new user based on OAuth provider and ID
    return this.prisma.user.create({
      data: {
        username: `user_${oauthId}`,
        oauthId,
        oauthProvider,
        role: Role.User,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
