/**
 * Unit Tests: Product Entity
 * Pruebas sobre la creación de productos y cálculo de stock.
 * 
 * Reglas probadas:
 * - RN-005: Stock calculado desde historial
 * - RN-007: Nombre obligatorio
 */

import { describe, it, expect } from 'vitest';
import { Product, ProductValidationError } from '../../../src/domain/entities/Product';
import { Movement } from '../../../src/domain/entities/Movement';
import { MovementType } from '../../../src/domain/value-objects/MovementType';

describe('Product Entity', () => {

  // === CREACIÓN ===
  describe('create', () => {
    it('debe crear un producto con nombre válido', () => {
      const product = Product.create('id-1', 'Tornillo 3/8');

      expect(product.id).toBe('id-1');
      expect(product.name).toBe('Tornillo 3/8');
      expect(product.description).toBeNull();
    });

    it('debe crear un producto con nombre y descripción', () => {
      const product = Product.create('id-1', 'Tornillo 3/8', 'Tornillo galvanizado');

      expect(product.name).toBe('Tornillo 3/8');
      expect(product.description).toBe('Tornillo galvanizado');
    });

    it('debe limpiar espacios del nombre', () => {
      const product = Product.create('id-1', '  Tornillo 3/8  ');
      expect(product.name).toBe('Tornillo 3/8');
    });

    it('RN-007: debe rechazar nombre vacío', () => {
      expect(() => Product.create('id-1', ''))
        .toThrow(ProductValidationError);
      expect(() => Product.create('id-1', ''))
        .toThrow('El nombre del producto es obligatorio');
    });

    it('RN-007: debe rechazar nombre con solo espacios', () => {
      expect(() => Product.create('id-1', '   '))
        .toThrow('El nombre del producto es obligatorio');
    });
  });

  // === CÁLCULO DE STOCK (RN-005) ===
  describe('calculateStock', () => {
    it('RN-005: debe retornar 0 para un historial vacío', () => {
      const stock = Product.calculateStock([]);
      expect(stock).toBe(0);
    });

    it('RN-005: debe sumar entradas correctamente', () => {
      const movements = [
        Movement.createEntry('m-1', 'p-1', 10, new Date()),
        Movement.createEntry('m-2', 'p-1', 5, new Date()),
        Movement.createEntry('m-3', 'p-1', 3, new Date()),
      ];

      expect(Product.calculateStock(movements)).toBe(18);
    });

    it('RN-005: debe restar salidas correctamente', () => {
      const movements = [
        Movement.createEntry('m-1', 'p-1', 20, new Date()),
        Movement.createExit('m-2', 'p-1', 5, new Date()),
        Movement.createExit('m-3', 'p-1', 3, new Date()),
      ];

      expect(Product.calculateStock(movements)).toBe(12);
    });

    it('RN-005: debe calcular correctamente con entradas, salidas y ajustes', () => {
      const movements = [
        Movement.createEntry('m-1', 'p-1', 100, new Date()),       // +100 = 100
        Movement.createExit('m-2', 'p-1', 30, new Date()),         // -30  = 70
        Movement.createAdjustment('m-3', 'p-1', -5, 'Merma detectada en revisión', new Date()),  // -5 = 65
        Movement.createEntry('m-4', 'p-1', 20, new Date()),        // +20  = 85
        Movement.createAdjustment('m-5', 'p-1', 3, 'Encontradas en zona B adicional', new Date()), // +3 = 88
        Movement.createExit('m-6', 'p-1', 8, new Date()),          // -8   = 80
      ];

      expect(Product.calculateStock(movements)).toBe(80);
    });

    it('RN-005: el stock se calcula SIEMPRE desde el historial, nunca es un campo almacenado', () => {
      // Verificamos que Product no tiene campo "stock" directo
      const product = Product.create('id-1', 'Test Product');
      
      // El stock solo se obtiene via calculateStock con movimientos
      expect(Product.calculateStock([])).toBe(0);
      
      // No debe existir propiedad stock en el producto
      expect((product as any).stock).toBeUndefined();
      expect((product as any).currentStock).toBeUndefined();
    });
  });

  // === RECONSTITUTE ===
  describe('reconstitute', () => {
    it('debe reconstituir un producto desde datos de persistencia', () => {
      const createdAt = new Date('2024-01-10');
      const updatedAt = new Date('2024-01-15');

      const product = Product.reconstitute({
        id: 'id-1',
        name: 'Tornillo 3/8',
        description: 'Galvanizado',
        createdAt,
        updatedAt,
      });

      expect(product.id).toBe('id-1');
      expect(product.name).toBe('Tornillo 3/8');
      expect(product.description).toBe('Galvanizado');
      expect(product.createdAt).toEqual(createdAt);
      expect(product.updatedAt).toEqual(updatedAt);
    });
  });
});
