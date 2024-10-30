import { IsEmail, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role?: Role;

  @IsNumber()
  @IsNotEmpty()
  tenantId: number;

  @IsEmail()
  email?: string;
}
