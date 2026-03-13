/**
 * Domain Repository Interface: IProductRepository
 * Define el contrato que debe cumplir cualquier implementación de persistencia de productos.
 * 
 * Esta interfaz pertenece al DOMINIO — la implementación va en infraestructura.
 */

import { Product } from '../entities/Product';

export interface IProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
}
