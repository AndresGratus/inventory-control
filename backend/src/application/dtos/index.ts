/**
 * DTOs (Data Transfer Objects)
 * Objetos para transferir datos entre capas sin exponer las entidades del dominio.
 */

// --- Request DTOs ---

export interface CreateProductDTO {
  name: string;
  description?: string;
}

export interface CreateMovementDTO {
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
}

// --- Response DTOs ---

export interface ProductResponseDTO {
  id: string;
  name: string;
  description: string | null;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface MovementResponseDTO {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: string;
}

export interface ProductDetailResponseDTO extends ProductResponseDTO {
  movements: MovementResponseDTO[];
}
