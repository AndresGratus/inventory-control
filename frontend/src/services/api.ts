/**
 * API Service - Handles all HTTP communication with the backend
 */

import { Product, ProductDetail, Movement, CreateProductRequest, CreateMovementRequest, ApiError } from '../types';

const API_BASE = '/api';

class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Error de conexión con el servidor',
        type: 'NetworkError',
      }));
      throw new Error(errorData.error);
    }

    return response.json();
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async getProductById(id: string): Promise<ProductDetail> {
    return this.request<ProductDetail>(`/products/${id}`);
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Movements
  async registerMovement(productId: string, data: CreateMovementRequest): Promise<Movement> {
    return this.request<Movement>(`/products/${productId}/movements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
