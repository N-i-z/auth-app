import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tenant } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  async getTenantById(id: number): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany();
  }

  async updateTenant(
    id: number,
    updateData: Partial<CreateTenantDto>,
  ): Promise<Tenant> {
    const tenant = await this.getTenantById(id);
    return this.prisma.tenant.update({
      where: { id: tenant.id },
      data: updateData,
    });
  }

  async deleteTenant(id: number): Promise<Tenant> {
    const tenant = await this.getTenantById(id);
    return this.prisma.tenant.delete({
      where: { id: tenant.id },
    });
  }
}
