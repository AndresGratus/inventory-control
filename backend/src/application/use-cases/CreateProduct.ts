/**
 * Use Case: CreateProduct
 * Crea un nuevo producto en el sistema de inventario.
 * 
 * Reglas aplicadas:
 * - RN-007: Nombre obligatorio y único
 * - Stock inicial es 0 (sin movimientos)
 */

import { v4 as uuidv4 } from 'uuid';
import { Product, ProductValidationError } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { CreateProductDTO, ProductResponseDTO } from '../dtos';

export class CreateProduct {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: CreateProductDTO): Promise<ProductResponseDTO> {
    // Validar nombre único
    const existing = await this.productRepository.findByName(dto.name.trim());
    if (existing) {
      throw new ProductValidationError('Ya existe un producto con este nombre');
    }

    // Crear entidad de dominio (valida nombre obligatorio)
    const product = Product.create(uuidv4(), dto.name, dto.description);

    // Persistir
    await this.productRepository.save(product);

    // Retornar DTO
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      currentStock: 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
