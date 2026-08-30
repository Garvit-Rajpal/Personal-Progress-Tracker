/**
 * Request schemas for `/api/auth` (M0-4). Validation lives at the controller
 * boundary; the service assumes a shaped input (`CLAUDE.md` §Conventions).
 */
import { z } from 'zod';

/**
 * 12 characters, not 8. This is a single-user personal system holding a year of
 * private history behind one password with no MFA and no lockout, so length is
 * most of the defence. Existing accounts are unaffected — only registration
 * validates.
 */
const password = z.string().min(12, 'Password must be at least 12 characters');

export const registerSchema = z.object({
  email: z.email('Enter a valid email address'),
  password,
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name must be 120 characters or less')
});

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  // Deliberately not `password` — an existing account may predate the rule
  // above, and a length complaint on a login form is a disclosure anyway.
  password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
  userId: z.uuid('userId must be a uuid'),
  refreshToken: z.string().min(1, 'refreshToken is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
