/**
 * The error half of the envelope (`docs/LLD_v2.md` §4), plus the 404 for
 * unmatched routes.
 *
 * Express 5 forwards a rejected async handler here automatically, which is why
 * the converted controllers have no try/catch: a controller's job is to call
 * the service and shape the success case, and throwing is how it reports
 * anything else.
 */
import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError, ErrorCode, isApiError } from '../utils/apiError';

/** Unmatched route. Mounted after every router, before this handler. */
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound('Route not found'));
}

interface ErrorBody {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

function classify(error: unknown): { status: number; body: ErrorBody } {
  if (isApiError(error)) {
    return {
      status: error.status,
      body: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) }
    };
  }

  // `express.json()` rejects a malformed body with a SyntaxError carrying a
  // status. That is a client mistake, not a server fault, so it is a 400 —
  // and its message quotes the raw body, so it is replaced rather than echoed.
  if (error instanceof SyntaxError && (error as SyntaxError & { status?: number }).status === 400) {
    return { status: 400, body: { code: 'VALIDATION_FAILED', message: 'Request body is not valid JSON' } };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 unique constraint, P2025 record required but not found.
    if (error.code === 'P2002') {
      return { status: 409, body: { code: 'CONFLICT', message: 'That record already exists' } };
    }
    if (error.code === 'P2025') {
      return { status: 404, body: { code: 'NOT_FOUND', message: 'Not found' } };
    }
  }

  return { status: 500, body: { code: 'INTERNAL', message: 'Something went wrong' } };
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const { status, body } = classify(error);

  // An unclassified error is a bug, and the client is told nothing about it —
  // so it has to be visible somewhere. Tests set NODE_ENV=test and would
  // otherwise print a stack for every deliberately-provoked 500.
  if (status === 500 && process.env.NODE_ENV !== 'test') {
    console.error('Unhandled error', error);
  }

  res.status(status).json({ error: body });
}
