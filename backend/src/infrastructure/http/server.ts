/**
 * Express Server - Punto de entrada de la aplicación
 * 
 * Aquí se realiza la composición de dependencias (Dependency Injection manual):
 * - Se crean las implementaciones concretas (infraestructura)
 * - Se inyectan en los casos de uso (aplicación)
 * - Se inyectan los casos de uso en los controladores (infraestructura HTTP)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Infrastructure
import { SQLiteProductRepository } from '../repositories/SQLiteProductRepository';
import { SQLiteMovementRepository } from '../repositories/SQLiteMovementRepository';

// Domain
import { InventoryDomainService } from '../../domain/services/InventoryDomainService';

// Application - Use Cases
import { CreateProduct } from '../../application/use-cases/CreateProduct';
import { GetProducts } from '../../application/use-cases/GetProducts';
import { GetProductById } from '../../application/use-cases/GetProductById';
import { RegisterMovement } from '../../application/use-cases/RegisterMovement';

// HTTP
import { ProductController } from './controllers/ProductController';
import { MovementController } from './controllers/MovementController';
import { createProductRoutes } from './routes/productRoutes';
import { createMovementRoutes } from './routes/movementRoutes';
import { errorHandler } from './middlewares/errorHandler';

// === Crear directorio de datos si no existe ===
const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// === Dependency Injection ===

// Repositories (Infraestructura)
const productRepository = new SQLiteProductRepository();
const movementRepository = new SQLiteMovementRepository();

// Domain Services
const inventoryService = new InventoryDomainService();

// Use Cases (Aplicación)
const createProduct = new CreateProduct(productRepository);
const getProducts = new GetProducts(productRepository, movementRepository, inventoryService);
const getProductById = new GetProductById(productRepository, movementRepository, inventoryService);
const registerMovement = new RegisterMovement(productRepository, movementRepository, inventoryService);

// Controllers (Infraestructura HTTP)
const productController = new ProductController(createProduct, getProducts, getProductById);
const movementController = new MovementController(registerMovement);

// === Express App ===
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', createProductRoutes(productController));
app.use('/api/products/:id/movements', createMovementRoutes(movementController));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler (debe ir al final)
app.use(errorHandler);

// === Start Server ===
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Inventory Control API running on http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite (data/inventory.db)`);
  console.log(`🏗️  Architecture: Clean Architecture (Domain → Application → Infrastructure)`);
});

export { app };
