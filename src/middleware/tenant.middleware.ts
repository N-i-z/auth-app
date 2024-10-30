import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const tenantId = req.headers['tenant-id']; // Assume tenant ID comes from headers
    req['tenantId'] = tenantId; // Store tenantId in the request object
    next();
  }
}
