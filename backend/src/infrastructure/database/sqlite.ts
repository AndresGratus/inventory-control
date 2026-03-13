/**
 * SQLite Database Connection & Setup
 * Crea las tablas necesarias al iniciar.
 * 
 * NOTA: No hay columna de stock en products — se calcula desde movements (RN-005).
 * NOTA: movements no tiene updated_at — son inmutables (RN-003).
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../../data/inventory.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('ENTRY', 'EXIT', 'ADJUSTMENT')),
      quantity REAL NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_movements_product_id ON movements(product_id);
    CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at);
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}
