import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { toFieldErrors, type ApiErrorBody } from '@shop/shared';
import { AppError } from '../errors';

export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiErrorBody = { error: { code: 'NOT_FOUND', message: 'Route not found' } };
  res.status(404).json(body);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let body: ApiErrorBody = {
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side. Please try again.' },
  };

  if (err instanceof AppError) {
    status = err.status;
    body = { error: { code: err.code, message: err.message, fieldErrors: err.fieldErrors } };
  } else if (err instanceof ZodError) {
    status = 400;
    body = {
      error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', fieldErrors: toFieldErrors(err) },
    };
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    body = { error: { code: 'BAD_REQUEST', message: 'Request body is not valid JSON.' } };
  } else {
    console.error(err);
  }

  res.status(status).json(body);
};
