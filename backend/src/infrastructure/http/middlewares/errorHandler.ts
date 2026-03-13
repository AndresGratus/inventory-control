/**
 * Error Handler Middleware
 * Captura errores del dominio y los traduce a respuestas HTTP apropiadas.
 */

import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/entities/Movement';
import { ProductValidationError } from '../../../domain/entities/Product';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof DomainError || err instanceof ProductValidationError) {
    res.status(400).json({
      error: err.message,
      type: err.name,
    });
    return;
  }

  res.status(500).json({
    error: 'Error interno del servidor',
    type: 'InternalError',
  });
}
