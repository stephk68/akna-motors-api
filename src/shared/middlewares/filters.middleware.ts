import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../interfaces/custom-request';
import { parseCsvParam } from '../utilities/functionUtile';

@Injectable()
export class FiltersMiddleware implements NestMiddleware {
  use(req: CustomRequest, res: Response, next: NextFunction) {
    const search = req.query.search ? (req.query.search as string) : undefined;
    const sortBy = req.query.sortBy ? (req.query.sortBy as string) : undefined;
    const sortDirection =
      req.query.sortDirection === 'desc' ? 'desc' : ('asc' as 'asc' | 'desc');

    let periode: { startDate?: Date; endDate?: Date } | undefined = undefined;
    if (req.query.startDate || req.query.endDate) {
      periode = {};
      if (req.query.startDate) {
        periode.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        periode.endDate = new Date(req.query.endDate as string);
      }
    }

    const profileIds = parseCsvParam(req.query.profileIds as string);

    req.filters = {
      search,
      sortBy,
      sortDirection,
      periode,
      profileIds: profileIds.length > 0 ? profileIds : undefined,
    };

    next();
  }
}
