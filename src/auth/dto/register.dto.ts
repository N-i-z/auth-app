import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(Role) // Ensure the role is one of the defined roles
  role?: Role; // This can be optional or required based on your requirements
}
