// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Optional, makes PrismaService available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporting PrismaService
})
export class PrismaModule {}
