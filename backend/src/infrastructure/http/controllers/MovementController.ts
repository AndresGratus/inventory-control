/**
 * Movement Controller
 * Traduce requests HTTP a llamadas de casos de uso para movimientos.
 */

import { Request, Response, NextFunction } from 'express';
import { RegisterMovement } from '../../../application/use-cases/RegisterMovement';

export class MovementController {
  constructor(
    private readonly registerMovementUC: RegisterMovement,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.id as string;
      const { type, quantity, reason } = req.body;

      const movement = await this.registerMovementUC.execute(productId, {
        type,
        quantity,
        reason,
      });

      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  };
}
