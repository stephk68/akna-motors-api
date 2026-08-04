import { PaginationParams } from './pagination-params';

export interface PaginatedResult<T> {
  pagination: {
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    count: number;
    totalCount: number;
    totalPages: number;
  };
  result: T[];
}

export interface IPaginationService {
  paginate<T>(
    model: any,
    args?: any,
    options?: PaginationParams,
  ): Promise<PaginatedResult<T>>;
}
