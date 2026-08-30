/**
 * M0-4 — the `{ data }` / `{ error: { code, message, details } }` envelope
 * (`docs/LLD_v2.md` §4), asserted end to end on the auth routes.
 *
 * Auth is the route family M0-4 converts (ADR-14): it is the only one that
 * exercises validation, a unique-constraint conflict and a 401 in one place,
 * and it is the only one whose response shape the client reads by field name,
 * so converting it proves the client contract too.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { resetUserData, disconnect, prisma } from '../helpers/db';

const CREDENTIALS = { email: 'envelope@example.com', password: 'correct-horse-battery', name: 'Envelope' };

beforeEach(async () => {
  await resetUserData();
});

afterAll(async () => {
  await disconnect();
});

/** Every response is exactly one of the two shapes, never both and never neither. */
function expectEnvelope(body: unknown) {
  const b = body as Record<string, unknown>;
  const hasData = Object.prototype.hasOwnProperty.call(b, 'data');
  const hasError = Object.prototype.hasOwnProperty.call(b, 'error');
  expect([hasData, hasError]).toEqual(hasData ? [true, false] : [false, true]);
}

describe('POST /api/auth/register — success shape', () => {
  it('returns 201 with the payload under `data`', async () => {
    const res = await request(app).post('/api/auth/register').send(CREDENTIALS);

    expect(res.status).toBe(201);
    expectEnvelope(res.body);
    expect(res.body.data).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      userId: expect.any(String)
    });
  });

  it('does not leak the tokens outside the envelope', async () => {
    const res = await request(app).post('/api/auth/register').send(CREDENTIALS);

    expect(res.body.accessToken).toBeUndefined();
    expect(Object.keys(res.body)).toEqual(['data']);
  });

  it('actually created the user', async () => {
    await request(app).post('/api/auth/register').send(CREDENTIALS);
    expect(await prisma.user.count({ where: { email: CREDENTIALS.email } })).toBe(1);
  });
});

describe('POST /api/auth/register — error shape', () => {
  it('returns VALIDATION_FAILED with per-field details when the body is empty', async () => {
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).toBe(400);
    expectEnvelope(res.body);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(typeof res.body.error.message).toBe('string');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.map((d: { path: string }) => d.path).sort()).toEqual([
      'email',
      'name',
      'password'
    ]);
  });

  it('rejects a malformed email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...CREDENTIALS, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.details.map((d: { path: string }) => d.path)).toEqual(['email']);
  });

  it('rejects a password below the minimum length', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...CREDENTIALS, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d: { path: string }) => d.path)).toEqual(['password']);
  });

  it('writes nothing when validation fails', async () => {
    await request(app).post('/api/auth/register').send({});
    expect(await prisma.user.count()).toBe(0);
  });

  it('returns CONFLICT, not a generic 400, for a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(CREDENTIALS);
    const res = await request(app).post('/api/auth/register').send(CREDENTIALS);

    expect(res.status).toBe(409);
    expectEnvelope(res.body);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('never returns a stack trace or an internal field name to the client', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(JSON.stringify(res.body)).not.toMatch(/stack|prisma|PrismaClient/i);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(CREDENTIALS);
  });

  it('returns 200 with tokens under `data`', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: CREDENTIALS.email, password: CREDENTIALS.password });

    expect(res.status).toBe(200);
    expectEnvelope(res.body);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
  });

  it('returns UNAUTHORIZED for a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: CREDENTIALS.email, password: 'wrong-password-entirely' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns UNAUTHORIZED for an unknown email, not NOT_FOUND', async () => {
    // Distinguishing the two would tell an attacker which emails are registered.
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: CREDENTIALS.password });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('gives the same message for a wrong password and an unknown email', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: CREDENTIALS.email, password: 'wrong-password-entirely' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: CREDENTIALS.password });

    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
  });
});

describe('POST /api/auth/refresh', () => {
  it('exchanges a valid refresh token and returns the new pair under `data`', async () => {
    const registered = await request(app).post('/api/auth/register').send(CREDENTIALS);
    const { userId, refreshToken } = registered.body.data;

    const res = await request(app).post('/api/auth/refresh').send({ userId, refreshToken });

    expect(res.status).toBe(200);
    expectEnvelope(res.body);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
  });

  it('returns UNAUTHORIZED for a refresh token that has already been used', async () => {
    const registered = await request(app).post('/api/auth/register').send(CREDENTIALS);
    const { userId, refreshToken } = registered.body.data;

    await request(app).post('/api/auth/refresh').send({ userId, refreshToken });
    const replay = await request(app).post('/api/auth/refresh').send({ userId, refreshToken });

    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns VALIDATION_FAILED when userId is not a uuid', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ userId: 'nope', refreshToken: 'x' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });
});

describe('the authenticate middleware', () => {
  it('returns the envelope with UNAUTHORIZED when no token is supplied', async () => {
    const res = await request(app).get('/api/dsa/today');

    expect(res.status).toBe(401);
    expectEnvelope(res.body);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns the envelope with UNAUTHORIZED for a garbage token', async () => {
    const res = await request(app).get('/api/dsa/today').set('Authorization', 'Bearer not.a.jwt');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns UNAUTHORIZED when the scheme is not Bearer', async () => {
    const res = await request(app).get('/api/dsa/today').set('Authorization', 'Basic abc123');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('unmatched routes and malformed bodies', () => {
  it('returns NOT_FOUND in the envelope for an unknown path', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expectEnvelope(res.body);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns VALIDATION_FAILED for a body that is not valid JSON', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    expect(res.status).toBe(400);
    expectEnvelope(res.body);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('leaves /health outside the envelope, as an infrastructure probe', async () => {
    // Deliberate: /health is read by docker-compose and uptime checks, not by
    // the client, and wrapping it would break anything already watching it.
    const res = await request(app).get('/health');
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});
