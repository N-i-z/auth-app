import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Tenant } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async createTenant(
    @Body() createTenantDto: CreateTenantDto,
  ): Promise<Tenant> {
    return this.tenantsService.createTenant(createTenantDto);
  }

  @Get()
  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantsService.getAllTenants();
  }

  @Get(':id')
  async getTenantById(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.getTenantById(Number(id));
  }

  @Put(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateTenantDto>,
  ): Promise<Tenant> {
    return this.tenantsService.updateTenant(Number(id), updateData);
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.deleteTenant(Number(id));
  }
}
