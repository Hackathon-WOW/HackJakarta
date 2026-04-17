import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { sendUnauthorized, sendForbidden } from '../utils/response.js';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      sendUnauthorized(res, 'No authentication token provided');
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendUnauthorized(res, 'Invalid or expired token');
  }
};

export const authorize = (...allowedRoles: Array<'ADMIN' | 'MSME' | 'INVESTOR'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendForbidden(res, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
      return;
    }

    next();
  };
};

export const isAdmin = authorize('ADMIN');
export const isMSME = authorize('MSME');
export const isInvestor = authorize('INVESTOR');
export const isAdminOrMSME = authorize('ADMIN', 'MSME');
export const isAdminOrInvestor = authorize('ADMIN', 'INVESTOR');
