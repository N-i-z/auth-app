import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      exceptionResponse instanceof Object && 'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : exception.message;

    // Custom handling for authentication-related exceptions
    if (exception instanceof UnauthorizedException) {
      response.status(status).json({
        statusCode: status,
        message: 'Authentication failed: ' + message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (exception instanceof ForbiddenException) {
      response.status(status).json({
        statusCode: status,
        message: 'Access denied: ' + message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // General error handling for other exceptions
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
