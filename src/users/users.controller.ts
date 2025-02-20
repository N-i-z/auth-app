import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client'; // Ensure Role enum is imported

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    this.logger.log('Fetching all users');
    return this.usersService.findAll();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Registering user:', createUserDto);

    // Pass the role along with username and password
    return this.usersService.createUser(
      createUserDto.username,
      createUserDto.password,
      createUserDto.role || Role.User, // Default to User role if none provided
    );
  }
}
