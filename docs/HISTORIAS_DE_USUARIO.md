# Historias de Usuario - Sistema de Control de Inventario

## Proyecto: Control de Inventario de Bodega
**Fecha:** 2026-03-13  
**Versión:** 1.0  
**Autor:** Equipo de Arquitectura ACMOTOS

---

## Contexto del Negocio

Un sistema de control de inventario diseñado para que las empresas puedan registrar y gestionar los movimientos de sus productos en bodega. Los operadores registran entradas, salidas y ajustes, manteniendo trazabilidad completa de cada movimiento.

---

## Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| **Operador de Bodega** | Usuario principal que registra movimientos de inventario |

---

## HU-001: Registrar Productos en el Inventario

**Como** operador de bodega,  
**Quiero** registrar nuevos productos en el sistema,  
**Para** poder gestionar su inventario y movimientos de stock.

### Criterios de Aceptación

| # | Criterio | Dado | Cuando | Entonces |
|---|----------|------|--------|----------|
| CA-001.1 | Registro exitoso | Un producto con nombre único y datos válidos | El operador envía el formulario de creación | El producto se crea con stock inicial en 0 |
| CA-001.2 | Nombre obligatorio | Un formulario con el nombre vacío | El operador intenta crear el producto | El sistema muestra error "El nombre del producto es obligatorio" |
| CA-001.3 | Nombre único | Un producto con nombre "Tornillo 3/8" ya existe | El operador intenta crear otro con el mismo nombre | El sistema muestra error "Ya existe un producto con este nombre" |
| CA-001.4 | Stock inicial cero | Un producto recién creado | Se consulta su stock | El stock es 0, calculado desde el historial vacío de movimientos |

---

## HU-002: Registrar Entrada de Mercancía

**Como** operador de bodega,  
**Quiero** registrar entradas de mercancía al inventario,  
**Para** reflejar la recepción de productos y aumentar el stock disponible.

### Criterios de Aceptación

| # | Criterio | Dado | Cuando | Entonces |
|---|----------|------|--------|----------|
| CA-002.1 | Entrada exitosa | Un producto existente con stock 10 | El operador registra una entrada de 5 unidades | El stock calculado pasa a 15 y el movimiento queda registrado |
| CA-002.2 | Cantidad positiva obligatoria | Un formulario con cantidad 0 o negativa | El operador intenta registrar la entrada | El sistema muestra error "La cantidad debe ser mayor a 0" |
| CA-002.3 | Movimiento inmutable | Un movimiento de entrada registrado | Cualquier intento de modificarlo o eliminarlo | El sistema rechaza la operación; el movimiento es inmutable |
| CA-002.4 | Registro con timestamp | Un movimiento de entrada válido | Se registra la entrada | El movimiento incluye fecha/hora automática del registro |

---

## HU-003: Registrar Salida de Mercancía

**Como** operador de bodega,  
**Quiero** registrar salidas de mercancía del inventario,  
**Para** reflejar ventas o consumos y reducir el stock disponible.

### Criterios de Aceptación

| # | Criterio | Dado | Cuando | Entonces |
|---|----------|------|--------|----------|
| CA-003.1 | Salida exitosa | Un producto con stock 10 | El operador registra una salida de 3 unidades | El stock calculado pasa a 7 y el movimiento queda registrado |
| CA-003.2 | Salida sin stock suficiente | Un producto con stock 5 | El operador intenta registrar una salida de 8 | El sistema rechaza con error "Stock insuficiente. Disponible: 5" |
| CA-003.3 | Salida que deja stock en 0 | Un producto con stock 5 | El operador registra una salida de 5 | El stock queda en 0 (permitido, no negativo) |
| CA-003.4 | Stock nunca negativo | Un producto con cualquier stock | Se intenta cualquier operación | El stock resultante NUNCA puede ser menor a 0 |
| CA-003.5 | Cantidad positiva obligatoria | Un formulario con cantidad 0 o negativa | El operador intenta registrar la salida | El sistema muestra error "La cantidad debe ser mayor a 0" |

---

## HU-004: Registrar Ajuste de Inventario

**Como** operador de bodega,  
**Quiero** registrar ajustes manuales al inventario con justificación obligatoria,  
**Para** corregir discrepancias detectadas manteniendo la trazabilidad.

### Criterios de Aceptación

| # | Criterio | Dado | Cuando | Entonces |
|---|----------|------|--------|----------|
| CA-004.1 | Ajuste positivo | Un producto con stock 10 y justificación "Inventario físico encontró 3 unidades adicionales" | El operador registra un ajuste de +3 | El stock pasa a 13 con la justificación registrada |
| CA-004.2 | Ajuste negativo permitido | Un producto con stock 10 y justificación válida | El operador registra un ajuste de -4 | El stock pasa a 6 con la justificación registrada |
| CA-004.3 | Ajuste negativo que causaría stock negativo | Un producto con stock 3 y justificación válida | El operador registra un ajuste de -5 | El sistema rechaza: "El ajuste dejaría el stock en negativo. Stock actual: 3" |
| CA-004.4 | Justificación obligatoria | Un ajuste sin justificación o con justificación vacía | El operador intenta registrar el ajuste | El sistema muestra error "La justificación es obligatoria para ajustes" |
| CA-004.5 | Justificación mínima | Un ajuste con justificación de solo 2 caracteres | El operador intenta registrar | El sistema muestra error "La justificación debe tener al menos 10 caracteres" |

---

## HU-005: Consultar Stock y Historial de Movimientos

**Como** operador de bodega,  
**Quiero** consultar el stock actual de productos y su historial de movimientos,  
**Para** tener visibilidad completa del estado del inventario y su trazabilidad.

### Criterios de Aceptación

| # | Criterio | Dado | Cuando | Entonces |
|---|----------|------|--------|----------|
| CA-005.1 | Stock calculado desde historial | Un producto con 3 entradas (+10, +5, +3) y 1 salida (-4) | El operador consulta el stock | El stock muestra 14 (calculado: 10+5+3-4) |
| CA-005.2 | Listado de productos con stock | Existen 5 productos en el sistema | El operador accede al listado | Se muestran todos los productos con su stock actual calculado |
| CA-005.3 | Historial de movimientos | Un producto con varios movimientos | El operador accede al detalle del producto | Se muestra el historial completo: tipo, cantidad, fecha, y justificación (si aplica) |
| CA-005.4 | Historial ordenado | Un producto con movimientos en diferentes fechas | Se consulta el historial | Los movimientos se muestran ordenados del más reciente al más antiguo |
| CA-005.5 | Estados visuales de stock | Productos con diferentes niveles de stock | El operador ve el listado | Se muestran indicadores visuales: verde (stock > 10), amarillo (1-10), rojo (0) |

---

## Reglas de Negocio Formalizadas

| # | Regla | Tipo | Prioridad |
|---|-------|------|-----------|
| RN-001 | El stock de un producto no puede ser negativo en ningún momento | Invariante | CRÍTICA |
| RN-002 | Una salida solo puede registrarse si existe stock suficiente disponible | Precondición | CRÍTICA |
| RN-003 | Todo movimiento (entrada, salida, ajuste) es inmutable una vez registrado | Invariante | CRÍTICA |
| RN-004 | Un ajuste debe incluir una justificación obligatoria (mín. 10 caracteres) | Validación | ALTA |
| RN-005 | El stock actual se calcula en el dominio a partir del historial de movimientos | Cálculo | CRÍTICA |
| RN-006 | La cantidad de un movimiento debe ser mayor a 0 | Validación | ALTA |
| RN-007 | El nombre del producto es obligatorio y único | Validación | ALTA |

---

## Entidades del Dominio

### Product (Producto)
```
Product {
  id: UUID
  name: string (obligatorio, único)
  description: string (opcional)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Calculado - NO almacenado
  currentStock: number → se calcula desde movements
}
```

### Movement (Movimiento)
```
Movement {
  id: UUID
  productId: UUID (referencia a Product)
  type: MovementType (ENTRY | EXIT | ADJUSTMENT)
  quantity: number (positivo para entrada/ajuste+, negativo para salida/ajuste-)
  reason: string (obligatorio solo para ADJUSTMENT, mín. 10 chars)
  createdAt: DateTime
  
  // INMUTABLE: no tiene updatedAt
}
```

### MovementType (Tipo de Movimiento)
```
enum MovementType {
  ENTRY       // Entrada de mercancía
  EXIT        // Salida por venta/consumo
  ADJUSTMENT  // Ajuste manual con justificación
}
```

---

## Arquitectura Propuesta: Clean Architecture

```
src/
├── domain/           ← Capa de Dominio (Entidades + Reglas de Negocio)
│   ├── entities/
│   │   ├── Product.ts
│   │   └── Movement.ts
│   ├── value-objects/
│   │   └── MovementType.ts
│   ├── repositories/    ← Interfaces (contratos)
│   │   ├── IProductRepository.ts
│   │   └── IMovementRepository.ts
│   └── services/
│       └── InventoryDomainService.ts   ← Reglas de negocio aquí
│
├── application/      ← Capa de Aplicación (Casos de Uso)
│   ├── use-cases/
│   │   ├── CreateProduct.ts
│   │   ├── RegisterEntry.ts
│   │   ├── RegisterExit.ts
│   │   ├── RegisterAdjustment.ts
│   │   ├── GetProducts.ts
│   │   └── GetMovementsByProduct.ts
│   └── dtos/
│       ├── CreateProductDTO.ts
│       ├── CreateMovementDTO.ts
│       └── ProductResponseDTO.ts
│
├── infrastructure/   ← Capa de Infraestructura (Implementaciones)
│   ├── database/
│   │   ├── sqlite.ts          ← Conexión SQLite
│   │   └── migrations/
│   ├── repositories/
│   │   ├── SQLiteProductRepository.ts
│   │   └── SQLiteMovementRepository.ts
│   └── http/
│       ├── server.ts
│       ├── routes/
│       │   ├── productRoutes.ts
│       │   └── movementRoutes.ts
│       └── controllers/
│           ├── ProductController.ts
│           └── MovementController.ts
│
└── tests/
    ├── unit/
    │   ├── domain/
    │   │   ├── Product.test.ts
    │   │   ├── Movement.test.ts
    │   │   └── InventoryDomainService.test.ts
    │   └── application/
    │       ├── RegisterEntry.test.ts
    │       ├── RegisterExit.test.ts
    │       └── RegisterAdjustment.test.ts
    └── integration/
        └── api.test.ts
```

---

## API REST - Endpoints

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/api/products` | Crear producto | `{ name, description? }` |
| GET | `/api/products` | Listar productos con stock calculado | - |
| GET | `/api/products/:id` | Detalle de producto con stock | - |
| POST | `/api/products/:id/movements` | Registrar movimiento | `{ type, quantity, reason? }` |
| GET | `/api/products/:id/movements` | Historial de movimientos | - |

> **Nota:** No existen endpoints PUT/DELETE para movimientos (inmutabilidad).

---

## Stack Tecnológico Recomendado

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Backend** | Node.js + TypeScript + Express | Type-safety, ecosistema maduro, rápido de implementar |
| **Base de Datos** | SQLite (better-sqlite3) | Sin servidor, archivo .db, setup < 3 min, migrable |
| **Frontend** | React + TypeScript + Vite | Componentización, type-safety, HMR rápido |
| **Estilos** | Tailwind CSS | Utility-first, desarrollo rápido, estados visuales fáciles |
| **Tests** | Vitest | Compatible con Vite, API similar a Jest, rápido |
| **Validación** | Zod | Validación de schemas en runtime, TypeScript-first |

---

## Flujo de Movimientos

```
                    ┌─────────────────┐
                    │  Producto Creado │
                    │   (stock = 0)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────────┐
        │ ENTRADA  │  │  SALIDA  │  │   AJUSTE     │
        │ +quantity │  │ -quantity│  │ ±quantity    │
        │          │  │          │  │ +reason(req) │
        └────┬─────┘  └────┬─────┘  └──────┬───────┘
             │              │               │
             │    ┌─────────┴───────┐       │
             │    │ ¿Stock ≥ qty?   │       │
             │    ├── Sí → Registrar│       │
             │    └── No → RECHAZAR │       │
             │              │               │
             └──────────────┼───────────────┘
                            ▼
                  ┌──────────────────┐
                  │ Movimiento       │
                  │ registrado       │
                  │ (INMUTABLE)      │
                  └──────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Stock recalculado│
                  │ desde historial  │
                  └──────────────────┘
```
