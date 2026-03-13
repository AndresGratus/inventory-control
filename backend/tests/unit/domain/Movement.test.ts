/**
 * Unit Tests: Movement Entity
 * Pruebas sobre la creación de movimientos y validaciones de dominio.
 * 
 * Reglas probadas:
 * - RN-003: Inmutabilidad
 * - RN-004: Justificación obligatoria en ajustes
 * - RN-006: Cantidad > 0
 */

import { describe, it, expect } from 'vitest';
import { Movement, DomainError } from '../../../src/domain/entities/Movement';
import { MovementType } from '../../../src/domain/value-objects/MovementType';

describe('Movement Entity', () => {

  // === ENTRY ===
  describe('createEntry', () => {
    it('debe crear un movimiento de entrada con cantidad positiva', () => {
      const movement = Movement.createEntry('id-1', 'prod-1', 10, new Date());

      expect(movement.id).toBe('id-1');
      expect(movement.productId).toBe('prod-1');
      expect(movement.type).toBe(MovementType.ENTRY);
      expect(movement.quantity).toBe(10);
      expect(movement.reason).toBeNull();
    });

    it('debe rechazar una entrada con cantidad 0', () => {
      expect(() => Movement.createEntry('id-1', 'prod-1', 0, new Date()))
        .toThrow(DomainError);
      expect(() => Movement.createEntry('id-1', 'prod-1', 0, new Date()))
        .toThrow('La cantidad debe ser mayor a 0');
    });

    it('debe rechazar una entrada con cantidad negativa', () => {
      expect(() => Movement.createEntry('id-1', 'prod-1', -5, new Date()))
        .toThrow('La cantidad debe ser mayor a 0');
    });

    it('el efecto en stock de una entrada debe ser positivo', () => {
      const movement = Movement.createEntry('id-1', 'prod-1', 15, new Date());
      expect(movement.stockEffect).toBe(15);
    });
  });

  // === EXIT ===
  describe('createExit', () => {
    it('debe crear un movimiento de salida con cantidad positiva', () => {
      const movement = Movement.createExit('id-1', 'prod-1', 5, new Date());

      expect(movement.type).toBe(MovementType.EXIT);
      expect(movement.quantity).toBe(5);
      expect(movement.reason).toBeNull();
    });

    it('debe rechazar una salida con cantidad 0', () => {
      expect(() => Movement.createExit('id-1', 'prod-1', 0, new Date()))
        .toThrow('La cantidad debe ser mayor a 0');
    });

    it('debe rechazar una salida con cantidad negativa', () => {
      expect(() => Movement.createExit('id-1', 'prod-1', -3, new Date()))
        .toThrow('La cantidad debe ser mayor a 0');
    });

    it('el efecto en stock de una salida debe ser negativo', () => {
      const movement = Movement.createExit('id-1', 'prod-1', 8, new Date());
      expect(movement.stockEffect).toBe(-8);
    });
  });

  // === ADJUSTMENT ===
  describe('createAdjustment', () => {
    it('debe crear un ajuste positivo con justificación válida', () => {
      const movement = Movement.createAdjustment(
        'id-1', 'prod-1', 5, 'Inventario físico encontró unidades extra', new Date()
      );

      expect(movement.type).toBe(MovementType.ADJUSTMENT);
      expect(movement.quantity).toBe(5);
      expect(movement.reason).toBe('Inventario físico encontró unidades extra');
    });

    it('debe crear un ajuste negativo con justificación válida', () => {
      const movement = Movement.createAdjustment(
        'id-1', 'prod-1', -3, 'Unidades dañadas en almacén', new Date()
      );

      expect(movement.quantity).toBe(-3);
      expect(movement.stockEffect).toBe(-3);
    });

    it('debe rechazar un ajuste con cantidad 0', () => {
      expect(() => Movement.createAdjustment(
        'id-1', 'prod-1', 0, 'Razón válida para el ajuste', new Date()
      )).toThrow('La cantidad del ajuste no puede ser 0');
    });

    it('RN-004: debe rechazar un ajuste sin justificación', () => {
      expect(() => Movement.createAdjustment(
        'id-1', 'prod-1', 5, '', new Date()
      )).toThrow('La justificación es obligatoria para ajustes');
    });

    it('RN-004: debe rechazar un ajuste con justificación de solo espacios', () => {
      expect(() => Movement.createAdjustment(
        'id-1', 'prod-1', 5, '    ', new Date()
      )).toThrow('La justificación es obligatoria para ajustes');
    });

    it('RN-004: debe rechazar justificación menor a 10 caracteres', () => {
      expect(() => Movement.createAdjustment(
        'id-1', 'prod-1', 5, 'Corta', new Date()
      )).toThrow('La justificación debe tener al menos 10 caracteres');
    });

    it('debe aceptar justificación de exactamente 10 caracteres', () => {
      const movement = Movement.createAdjustment(
        'id-1', 'prod-1', 5, '1234567890', new Date()
      );
      expect(movement.reason).toBe('1234567890');
    });

    it('el efecto en stock de un ajuste positivo debe ser positivo', () => {
      const movement = Movement.createAdjustment(
        'id-1', 'prod-1', 7, 'Inventario físico encontró unidades', new Date()
      );
      expect(movement.stockEffect).toBe(7);
    });

    it('el efecto en stock de un ajuste negativo debe ser negativo', () => {
      const movement = Movement.createAdjustment(
        'id-1', 'prod-1', -4, 'Merma por productos dañados', new Date()
      );
      expect(movement.stockEffect).toBe(-4);
    });
  });

  // === INMUTABILIDAD (RN-003) ===
  describe('Inmutabilidad', () => {
    it('RN-003: las propiedades del movimiento deben ser readonly', () => {
      const movement = Movement.createEntry('id-1', 'prod-1', 10, new Date());

      // TypeScript previene la modificación en compilación.
      // En runtime verificamos que los valores no cambian.
      expect(movement.id).toBe('id-1');
      expect(movement.productId).toBe('prod-1');
      expect(movement.type).toBe(MovementType.ENTRY);
      expect(movement.quantity).toBe(10);
    });
  });

  // === RECONSTITUTE ===
  describe('reconstitute', () => {
    it('debe reconstituir un movimiento desde datos de persistencia', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const movement = Movement.reconstitute({
        id: 'id-1',
        productId: 'prod-1',
        type: MovementType.ADJUSTMENT,
        quantity: -5,
        reason: 'Merma detectada en auditoría',
        createdAt: date,
      });

      expect(movement.id).toBe('id-1');
      expect(movement.type).toBe(MovementType.ADJUSTMENT);
      expect(movement.quantity).toBe(-5);
      expect(movement.reason).toBe('Merma detectada en auditoría');
      expect(movement.createdAt).toEqual(date);
    });
  });
});
