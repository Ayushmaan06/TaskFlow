export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly errors?: unknown
  ) {
    super(message);
    this.name = "AppError";
    // Maintains proper stack trace (V8 engines)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(errors: unknown) {
    super("Validation failed", 400, errors);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden: insufficient permissions") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Central error handler — translates domain errors into API responses.
 * Call this at the top of every route handler inside a try/catch.
 */
export function handleError(error: unknown): {
  message: string;
  statusCode: number;
  errors?: unknown;
} {
  if (error instanceof SyntaxError && /json/i.test(error.message)) {
    return { message: "Invalid JSON request body.", statusCode: 400 };
  }

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
    };
  }

  // Prisma unique constraint violation (P2002)
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  ) {
    return { message: "A record with this value already exists.", statusCode: 409 };
  }

  console.error("[Unhandled Error]", error);
  return { message: "Internal server error", statusCode: 500 };
}
