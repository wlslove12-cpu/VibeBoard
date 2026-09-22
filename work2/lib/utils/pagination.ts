export const ITEMS_PER_PAGE = 10;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const paginate = <T>(
  items: T[],
  page: number = 1,
  limit: number = ITEMS_PER_PAGE
): PaginationResponse<T> => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = items.slice(start, end);
  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
