/**
 * Use Case: RegisterMovement
 * Registra un movimiento de inventario (entrada, salida o ajuste).
 * 
 * Reglas aplicadas:
 * - RN-001: Stock no puede ser negativo
 * - RN-002: Salida solo si hay stock suficiente
 * - RN-003: Movimiento inmutable una vez registrado
 * - RN-004: Ajuste requiere justificación obligatoria
 * - RN-005: Stock calculado desde historial
 * - RN-006: Cantidad > 0
 */

import { v4 as uuidv4 } from 'uuid';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IMovementRepository } from '../../domain/repositories/IMovementRepository';
import { InventoryDomainService } from '../../domain/services/InventoryDomainService';
import { MovementType, isValidMovementType } from '../../domain/value-objects/MovementType';
import { DomainError } from '../../domain/entities/Movement';
import { CreateMovementDTO, MovementResponseDTO } from '../dtos';

export class RegisterMovement {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly movementRepository: IMovementRepository,
    private readonly inventoryService: InventoryDomainService,
  ) {}

  async execute(productId: string, dto: CreateMovementDTO): Promise<MovementResponseDTO> {
    // Validar tipo de movimiento
    if (!isValidMovementType(dto.type)) {
      throw new DomainError(`Tipo de movimiento inválido: ${dto.type}. Valores permitidos: ENTRY, EXIT, ADJUSTMENT`);
    }

    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new DomainError(`Producto no encontrado: ${productId}`);
    }

    // Obtener movimientos actuales para calcular stock
    const currentMovements = await this.movementRepository.findByProductId(productId);
    const movementId = uuidv4();

    let movement;

    switch (dto.type) {
      case MovementType.ENTRY:
        movement = this.inventoryService.createEntry(movementId, productId, dto.quantity);
        break;

      case MovementType.EXIT:
        movement = this.inventoryService.createExit(movementId, productId, dto.quantity, currentMovements);
        break;

      case MovementType.ADJUSTMENT:
        if (!dto.reason) {
          throw new DomainError('La justificación es obligatoria para ajustes');
        }
        movement = this.inventoryService.createAdjustment(
          movementId, productId, dto.quantity, dto.reason, currentMovements
        );
        break;

      default:
        throw new DomainError(`Tipo de movimiento no soportado: ${dto.type}`);
    }

    // Persistir movimiento (inmutable)
    await this.movementRepository.save(movement);

    return {
      id: movement.id,
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      createdAt: movement.createdAt.toISOString(),
    };
  }
}
