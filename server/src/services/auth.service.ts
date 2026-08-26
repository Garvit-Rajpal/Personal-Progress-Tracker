import { prisma } from '../index';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import crypto from 'crypto';
import { RoadmapLinkService } from './roadmapLink.service';

export class AuthService {
  static async register(email: string, passwordHashRaw: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already in use');
    
    const passwordHash = await hashPassword(passwordHashRaw);
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    await RoadmapLinkService.ensureDefaultLinks(user.id);
    
    return this.generateTokens(user.id);
  }

  static async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    
    const isValid = await verifyPassword(passwordRaw, user.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');
    
    return this.generateTokens(user.id);
  }

  private static async generateTokens(userId: string) {
    const accessToken = signToken({ id: userId }, '15m');
    const refreshTokenPlain = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = await hashPassword(refreshTokenPlain);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
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
    
    if (!validSessionId) throw new Error('Invalid or expired refresh token');
    
    await prisma.session.delete({ where: { id: validSessionId } });
    return this.generateTokens(userId);
  }
}
