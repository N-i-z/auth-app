import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantMiddleware } from '../middleware/tenant.middleware'; // Adjust the path as necessary
import { TenantsService } from './tenants.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(TenantsController);
  }
}
