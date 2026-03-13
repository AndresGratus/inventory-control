/**
 * Use Case: GetProducts
 * Lista todos los productos con su stock actual calculado.
 * 
 * RN-005: Stock calculado desde historial de movimientos.
 */

import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IMovementRepository } from '../../domain/repositories/IMovementRepository';
import { InventoryDomainService } from '../../domain/services/InventoryDomainService';
import { ProductResponseDTO } from '../dtos';

export class GetProducts {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly movementRepository: IMovementRepository,
    private readonly inventoryService: InventoryDomainService,
  ) {}

  async execute(): Promise<ProductResponseDTO[]> {
    const products = await this.productRepository.findAll();
    
    const result: ProductResponseDTO[] = [];

    for (const product of products) {
      const movements = await this.movementRepository.findByProductId(product.id);
      const currentStock = this.inventoryService.calculateStock(movements);

      result.push({
        id: product.id,
        name: product.name,
        description: product.description,
        currentStock,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      });
    }

    return result;
  }
}
