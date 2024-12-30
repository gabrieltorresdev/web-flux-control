import { ZodError } from "zod";

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends Error {
  errors: Record<string, string[]>;

  constructor(response: ValidationErrorResponse) {
    super(response.message);
    this.errors = response.errors;
    this.name = "ValidationError";
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new ApiError(500, error.message);
  }

  throw new ApiError(500, "An unexpected error occurred");
}

export function handleValidationError(error: unknown): ValidationError {
  if (!(error instanceof Error)) {
    throw error;
  }

  const apiError = error as ApiError;

  if (apiError.status !== 422) {
    throw error;
  }

  return new ValidationError({
    message: apiError.message,
    errors: apiError.errors || {},
  });
}

export function convertValidationErrorToFormError(error: ValidationError) {
  const formattedErrors: Record<string, { message: string }> = {};

  Object.entries(error.errors).forEach(([field, messages]) => {
    formattedErrors[field] = { message: messages[0] };
  });

  return {
    formErrors: formattedErrors,
    zodError: new ZodError(
      Object.entries(error.errors).map(([path, messages]) => ({
        code: "custom",
        path: [path],
        message: messages[0],
      }))
    ),
  };
}
