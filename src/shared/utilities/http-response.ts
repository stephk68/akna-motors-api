export interface ApiResponse<T = any> {
  error: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

export function createSuccessResponse<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
): ApiResponse<T> {
  return {
    error: false,
    statusCode,
    message,
    data,
  };
}

export function createErrorResponse(
  message: string,
  statusCode = 400,
): ApiResponse<null> {
  return {
    error: true,
    statusCode,
    message,
    data: null,
  };
}
