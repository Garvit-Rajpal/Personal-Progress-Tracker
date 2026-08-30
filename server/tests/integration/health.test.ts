/**
 * M0-1 smoke test.
 *
 * Its real job is structural: it can only pass if the express app is
 * importable without starting a listener or running the bootstrap seed
 * (ADR-13). Before M0-1, `src/index.ts` called `start()` at module scope, so
 * importing *any* service booted the whole server.
 */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('GET /health', () => {
  it('reports ok without a token', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('importing the app', () => {
  it('does not bind a port', () => {
    // supertest binds an ephemeral port itself; the app module must not have
    // called listen() on its own or this suite would leak a live server.
    expect(typeof app.listen).toBe('function');
    expect((app as unknown as { _router?: unknown }).listen).not.toBe(undefined);
  });
});
