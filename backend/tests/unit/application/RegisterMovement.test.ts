/**
 * Unit Tests: RegisterMovement Use Case
 * Pruebas sobre el caso de uso principal que orquesta las reglas de negocio.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterMovement } from '../../../src/application/use-cases/RegisterMovement';
import { InventoryDomainService } from '../../../src/domain/services/InventoryDomainService';
import { Product } from '../../../src/domain/entities/Product';
import { Movement, DomainError } from '../../../src/domain/entities/Movement';
import { IProductRepository } from '../../../src/domain/repositories/IProductRepository';
import { IMovementRepository } from '../../../src/domain/repositories/IMovementRepository';

// Mock repositories
function createMockProductRepo(product: Product | null = null): IProductRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(product),
    findByName: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue(product ? [product] : []),
  };
}

function createMockMovementRepo(movements: Movement[] = []): IMovementRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findByProductId: vi.fn().mockResolvedValue(movements),
    findAll: vi.fn().mockResolvedValue(movements),
  };
}

describe('RegisterMovement Use Case', () => {
  let inventoryService: InventoryDomainService;
  let testProduct: Product;

  beforeEach(() => {
    inventoryService = new InventoryDomainService();
    testProduct = Product.create('prod-1', 'Test Product');
  });

  it('debe registrar una entrada exitosamente', async () => {
    const productRepo = createMockProductRepo(testProduct);
    const movementRepo = createMockMovementRepo();
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    const result = await useCase.execute('prod-1', {
      type: 'ENTRY',
      quantity: 50,
    });

    expect(result.type).toBe('ENTRY');
    expect(result.quantity).toBe(50);
    expect(result.productId).toBe('prod-1');
    expect(movementRepo.save).toHaveBeenCalledOnce();
  });

  it('debe registrar una salida con stock suficiente', async () => {
    const existingMovements = [
      Movement.createEntry('m-1', 'prod-1', 100, new Date()),
    ];

    const productRepo = createMockProductRepo(testProduct);
    const movementRepo = createMockMovementRepo(existingMovements);
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    const result = await useCase.execute('prod-1', {
      type: 'EXIT',
      quantity: 30,
    });

    expect(result.type).toBe('EXIT');
    expect(result.quantity).toBe(30);
  });

  it('debe rechazar salida sin stock suficiente', async () => {
    const existingMovements = [
      Movement.createEntry('m-1', 'prod-1', 10, new Date()),
    ];

    const productRepo = createMockProductRepo(testProduct);
    const movementRepo = createMockMovementRepo(existingMovements);
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    await expect(
      useCase.execute('prod-1', { type: 'EXIT', quantity: 20 })
    ).rejects.toThrow('Stock insuficiente. Disponible: 10');
  });

  it('debe rechazar movimiento para producto inexistente', async () => {
    const productRepo = createMockProductRepo(null);
    const movementRepo = createMockMovementRepo();
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    await expect(
      useCase.execute('nonexistent', { type: 'ENTRY', quantity: 10 })
    ).rejects.toThrow('Producto no encontrado');
  });

  it('debe rechazar ajuste sin justificación', async () => {
    const productRepo = createMockProductRepo(testProduct);
    const movementRepo = createMockMovementRepo([
      Movement.createEntry('m-1', 'prod-1', 50, new Date()),
    ]);
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    await expect(
      useCase.execute('prod-1', { type: 'ADJUSTMENT', quantity: 5 })
    ).rejects.toThrow('La justificación es obligatoria para ajustes');
  });

  it('debe registrar ajuste con justificación válida', async () => {
    const productRepo = createMockProductRepo(testProduct);
    const movementRepo = createMockMovementRepo([
      Movement.createEntry('m-1', 'prod-1', 50, new Date()),
    ]);
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    const result = await useCase.execute('prod-1', {
      type: 'ADJUSTMENT',
      quantity: -5,
      reason: 'Merma detectada en revisión mensual',
    });

    expect(result.type).toBe('ADJUSTMENT');
    expect(result.quantity).toBe(-5);
    expect(result.reason).toBe('Merma detectada en revisión mensual');
  });

  it('debe rechazar tipo de movimiento inválido', async () => {
    const productRepo = createMockProductRepo(testProduct);
    const movementRepo = createMockMovementRepo();
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    await expect(
      useCase.execute('prod-1', { type: 'INVALID' as any, quantity: 10 })
    ).rejects.toThrow('Tipo de movimiento inválido');
  });

  it('RN-003: el movimiento debe persistirse una sola vez (inmutable)', async () => {
    const productRepo = createMockProductRepo(testProduct);
    const movementRepo = createMockMovementRepo();
    const useCase = new RegisterMovement(productRepo, movementRepo, inventoryService);

    await useCase.execute('prod-1', { type: 'ENTRY', quantity: 10 });

    // Solo se llama save una vez, nunca update
    expect(movementRepo.save).toHaveBeenCalledOnce();
  });
});
