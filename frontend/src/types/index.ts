/**
 * Types - Shared TypeScript interfaces for the frontend
 */

export interface Product {
  id: string;
  name: string;
  description: string | null;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  quantity: number;
  reason: string | null;
  createdAt: string;
}

export interface ProductDetail extends Product {
  movements: Movement[];
}

export interface CreateProductRequest {
  name: string;
  description?: string;
}

export interface CreateMovementRequest {
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
}

export interface ApiError {
  error: string;
  type: string;
}
