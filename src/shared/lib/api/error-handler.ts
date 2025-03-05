import { ZodError } from "zod";

interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export type ServerActionResult<T> = {
  data?: T;
  error?: {
    message: string;
    code: string;
    validationErrors?: Record<string, string[]>;
  };
};

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

export function handleServerActionError(
  error: unknown
): ServerActionResult<never> {
  console.error("Server Action Error:", error);

  if (error instanceof ValidationError) {
    return {
      error: {
        message: error.message,
        code: "VALIDATION_ERROR",
        validationErrors: error.errors,
      },
    };
  }

  if (error instanceof ApiError) {
    if (error.status === 422) {
      return {
        error: {
          message: error.message,
          code: "VALIDATION_ERROR",
          validationErrors: error.errors,
        },
      };
    }

    return {
      error: {
        message: "An unexpected error occurred",
        code: `HTTP_${error.status}`,
      },
    };
  }

  return {
    error: {
      message: "An unexpected error occurred",
      code: "INTERNAL_SERVER_ERROR",
    },
  };
}

export function handleApiError(error: unknown): never {
  if (!(error instanceof Error)) {
    throw error;
  }

  const apiError = error as ApiError;

  if (apiError.status !== 422) {
    throw error;
  }

  throw new ValidationError({
    message: apiError.message,
    errors: apiError.errors || {},
  });
}

function convertValidationErrorToFormError(error: ValidationError) {
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
