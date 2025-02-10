export interface GlobalResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse extends GlobalResponse {
  error: string;
  statusCode: number;
}

export interface PaginationResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}