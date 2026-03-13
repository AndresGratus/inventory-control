/**
 * Product Controller
 * Traduce requests HTTP a llamadas de casos de uso y formatea responses.
 */

import { Request, Response, NextFunction } from 'express';
import { CreateProduct } from '../../../application/use-cases/CreateProduct';
import { GetProducts } from '../../../application/use-cases/GetProducts';
import { GetProductById } from '../../../application/use-cases/GetProductById';

export class ProductController {
  constructor(
    private readonly createProductUC: CreateProduct,
    private readonly getProductsUC: GetProducts,
    private readonly getProductByIdUC: GetProductById,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description } = req.body;
      const product = await this.createProductUC.execute({ name, description });
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.getProductsUC.execute();
      res.json(products);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.getProductByIdUC.execute(req.params.id as string);
      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  };
}
