/**
 * Domain Repository Interface: IMovementRepository
 * Define el contrato para persistencia de movimientos de inventario.
 * 
 * NOTA: No hay métodos update() ni delete() — los movimientos son INMUTABLES (RN-003).
 */

import { Movement } from '../entities/Movement';

export interface IMovementRepository {
  save(movement: Movement): Promise<void>;
  findByProductId(productId: string): Promise<Movement[]>;
  findAll(): Promise<Movement[]>;
}
