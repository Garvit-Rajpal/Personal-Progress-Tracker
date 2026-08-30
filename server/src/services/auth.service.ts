import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import crypto from 'crypto';
import { RoadmapLinkService } from './roadmapLink.service';
import { ApiError } from '../utils/apiError';

export class AuthService {
  static async register(email: string, passwordHashRaw: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    // M0-4 — a duplicate email is CONFLICT (409), not a generic 400. The unique
    // index is still the real guard; this is the readable message for the race
    // it does not lose.
    if (existing) throw ApiError.conflict('Email already in use');
    
    const passwordHash = await hashPassword(passwordHashRaw);
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    await RoadmapLinkService.ensureDefaultLinks(user.id);
    
    return this.generateTokens(user.id);
  }

  static async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Identical error for an unknown email and a wrong password — telling them
    // apart turns the login form into a registered-address oracle.
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    const isValid = await verifyPassword(passwordRaw, user.passwordHash);
    if (!isValid) throw ApiError.unauthorized('Invalid credentials');
    
    return this.generateTokens(user.id);
  }

  private static async generateTokens(userId: string) {
    const accessToken = signToken({ id: userId }, '15m');
    const refreshTokenPlain = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = await hashPassword(refreshTokenPlain);
    
    // A refresh token's lifetime is a duration, not a calendar day, so it is
    // expressed as one. `setDate` would have resolved in the server's timezone
    // — harmless here, but ADR-4's rule is that no day arithmetic in this app
    // depends on the container clock, and an exception nobody can see is how
    // the rule erodes.
    const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS);
    
    await prisma.session.create({
      data: {
        userId,
        refreshToken: refreshTokenHash,
        expiresAt
      }
    });
    
    return { accessToken, refreshToken: refreshTokenPlain, userId };
  }

  static async refresh(userId: string, incomingRefreshToken: string) {
    const sessions = await prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } }
    });
    
    let validSessionId = null;
    for (const session of sessions) {
      if (await verifyPassword(incomingRefreshToken, session.refreshToken)) {
        validSessionId = session.id;
        break;
      }
    }
    
    if (!validSessionId) throw ApiError.unauthorized('Invalid or expired refresh token');
    
    await prisma.session.delete({ where: { id: validSessionId } });
    return this.generateTokens(userId);
  }
}
