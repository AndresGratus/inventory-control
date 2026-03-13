/**
 * Value Object: MovementType
 * Define los tipos de movimiento de inventario permitidos.
 */
export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export function isValidMovementType(value: string): value is MovementType {
  return Object.values(MovementType).includes(value as MovementType);
}
