import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

/**
 * M0-4 — rejections now go through the error handler so a 401 carries the same
 * `{ error: { code, message } }` envelope as every other failure. The message
 * stays coarse on purpose: "no token" and "bad token" are the same event to
 * the client, and distinguishing them tells a probe which half it got right.
 */
export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token) as { id: string } | null;

  if (!decoded) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }

  req.user = decoded;
  next();
};
