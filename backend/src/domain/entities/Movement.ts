/**
 * Domain Entity: Movement
 * Representa un movimiento de inventario (entrada, salida o ajuste).
 * 
 * INMUTABLE: Una vez creado, no puede ser modificado ni eliminado.
 * La inmutabilidad se garantiza con propiedades readonly.
 */

import { MovementType } from '../value-objects/MovementType';

export interface MovementProps {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  createdAt: Date;
}

export class Movement {
  readonly id: string;
  readonly productId: string;
  readonly type: MovementType;
  readonly quantity: number;
  readonly reason: string | null;
  readonly createdAt: Date;

  private constructor(props: MovementProps) {
    this.id = props.id;
    this.productId = props.productId;
    this.type = props.type;
    this.quantity = props.quantity;
    this.reason = props.reason ?? null;
    this.createdAt = props.createdAt;
  }

  /**
   * Factory method para crear un movimiento de ENTRADA.
   * Regla: La cantidad debe ser mayor a 0.
   */
  static createEntry(id: string, productId: string, quantity: number, createdAt: Date): Movement {
    if (quantity <= 0) {
      throw new DomainError('La cantidad debe ser mayor a 0');
    }

    return new Movement({
      id,
      productId,
      type: MovementType.ENTRY,
      quantity,
      createdAt,
    });
  }

  /**
   * Factory method para crear un movimiento de SALIDA.
   * Regla: La cantidad debe ser mayor a 0.
   * Regla: El stock actual debe ser suficiente (validado en el servicio de dominio).
   */
  static createExit(id: string, productId: string, quantity: number, createdAt: Date): Movement {
    if (quantity <= 0) {
      throw new DomainError('La cantidad debe ser mayor a 0');
    }

    return new Movement({
      id,
      productId,
      type: MovementType.EXIT,
      quantity,
      createdAt,
    });
  }

  /**
   * Factory method para crear un movimiento de AJUSTE.
   * Regla: La cantidad debe ser diferente de 0.
   * Regla: La justificación es obligatoria y debe tener al menos 10 caracteres.
   */
  static createAdjustment(id: string, productId: string, quantity: number, reason: string, createdAt: Date): Movement {
    if (quantity === 0) {
      throw new DomainError('La cantidad del ajuste no puede ser 0');
    }

    if (!reason || reason.trim().length === 0) {
      throw new DomainError('La justificación es obligatoria para ajustes');
    }

    if (reason.trim().length < 10) {
      throw new DomainError('La justificación debe tener al menos 10 caracteres');
    }

    return new Movement({
      id,
      productId,
      type: MovementType.ADJUSTMENT,
      quantity,
      reason: reason.trim(),
      createdAt,
    });
  }

  /**
   * Reconstituye un Movement desde persistencia.
   * No aplica validaciones porque ya fue validado al crearse.
   */
  static reconstitute(props: MovementProps): Movement {
    return new Movement(props);
  }

  /**
   * Calcula el efecto neto de este movimiento sobre el stock.
   * ENTRY: suma | EXIT: resta | ADJUSTMENT: suma (quantity puede ser negativo)
   */
  get stockEffect(): number {
    switch (this.type) {
      case MovementType.ENTRY:
        return this.quantity;
      case MovementType.EXIT:
        return -this.quantity;
      case MovementType.ADJUSTMENT:
        return this.quantity;
    }
  }
}

/**
 * Error específico del dominio.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
