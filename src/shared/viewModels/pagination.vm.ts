export class PaginationMeta {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  count: number;
  totalCount: number;
  totalPages: number;
}

export class PaginatedVm<T> {
  pagination: PaginationMeta;
  result: T[];

  constructor(pagination: PaginationMeta, result: T[]) {
    this.pagination = pagination;
    this.result = result;
  }
}
