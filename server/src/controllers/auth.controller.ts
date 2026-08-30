/**
 * M0-4 — converted to the `{ data }` envelope.
 *
 * Errors are forwarded to `errorHandler`, which owns the `{ error }` half. A
 * controller that catches its own errors is a controller that decides status
 * codes, and that decision belongs in exactly one place.
 */
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendData } from '../utils/respond';
import { LoginInput, RefreshInput, RegisterInput } from '../schemas/auth.schema';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body as RegisterInput;
    sendData(res, 201, await AuthService.register(email, password, name));
  } catch (e) {
    next(e);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginInput;
    sendData(res, 200, await AuthService.login(email, password));
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, refreshToken } = req.body as RefreshInput;
    sendData(res, 200, await AuthService.refresh(userId, refreshToken));
  } catch (e) {
    next(e);
  }
};
