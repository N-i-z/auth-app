import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter } from './auth/filters/custom-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { PerformanceInterceptor } from './interceptor/performance.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => new TenantMiddleware().use(req, res, next));
  app.use((req, res, next) =>
    new RequestLoggerMiddleware().use(req, res, next),
  );

  app.useGlobalInterceptors(new PerformanceInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(3003);
}
bootstrap();
