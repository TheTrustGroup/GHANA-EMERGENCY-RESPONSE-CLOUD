/**
 * Custom Error Classes
 * Standardized error handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Global error handler
 * Converts various error types to standardized format
 */
export function handleError(error: unknown): {
  message: string;
  statusCode: number;
  code: string;
} {
  // Known app errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };

    if (prismaError.code === 'P2002') {
      return {
        message: 'A record with this value already exists',
        statusCode: 409,
        code: 'DUPLICATE_ENTRY',
      };
    }

    if (prismaError.code === 'P2025') {
      return {
        message: 'Record not found',
        statusCode: 404,
        code: 'NOT_FOUND',
      };
    }
  }

  // Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ message: string; path: (string | number)[] }> };
    return {
      message: zodError.issues.map((e) => e.message).join(', '),
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    };
  }

  // Unknown errors - log and return generic message
  if (error instanceof Error) {
    console.error('Unhandled error:', error);
  } else {
    console.error('Unhandled error (unknown type):', error);
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    code: 'INTERNAL_ERROR',
  };
}
