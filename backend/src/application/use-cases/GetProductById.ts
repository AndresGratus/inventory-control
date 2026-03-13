/**
 * Use Case: GetProductById
 * Obtiene el detalle de un producto con su stock y historial de movimientos.
 */

import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IMovementRepository } from '../../domain/repositories/IMovementRepository';
import { InventoryDomainService } from '../../domain/services/InventoryDomainService';
import { ProductDetailResponseDTO } from '../dtos';

export class GetProductById {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly movementRepository: IMovementRepository,
    private readonly inventoryService: InventoryDomainService,
  ) {}

  async execute(productId: string): Promise<ProductDetailResponseDTO | null> {
    const product = await this.productRepository.findById(productId);
    if (!product) return null;

    const movements = await this.movementRepository.findByProductId(product.id);
    const currentStock = this.inventoryService.calculateStock(movements);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      currentStock,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      movements: movements
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(m => ({
          id: m.id,
          productId: m.productId,
          type: m.type,
          quantity: m.quantity,
          reason: m.reason,
          createdAt: m.createdAt.toISOString(),
        })),
    };
  }
}
