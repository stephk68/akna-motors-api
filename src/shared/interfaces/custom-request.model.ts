import { Request } from 'express';
import { UserPayload } from '../types/types';
import { PaginationParams } from './pagination-params';
import { FilterParams } from './filter-params';

export interface CustomRequestModel extends Request {
  user?: UserPayload;
  pagination?: PaginationParams;
  filters?: FilterParams;
}
