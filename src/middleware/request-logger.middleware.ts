import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const requestId = uuid();
    const tenantId = req.headers['x-tenant-id']; // Get the tenant ID from the headers
    const tenantLog = tenantId ? ` Tenant ID: ${tenantId}` : ''; // Create a log message if tenant ID exists

    console.log(`[${requestId}] ${req.method} ${req.url}${tenantLog}`);

    req['requestId'] = requestId; // Store requestId in the request object
    req['tenantId'] = tenantId; // Optionally store tenantId in the request object

    next();
  }
}
