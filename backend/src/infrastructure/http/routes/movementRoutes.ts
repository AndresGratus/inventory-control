/**
 * Movement Routes
 * Define los endpoints REST para movimientos de inventario.
 * 
 * NOTA: Solo POST y GET — no hay PUT/DELETE (inmutabilidad RN-003).
 */

import { Router } from 'express';
import { MovementController } from '../controllers/MovementController';

export function createMovementRoutes(controller: MovementController): Router {
  const router = Router({ mergeParams: true });

  router.post('/', controller.register);

  return router;
}
