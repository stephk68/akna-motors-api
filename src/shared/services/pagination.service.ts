import { Injectable } from '@nestjs/common';
import { IPaginationService, PaginatedResult } from '../interfaces/IPaginationService';
import { PaginationParams } from '../interfaces/pagination-params';
import { DEFAULT_PAGE_SIZE } from '../constants/constants';

@Injectable()
export class PaginationService implements IPaginationService {
  async paginate<T>(
    model: any,
    args: any = {},
    options?: PaginationParams,
  ): Promise<PaginatedResult<T>> {
    const page = options?.page && options.page > 0 ? Number(options.page) : 1;
    const limit = options?.limit && options.limit > 0 ? Number(options.limit) : DEFAULT_PAGE_SIZE;
    const all = options?.all === true;

    const totalCount = await model.count({ where: args.where });

    if (all) {
      const result = await model.findMany({ ...args });
      return {
        pagination: {
          currentPage: 1,
          previousPage: null,
          nextPage: null,
          count: result.length,
          totalCount,
          totalPages: 1,
        },
        result,
      };
    }

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const skip = (page - 1) * limit;

    const result = await model.findMany({
      ...args,
      skip,
      take: limit,
    });

    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      pagination: {
        currentPage: page,
        previousPage,
        nextPage,
        count: result.length,
        totalCount,
        totalPages,
      },
      result,
    };
  }
}
