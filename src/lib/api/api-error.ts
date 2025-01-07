export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static fromError(error: unknown): ApiError {
    if (ApiError.isApiError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(error.message, 500);
    }

    return new ApiError("An unexpected error occurred", 500);
  }
}

export function handleApiError(error: unknown) {
  const apiError = ApiError.fromError(error);

  if (apiError.message.includes("Expired token") || apiError.status === 401) {
    throw new ApiError(
      "Your session has expired. Please login again.",
      401,
      "SESSION_EXPIRED"
    );
  }

  throw apiError;
}
