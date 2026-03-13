/**
 * SQLite Implementation: ProductRepository
 * Implementa IProductRepository usando better-sqlite3.
 */

import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { getDatabase } from '../database/sqlite';

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export class SQLiteProductRepository implements IProductRepository {
  async save(product: Product): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO products (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      product.id,
      product.name,
      product.description,
      product.createdAt.toISOString(),
      product.updatedAt.toISOString(),
    );
  }

  async findById(id: string): Promise<Product | null> {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow | undefined;
    
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByName(name: string): Promise<Product | null> {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM products WHERE name = ?').get(name) as ProductRow | undefined;
    
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Product[]> {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as ProductRow[];
    return rows.map(row => this.toDomain(row));
  }

  private toDomain(row: ProductRow): Product {
    return Product.reconstitute({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
