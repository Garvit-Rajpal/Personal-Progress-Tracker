import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token) as { id: string } | null;
  
  if (!decoded) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
  
  req.user = decoded;
  next();
};
