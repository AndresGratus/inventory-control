/**
 * Product Routes
 * Define los endpoints REST para productos.
 */

import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);

  return router;
}
