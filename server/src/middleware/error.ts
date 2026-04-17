import { Request, Response, NextFunction } from 'express';
import { sendServerError } from '../utils/response.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    sendServerError(res, err.message);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code: string; meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.join(', ') || 'field';
      sendServerError(res, `Duplicate value for ${target}`, 'Database constraint violation');
      return;
    }
    
    if (prismaError.code === 'P2025') {
      sendServerError(res, 'Record not found', 'Database not found error');
      return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendServerError(res, 'Invalid token', 'Authentication error');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendServerError(res, 'Token expired', 'Authentication error');
    return;
  }

  // Default error
  sendServerError(
    res,
    process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  );
};

export const notFoundHandler = (
  _req: Request,
  res: Response
): void => {
  sendServerError(res, 'Route not found', undefined, 404);
};
