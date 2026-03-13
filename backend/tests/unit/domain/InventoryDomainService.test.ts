/**
 * Unit Tests: InventoryDomainService
 * Pruebas sobre las reglas de negocio centrales del sistema.
 * 
 * Reglas probadas:
 * - RN-001: Stock nunca negativo
 * - RN-002: Salida solo con stock suficiente
 * - RN-004: Ajuste con justificación obligatoria
 * - RN-005: Stock calculado desde historial
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryDomainService } from '../../../src/domain/services/InventoryDomainService';
import { Movement, DomainError } from '../../../src/domain/entities/Movement';
import { MovementType } from '../../../src/domain/value-objects/MovementType';

describe('InventoryDomainService', () => {
  let service: InventoryDomainService;

  beforeEach(() => {
    service = new InventoryDomainService();
  });

  // === CALCULATE STOCK ===
  describe('calculateStock', () => {
    it('RN-005: debe retornar 0 sin movimientos', () => {
      expect(service.calculateStock([])).toBe(0);
    });

    it('RN-005: debe calcular stock correctamente con múltiples movimientos', () => {
      const movements = [
        Movement.createEntry('m-1', 'p-1', 50, new Date()),
        Movement.createExit('m-2', 'p-1', 10, new Date()),
        Movement.createEntry('m-3', 'p-1', 20, new Date()),
        Movement.createExit('m-4', 'p-1', 5, new Date()),
      ];

      expect(service.calculateStock(movements)).toBe(55);
    });
  });

  // === CREATE ENTRY ===
  describe('createEntry', () => {
    it('debe crear una entrada válida', () => {
      const movement = service.createEntry('m-1', 'p-1', 25);

      expect(movement.type).toBe(MovementType.ENTRY);
      expect(movement.quantity).toBe(25);
      expect(movement.stockEffect).toBe(25);
    });

    it('debe rechazar cantidad 0', () => {
      expect(() => service.createEntry('m-1', 'p-1', 0))
        .toThrow('La cantidad debe ser mayor a 0');
    });

    it('debe rechazar cantidad negativa', () => {
      expect(() => service.createEntry('m-1', 'p-1', -5))
        .toThrow('La cantidad debe ser mayor a 0');
    });
  });

  // === CREATE EXIT ===
  describe('createExit', () => {
    it('debe crear una salida cuando hay stock suficiente', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 50, new Date()),
      ];

      const movement = service.createExit('m-2', 'p-1', 30, currentMovements);

      expect(movement.type).toBe(MovementType.EXIT);
      expect(movement.quantity).toBe(30);
      expect(movement.stockEffect).toBe(-30);
    });

    it('debe permitir salida que deja stock en exactamente 0', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 20, new Date()),
      ];

      const movement = service.createExit('m-2', 'p-1', 20, currentMovements);
      expect(movement.quantity).toBe(20);
    });

    it('RN-001 + RN-002: debe rechazar salida que excede el stock', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 10, new Date()),
      ];

      expect(() => service.createExit('m-2', 'p-1', 15, currentMovements))
        .toThrow(DomainError);
      expect(() => service.createExit('m-2', 'p-1', 15, currentMovements))
        .toThrow('Stock insuficiente. Disponible: 10');
    });

    it('RN-002: debe rechazar salida con stock 0', () => {
      const currentMovements: Movement[] = [];

      expect(() => service.createExit('m-1', 'p-1', 1, currentMovements))
        .toThrow('Stock insuficiente. Disponible: 0');
    });

    it('RN-002: debe validar stock considerando todo el historial', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 100, new Date()),
        Movement.createExit('m-2', 'p-1', 40, new Date()),
        Movement.createExit('m-3', 'p-1', 35, new Date()),
        // Stock actual: 100 - 40 - 35 = 25
      ];

      // Debe permitir salida de 25 (stock exacto)
      const movement = service.createExit('m-4', 'p-1', 25, currentMovements);
      expect(movement.quantity).toBe(25);

      // Debe rechazar salida de 26
      expect(() => service.createExit('m-5', 'p-1', 26, currentMovements))
        .toThrow('Stock insuficiente. Disponible: 25');
    });
  });

  // === CREATE ADJUSTMENT ===
  describe('createAdjustment', () => {
    it('debe crear un ajuste positivo con justificación', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 20, new Date()),
      ];

      const movement = service.createAdjustment(
        'm-2', 'p-1', 5, 'Unidades encontradas en inventario físico', currentMovements
      );

      expect(movement.type).toBe(MovementType.ADJUSTMENT);
      expect(movement.quantity).toBe(5);
      expect(movement.reason).toBe('Unidades encontradas en inventario físico');
    });

    it('debe crear un ajuste negativo que no deja stock negativo', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 20, new Date()),
      ];

      const movement = service.createAdjustment(
        'm-2', 'p-1', -10, 'Merma por productos dañados', currentMovements
      );

      expect(movement.quantity).toBe(-10);
      expect(movement.stockEffect).toBe(-10);
    });

    it('debe permitir ajuste negativo que deja stock en exactamente 0', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 15, new Date()),
      ];

      const movement = service.createAdjustment(
        'm-2', 'p-1', -15, 'Liquidación total del producto', currentMovements
      );

      expect(movement.quantity).toBe(-15);
    });

    it('RN-001: debe rechazar ajuste que dejaría stock negativo', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 10, new Date()),
      ];

      expect(() => service.createAdjustment(
        'm-2', 'p-1', -15, 'Ajuste por diferencia en conteo', currentMovements
      )).toThrow('El ajuste dejaría el stock en negativo. Stock actual: 10');
    });

    it('RN-001: debe rechazar ajuste negativo con stock 0', () => {
      const currentMovements: Movement[] = [];

      expect(() => service.createAdjustment(
        'm-1', 'p-1', -1, 'Ajuste por diferencia detectada', currentMovements
      )).toThrow('El ajuste dejaría el stock en negativo. Stock actual: 0');
    });

    it('RN-004: debe rechazar ajuste sin justificación', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 10, new Date()),
      ];

      expect(() => service.createAdjustment(
        'm-2', 'p-1', 5, '', currentMovements
      )).toThrow('La justificación es obligatoria para ajustes');
    });

    it('RN-004: debe rechazar justificación menor a 10 caracteres', () => {
      const currentMovements = [
        Movement.createEntry('m-1', 'p-1', 10, new Date()),
      ];

      expect(() => service.createAdjustment(
        'm-2', 'p-1', 5, 'Corta', currentMovements
      )).toThrow('La justificación debe tener al menos 10 caracteres');
    });
  });

  // === ESCENARIOS COMPLEJOS ===
  describe('Escenarios complejos de negocio', () => {
    it('debe manejar secuencia completa: entradas → salidas → ajustes', () => {
      const movements: Movement[] = [];

      // Paso 1: Entrada inicial de 100 unidades
      const entry1 = service.createEntry('m-1', 'p-1', 100);
      movements.push(entry1);
      expect(service.calculateStock(movements)).toBe(100);

      // Paso 2: Salida de 30
      const exit1 = service.createExit('m-2', 'p-1', 30, movements);
      movements.push(exit1);
      expect(service.calculateStock(movements)).toBe(70);

      // Paso 3: Ajuste -5 (merma)
      const adj1 = service.createAdjustment(
        'm-3', 'p-1', -5, 'Merma detectada en auditoría mensual', movements
      );
      movements.push(adj1);
      expect(service.calculateStock(movements)).toBe(65);

      // Paso 4: Nueva entrada de 50
      const entry2 = service.createEntry('m-4', 'p-1', 50);
      movements.push(entry2);
      expect(service.calculateStock(movements)).toBe(115);

      // Paso 5: Salida de 115 (todo el stock)
      const exit2 = service.createExit('m-5', 'p-1', 115, movements);
      movements.push(exit2);
      expect(service.calculateStock(movements)).toBe(0);

      // Paso 6: Intentar salida con stock 0 → DEBE FALLAR
      expect(() => service.createExit('m-6', 'p-1', 1, movements))
        .toThrow('Stock insuficiente. Disponible: 0');
    });

    it('RN-001: NUNCA debe permitir que el stock sea negativo bajo ninguna circunstancia', () => {
      // Caso 1: Salida > stock
      expect(() => service.createExit('m-1', 'p-1', 1, []))
        .toThrow(/Stock insuficiente/);

      // Caso 2: Ajuste negativo > stock
      const movements = [Movement.createEntry('m-1', 'p-1', 5, new Date())];
      expect(() => service.createAdjustment('m-2', 'p-1', -10, 'Ajuste por diferencia de inventario', movements))
        .toThrow(/El ajuste dejaría el stock en negativo/);

      // Caso 3: Stock 0 y ajuste negativo
      expect(() => service.createAdjustment('m-3', 'p-1', -1, 'Ajuste por diferencia detectada', []))
        .toThrow(/El ajuste dejaría el stock en negativo/);
    });
  });
});
