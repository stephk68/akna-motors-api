export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  periode?: {
    startDate?: Date;
    endDate?: Date;
  };
  profileIds?: string[];
}
