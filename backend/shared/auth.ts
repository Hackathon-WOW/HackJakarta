import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Elysia } from 'elysia';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-super-secret-change-me-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type Role = 'MSME' | 'INVESTOR' | 'ADMIN';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  fullName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
}

// ---- password helpers ----
export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

// ---- token helpers ----
export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;

/**
 * Resolve the authenticated user from request headers.
 * Preference order:
 *  1. Gateway-injected headers (x-user-id / x-user-role / x-user-email) — trusted internal network.
 *  2. Raw `Authorization: Bearer <jwt>` — for direct/dev calls.
 */
export function resolveUser(headers: Record<string, string | undefined>): AuthUser | null {
  const gwId = headers['x-user-id'];
  const gwRole = headers['x-user-role'] as Role | undefined;
  if (gwId && gwRole) {
    return {
      id: gwId,
      role: gwRole,
      email: headers['x-user-email'] || '',
      fullName: headers['x-user-name'] ? decodeURIComponent(headers['x-user-name']) : '',
    };
  }

  const authHeader = headers['authorization'] || headers['Authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7));
      return { id: payload.sub, email: payload.email, role: payload.role, fullName: payload.fullName };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Elysia plugin that derives `user` (AuthUser | null) onto every request context.
 * Handlers decide whether to enforce auth via `requireAuth` / `requireRole`.
 */
export const authPlugin = new Elysia({ name: 'auth' }).derive({ as: 'global' }, ({ headers }) => ({
  user: resolveUser(headers as Record<string, string | undefined>),
}));

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Throw 401 if not authenticated; returns the user otherwise. */
export function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) throw new HttpError(401, 'Unauthorized — please log in');
  return user;
}

/** Throw 401/403 unless the user has one of the allowed roles. */
export function requireRole(user: AuthUser | null, ...roles: Role[]): AuthUser {
  const u = requireAuth(user);
  if (!roles.includes(u.role)) {
    throw new HttpError(403, `Forbidden — requires role: ${roles.join(' or ')}`);
  }
  return u;
}
