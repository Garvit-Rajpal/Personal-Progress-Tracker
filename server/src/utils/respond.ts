/**
 * The success half of the envelope (`docs/LLD_v2.md` §4).
 *
 * Every successful response is `{ data }` and nothing else. Going through this
 * function rather than `res.json(result)` is what keeps that true — the
 * integration tests assert the response has exactly one top-level key.
 */
import { Response } from 'express';

export function sendData<T>(res: Response, status: number, data: T): void {
  res.status(status).json({ data });
}
