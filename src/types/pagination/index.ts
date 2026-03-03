/** Ready-to-use query params type for list/search API endpoints */
export interface PaginatedQueryParams extends PaginationParams, SearchParams {
  sort?: string;
}
