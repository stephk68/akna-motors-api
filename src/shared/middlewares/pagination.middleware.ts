import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../interfaces/custom-request';
import { DEFAULT_PAGE_SIZE } from '../constants/constants';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
  use(req: CustomRequest, res: Response, next: NextFunction) {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : DEFAULT_PAGE_SIZE;
    const all = req.query.all === 'true' || req.query.all === '1';

    req.pagination = {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? DEFAULT_PAGE_SIZE : limit,
      all,
    };

    next();
  }
}
