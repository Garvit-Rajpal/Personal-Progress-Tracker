/**
 * M0-6 — service tests for the existing auth service.
 *
 * This is the safety net MA-4 / MA-11 / MB-5 lean on (ADR-10): those
 * migrations run against real rows, and if any of them corrupts the user or
 * session tables these are the tests that notice.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { verifyToken } from '../../src/utils/jwt';
import { isApiError } from '../../src/utils/apiError';
import { prisma, resetUserData, disconnect } from '../helpers/db';

const EMAIL = 'auth-service@example.com';
const PASSWORD = 'a-sufficiently-long-password';

beforeEach(async () => {
  await resetUserData();
});

afterAll(async () => {
  await disconnect();
});

describe('AuthService.register', () => {
  it('returns an access token, a refresh token and the user id', async () => {
    const result = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.userId).toEqual(expect.any(String));
  });

  it('issues an access token that carries the user id', async () => {
    const { accessToken, userId } = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    expect(verifyToken(accessToken)).toMatchObject({ id: userId });
  });

  it('never stores the password in plain text', async () => {
    await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    const user = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } });

    expect(user.passwordHash).not.toBe(PASSWORD);
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt
  });

  it('stores the refresh token hashed, not raw', async () => {
    const { refreshToken } = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    const session = await prisma.session.findFirstOrThrow();

    expect(session.refreshToken).not.toBe(refreshToken);
    expect(session.refreshToken).toMatch(/^\$2[aby]\$/);
  });

  it('seeds the two default roadmap links for the new user', async () => {
    const { userId } = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    const links = await prisma.userRoadmapLink.findMany({ where: { userId } });

    expect(links).toHaveLength(2);
    expect(links.every((l) => l.kind === 'DEFAULT')).toBe(true);
  });

  it('rejects a duplicate email with CONFLICT', async () => {
    await AuthService.register(EMAIL, PASSWORD, 'Auth Service');

    await expect(AuthService.register(EMAIL, PASSWORD, 'Someone Else')).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'CONFLICT'
    );
  });

  it('does not create a second user when the email is taken', async () => {
    await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    await AuthService.register(EMAIL, PASSWORD, 'Someone Else').catch(() => undefined);

    expect(await prisma.user.count()).toBe(1);
  });

  it('gives the session a future expiry', async () => {
    await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    const session = await prisma.session.findFirstOrThrow();

    expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('expires the session roughly seven days out', async () => {
    await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    const session = await prisma.session.findFirstOrThrow();
    const days = (session.expiresAt.getTime() - Date.now()) / 86_400_000;

    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });
});

describe('AuthService.login', () => {
  beforeEach(async () => {
    await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
  });

  it('accepts the correct password', async () => {
    const result = await AuthService.login(EMAIL, PASSWORD);
    expect(result.accessToken).toEqual(expect.any(String));
  });

  it('rejects a wrong password with UNAUTHORIZED', async () => {
    await expect(AuthService.login(EMAIL, 'the-wrong-password')).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'UNAUTHORIZED'
    );
  });

  it('rejects an unknown email with UNAUTHORIZED, not NOT_FOUND', async () => {
    await expect(AuthService.login('nobody@example.com', PASSWORD)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'UNAUTHORIZED'
    );
  });

  it('creates an additional session per login rather than reusing one', async () => {
    await AuthService.login(EMAIL, PASSWORD);
    expect(await prisma.session.count()).toBe(2);
  });
});

describe('AuthService.refresh', () => {
  it('rotates the refresh token', async () => {
    const { userId, refreshToken } = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    const rotated = await AuthService.refresh(userId, refreshToken);

    expect(rotated.refreshToken).not.toBe(refreshToken);
  });

  it('invalidates the old token once it has been exchanged', async () => {
    const { userId, refreshToken } = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    await AuthService.refresh(userId, refreshToken);

    await expect(AuthService.refresh(userId, refreshToken)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'UNAUTHORIZED'
    );
  });

  it('leaves exactly one live session after a rotation', async () => {
    const { userId, refreshToken } = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    await AuthService.refresh(userId, refreshToken);

    expect(await prisma.session.count({ where: { userId } })).toBe(1);
  });

  it('rejects an expired session (invariant: expiry is enforced in the query)', async () => {
    const { userId, refreshToken } = await AuthService.register(EMAIL, PASSWORD, 'Auth Service');
    await prisma.session.updateMany({
      where: { userId },
      data: { expiresAt: new Date(Date.now() - 1000) }
    });

    await expect(AuthService.refresh(userId, refreshToken)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'UNAUTHORIZED'
    );
  });

  it("refuses another user's refresh token (invariant 1)", async () => {
    const mine = await AuthService.register(EMAIL, PASSWORD, 'Mine');
    const theirs = await AuthService.register('other@example.com', PASSWORD, 'Theirs');

    await expect(AuthService.refresh(mine.userId, theirs.refreshToken)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'UNAUTHORIZED'
    );
  });
});
