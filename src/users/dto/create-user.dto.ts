import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';
export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role?: Role;
}
