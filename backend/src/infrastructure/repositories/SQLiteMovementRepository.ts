/**
 * SQLite Implementation: MovementRepository
 * Implementa IMovementRepository usando better-sqlite3.
 * 
 * NOTA: Solo tiene save() y find(). No hay update/delete (inmutabilidad RN-003).
 */

import { Movement } from '../../domain/entities/Movement';
import { MovementType } from '../../domain/value-objects/MovementType';
import { IMovementRepository } from '../../domain/repositories/IMovementRepository';
import { getDatabase } from '../database/sqlite';

interface MovementRow {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  reason: string | null;
  created_at: string;
}

export class SQLiteMovementRepository implements IMovementRepository {
  async save(movement: Movement): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO movements (id, product_id, type, quantity, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      movement.id,
      movement.productId,
      movement.type,
      movement.quantity,
      movement.reason,
      movement.createdAt.toISOString(),
    );
  }

  async findByProductId(productId: string): Promise<Movement[]> {
    const db = getDatabase();
    const rows = db.prepare(
      'SELECT * FROM movements WHERE product_id = ? ORDER BY created_at ASC'
    ).all(productId) as MovementRow[];

    return rows.map(row => this.toDomain(row));
  }

  async findAll(): Promise<Movement[]> {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM movements ORDER BY created_at DESC').all() as MovementRow[];
    return rows.map(row => this.toDomain(row));
  }

  private toDomain(row: MovementRow): Movement {
    return Movement.reconstitute({
      id: row.id,
      productId: row.product_id,
      type: row.type as MovementType,
      quantity: row.quantity,
      reason: row.reason ?? undefined,
      createdAt: new Date(row.created_at),
    });
  }
}
