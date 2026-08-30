/**
 * The error vocabulary from `docs/LLD_v2.md` §4.
 *
 * A service throws an `ApiError` when it knows *which* failure this is; the
 * error handler turns that into `{ error: { code, message, details } }`.
 * Anything else that escapes a controller becomes `INTERNAL` with a generic
 * message, because an unclassified error is by definition one whose text has
 * not been reviewed for what it discloses.
 */

export const ERROR_CODES = [
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'CONFLICT',
  /** Attempt to mutate a metric entry outside its own date (invariant 3). Used from MA-2. */
  'IMMUTABLE_HISTORY',
  'INTERNAL'
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_FAILED: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IMMUTABLE_HISTORY: 409,
  INTERNAL: 500
};

/** One field-level complaint. Shaped for a form to render next to an input. */
export interface ErrorDetail {
  path: string;
  message: string;
}

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static validationFailed(message: string, details?: ErrorDetail[]) {
    return new ApiError('VALIDATION_FAILED', message, details);
  }

  static notFound(message = 'Not found') {
    return new ApiError('NOT_FOUND', message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError('UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError('FORBIDDEN', message);
  }

  static conflict(message: string) {
    return new ApiError('CONFLICT', message);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
