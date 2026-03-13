/**
 * Domain Entity: Product
 * Representa un producto en el inventario.
 * 
 * IMPORTANTE: El stock NO se almacena como campo.
 * Se calcula siempre a partir del historial de movimientos (RN-005).
 */

import { Movement } from './Movement';

export interface ProductProps {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  private _name: string;
  private _description: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this._name = props.name;
    this._description = props.description;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Factory method para crear un nuevo producto.
   * Regla: El nombre es obligatorio.
   */
  static create(id: string, name: string, description?: string): Product {
    if (!name || name.trim().length === 0) {
      throw new ProductValidationError('El nombre del producto es obligatorio');
    }

    const now = new Date();
    return new Product({
      id,
      name: name.trim(),
      description: description?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstituye un Product desde persistencia.
   */
  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  /**
   * Calcula el stock actual basado en el historial de movimientos.
   * RN-005: El stock se calcula en el dominio a partir del historial.
   */
  static calculateStock(movements: Movement[]): number {
    return movements.reduce((stock, movement) => stock + movement.stockEffect, 0);
  }
}

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}
