/**
 * zod validation at the controller boundary (`CLAUDE.md` §Conventions).
 *
 * A service may assume its input is already *shaped*; it may not assume it is
 * authorised. This middleware is the shaping half — it replaces `req.body`
 * with the parsed value, so a controller downstream is working with the type
 * the schema describes, not with whatever arrived.
 */
import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { ApiError, ErrorDetail } from '../utils/apiError';

type Source = 'body' | 'query' | 'params';

function toDetails(issues: Array<{ path: PropertyKey[]; message: string }>): ErrorDetail[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join('.') || '(root)',
    message: issue.message
  }));
}

export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(ApiError.validationFailed('Request validation failed', toDetails(result.error.issues)));
      return;
    }

    // `req.query` and `req.params` are getter-only in Express 5, so only the
    // body is replaced. Callers reading query/params should use the schema's
    // output where they need coercion.
    if (source === 'body') req.body = result.data;

    next();
  };
}
