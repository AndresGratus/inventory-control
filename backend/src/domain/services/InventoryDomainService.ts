/**
 * Domain Service: InventoryDomainService
 * 
 * Contiene la LÓGICA DE NEGOCIO central del sistema de inventario.
 * Aquí se aplican todas las reglas de negocio (RN-001 a RN-007).
 * 
 * IMPORTANTE: Este servicio NO conoce la infraestructura.
 * Trabaja solo con entidades y repositorios (interfaces).
 */

import { Product } from '../entities/Product';
import { Movement, DomainError } from '../entities/Movement';
import { MovementType } from '../value-objects/MovementType';
import { IMovementRepository } from '../repositories/IMovementRepository';

export class InventoryDomainService {

  /**
   * Calcula el stock actual de un producto a partir de sus movimientos.
   * RN-005: El stock se calcula en el dominio a partir del historial.
   */
  calculateStock(movements: Movement[]): number {
    return Product.calculateStock(movements);
  }

  /**
   * Valida y crea un movimiento de ENTRADA.
   * Solo valida que la cantidad sea > 0 (ya lo hace Movement.createEntry).
   */
  createEntry(id: string, productId: string, quantity: number): Movement {
    return Movement.createEntry(id, productId, quantity, new Date());
  }

  /**
   * Valida y crea un movimiento de SALIDA.
   * RN-001: Stock no puede ser negativo.
   * RN-002: Solo se registra si hay stock suficiente.
   */
  createExit(id: string, productId: string, quantity: number, currentMovements: Movement[]): Movement {
    const currentStock = this.calculateStock(currentMovements);

    if (currentStock < quantity) {
      throw new DomainError(
        `Stock insuficiente. Disponible: ${currentStock}`
      );
    }

    return Movement.createExit(id, productId, quantity, new Date());
  }

  /**
   * Valida y crea un movimiento de AJUSTE.
   * RN-001: Stock no puede ser negativo después del ajuste.
   * RN-004: Justificación obligatoria.
   */
  createAdjustment(
    id: string,
    productId: string,
    quantity: number,
    reason: string,
    currentMovements: Movement[]
  ): Movement {
    const currentStock = this.calculateStock(currentMovements);
    const newStock = currentStock + quantity;

    if (newStock < 0) {
      throw new DomainError(
        `El ajuste dejaría el stock en negativo. Stock actual: ${currentStock}`
      );
    }

    return Movement.createAdjustment(id, productId, quantity, reason, new Date());
  }
}
