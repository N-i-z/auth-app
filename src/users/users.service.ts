import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Update the findAll method to accept an optional tenantId
  async findAll(tenantId?: number): Promise<User[]> {
    const where = tenantId ? { tenantId } : {}; // If tenantId is provided, filter by it, otherwise fetch all
    return this.prisma.user.findMany({
      where: where,
    });
  }

  async findOne(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findOneById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async createUser(
    username: string,
    password: string,
    role: Role,
    tenantId: number,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async createUserWithOAuth(userData: any) {
    const { oauthId, email, username, tenantId } = userData;
    return this.prisma.user.create({
      data: {
        oauthId,
        email,
        username,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async recreateUser(userData: any) {
    const { oauthId, email, username, tenantId } = userData;
    return this.prisma.user.update({
      where: { oauthId },
      data: {
        email,
        username,
        tenant: { connect: { id: tenantId } },
        isActive: true,
      },
    });
  }
}
