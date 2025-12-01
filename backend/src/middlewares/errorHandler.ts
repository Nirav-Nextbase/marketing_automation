import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { createLogger } from '../utils/logger';

export class HttpError extends Error {
  constructor(public status = 500, message?: string, public details?: unknown) {
    super(message ?? 'Unexpected server error');
  }
}

const logger = createLogger('errorHandler');

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid payload',
      issues: err.issues,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details,
    });
  }

  // Surface unexpected failures in logs before responding to the client.
  logger.error('Unhandled server error', err);

  return res.status(500).json({
    message: 'Unexpected error occurred',
  });
};

