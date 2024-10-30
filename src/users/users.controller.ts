import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    const parsedTenantId = tenantId ? Number(tenantId) : undefined; // Parse tenantId to number if present
    this.logger.log(
      `Fetching all users for tenant ID: ${parsedTenantId || 'all tenants'}`,
    );

    // Pass the parsed tenantId to the service, allowing for undefined to fetch all users
    return this.usersService.findAll(parsedTenantId);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Registering user:', createUserDto);
    return this.usersService.createUser(
      createUserDto.username,
      createUserDto.password,
      createUserDto.role || Role.User,
      createUserDto.tenantId,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('oauth')
  async createWithOAuth(
    @Body()
    oauthUserDto: {
      oauthProvider: string;
      oauthId: string;
      email: string;
      username: string;
      tenantId: number;
    },
  ) {
    this.logger.log('Creating user with OAuth:', oauthUserDto);
    return this.usersService.createUserWithOAuth({
      oauthProvider: oauthUserDto.oauthProvider,
      oauthId: oauthUserDto.oauthId,
      email: oauthUserDto.email,
      username: oauthUserDto.username,
      tenantId: oauthUserDto.tenantId,
    });
  }
}
