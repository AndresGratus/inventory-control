# Control de Inventario

Sistema de control de inventario para gestión de movimientos de productos en bodega. Permite registrar entradas, salidas y ajustes de mercancía con trazabilidad completa e inmutabilidad de registros.

---

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instrucciones de Ejecución](#instrucciones-de-ejecución)
- [Arquitectura](#arquitectura)
- [API REST](#api-rest)
- [Reglas de Negocio](#reglas-de-negocio)
- [Tests](#tests)
- [Stack Tecnológico](#stack-tecnológico)
- [Documentación Adicional](#documentación-adicional)
- [AI Usage](#ai-usage)

---

## Requisitos Previos

- **Node.js** >= 20.x
- **npm** >= 10.x

> No se requiere instalar ningún motor de base de datos. SQLite funciona como archivo local.

---

## Instrucciones de Ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd inventory-control
```

### 2. Backend (API REST)

```bash
cd backend
npm install
npm run dev
```

El servidor arranca en `http://localhost:3001`. La base de datos SQLite se crea automáticamente en `backend/data/inventory.db`.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

La aplicación arranca en `http://localhost:5173` con proxy automático al backend.

### 4. Tests

```bash
cd backend
npm test
```

Resultado esperado: **57 tests, 4 archivos — todos pasando**.

---

## Arquitectura

### Clean Architecture (3 capas)

El sistema implementa **Clean Architecture** con separación estricta de responsabilidades:

```
backend/src/
├── domain/               ← CAPA DE DOMINIO (núcleo)
│   ├── entities/         │  Entidades: Product, Movement
│   ├── value-objects/    │  Value Objects: MovementType
│   ├── repositories/     │  Interfaces (contratos, no implementaciones)
│   └── services/         │  Lógica de negocio: InventoryDomainService
│
├── application/          ← CAPA DE APLICACIÓN (casos de uso)
│   ├── use-cases/        │  CreateProduct, RegisterMovement, GetProducts...
│   └── dtos/             │  Data Transfer Objects
│
└── infrastructure/       ← CAPA DE INFRAESTRUCTURA (detalles técnicos)
    ├── database/         │  Conexión SQLite, migraciones
    ├── repositories/     │  Implementaciones: SQLiteProductRepo, SQLiteMovementRepo
    └── http/             │  Express: server, controllers, routes, middlewares
```

### Principios Clave

| Principio | Implementación |
|-----------|---------------|
| **Dependency Inversion** | El dominio define interfaces (`IProductRepository`), la infraestructura las implementa (`SQLiteProductRepository`) |
| **Domain-First** | TODA la lógica de negocio vive en `domain/services/InventoryDomainService.ts` |
| **Inmutabilidad** | La entidad `Movement` tiene propiedades `readonly` y no expone métodos de mutación |
| **Stock Calculado** | El stock NUNCA se almacena. Se calcula siempre desde `Product.calculateStock(movements)` |
| **Dependency Injection** | Composición manual en `server.ts` — sin frameworks de DI |

### Flujo de Datos

```
HTTP Request → Controller → Use Case → Domain Service → Entity
                                            ↓
                                    Repository Interface
                                            ↓
                              SQLite Repository (Infrastructure)
```

### Modelo de Datos

```
┌─────────────────┐         ┌──────────────────────────┐
│    products      │         │       movements           │
├─────────────────┤         ├──────────────────────────┤
│ id (PK)         │◄────────│ product_id (FK)           │
│ name (UNIQUE)   │         │ id (PK)                   │
│ description     │         │ type (ENTRY|EXIT|ADJUST.) │
│ created_at      │         │ quantity                   │
│ updated_at      │         │ reason (nullable)          │
│                 │         │ created_at                 │
│ ⚠ NO tiene     │         │ ⚠ NO tiene updated_at     │
│   columna stock │         │   (inmutable)              │
└─────────────────┘         └──────────────────────────┘
```

---

## API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/products` | Listar productos con stock calculado |
| `POST` | `/api/products` | Crear nuevo producto |
| `GET` | `/api/products/:id` | Detalle de producto + historial |
| `POST` | `/api/products/:id/movements` | Registrar movimiento |
| `GET` | `/api/health` | Health check |

> **No existen endpoints PUT/DELETE para movimientos** (inmutabilidad — RN-003).

### Ejemplos

**Crear producto:**
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Tornillo 3/8", "description": "Galvanizado"}'
```

**Registrar entrada:**
```bash
curl -X POST http://localhost:3001/api/products/<id>/movements \
  -H "Content-Type: application/json" \
  -d '{"type": "ENTRY", "quantity": 100}'
```

**Registrar salida:**
```bash
curl -X POST http://localhost:3001/api/products/<id>/movements \
  -H "Content-Type: application/json" \
  -d '{"type": "EXIT", "quantity": 30}'
```

**Registrar ajuste (justificación obligatoria):**
```bash
curl -X POST http://localhost:3001/api/products/<id>/movements \
  -H "Content-Type: application/json" \
  -d '{"type": "ADJUSTMENT", "quantity": -5, "reason": "Merma detectada en auditoría mensual"}'
```

---

## Reglas de Negocio

| # | Regla | Ubicación en Código |
|---|-------|-------------------|
| RN-001 | Stock ≥ 0 siempre | `InventoryDomainService.createExit()`, `createAdjustment()` |
| RN-002 | Salida solo con stock suficiente | `InventoryDomainService.createExit()` |
| RN-003 | Movimientos inmutables | `Movement` (propiedades `readonly`), sin endpoints PUT/DELETE |
| RN-004 | Ajuste requiere justificación (≥ 10 chars) | `Movement.createAdjustment()` |
| RN-005 | Stock calculado desde historial | `Product.calculateStock()`, nunca almacenado |
| RN-006 | Cantidad > 0 | `Movement.createEntry()`, `createExit()` |
| RN-007 | Nombre obligatorio y único | `Product.create()`, `CreateProduct` use case |

---

## Tests

### Ejecución

```bash
cd backend
npm test                # Ejecutar todos los tests
npm run test:watch      # Modo watch
npm run test:coverage   # Con reporte de cobertura
```

### Resultados

```
✓ tests/unit/domain/Product.test.ts           (11 tests)
✓ tests/unit/domain/Movement.test.ts          (19 tests)
✓ tests/unit/domain/InventoryDomainService.test.ts  (19 tests)
✓ tests/unit/application/RegisterMovement.test.ts    (8 tests)

Test Files  4 passed (4)
Tests       57 passed (57)
```

### Cobertura por Regla

| Regla | Tests Directos | Cubierta |
|-------|---------------|----------|
| RN-001 (Stock ≥ 0) | 6 tests | ✅ |
| RN-002 (Salida con stock) | 5 tests | ✅ |
| RN-003 (Inmutabilidad) | 3 tests | ✅ |
| RN-004 (Justificación) | 6 tests | ✅ |
| RN-005 (Stock calculado) | 6 tests | ✅ |
| RN-006 (Cantidad > 0) | 4 tests | ✅ |
| RN-007 (Nombre) | 3 tests | ✅ |

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend** | Node.js + TypeScript + Express | Node 22, TS 5.6 |
| **Base de Datos** | SQLite (better-sqlite3) | - |
| **Frontend** | React + TypeScript + Vite | React 19, Vite 8 |
| **Estilos** | Tailwind CSS v4 | 4.x |
| **Tests** | Vitest | 2.1 |
| **Validación** | Zod | 3.23 |

### ¿Por qué SQLite?
- Sin servidor — es un archivo `.db` + librería
- Setup < 3 minutos
- Migrable a PostgreSQL/MySQL cambiando solo la implementación del repositorio (gracias a Clean Architecture)
- WAL mode habilitado para mejor rendimiento concurrente

---

## Documentación Adicional

| Documento | Ubicación |
|-----------|-----------|
| Historias de Usuario | `docs/HISTORIAS_DE_USUARIO.md` |
| Plan de Pruebas QA | `docs/QA_PLAN.md` |
| UI/UX Reference | `code.html` (diseño base) |

---

## AI Usage

### Herramientas de IA Utilizadas

| Herramienta | Uso |
|-------------|-----|
| **Claude (Anthropic)** vía OpenCode | Asistente principal de desarrollo |

### Cómo se utilizó la IA

1. **Análisis de Requisitos:** Se proporcionó el enunciado del reto técnico y la IA ayudó a descomponer los requisitos en Historias de Usuario formales con criterios de aceptación detallados (formato Dado/Cuando/Entonces).

2. **Diseño Arquitectónico:** La IA propuso la estructura de Clean Architecture con tres capas (Dominio, Aplicación, Infraestructura), definiendo las entidades, value objects, interfaces de repositorio y servicios de dominio.

3. **Implementación de Backend:** Se generó el código del backend completo:
   - Entidades de dominio con validaciones de negocio (`Product`, `Movement`)
   - Servicio de dominio con todas las reglas de negocio (`InventoryDomainService`)
   - Casos de uso (`CreateProduct`, `RegisterMovement`, etc.)
   - Implementaciones SQLite de los repositorios
   - API REST con Express (controllers, routes, middleware de errores)
   - Composición de dependencias (DI manual en server.ts)

4. **Implementación de Frontend:** Basándose en un diseño UI/UX de referencia (`code.html`), la IA generó componentes React + TypeScript con Tailwind CSS, respetando la paleta de colores, tipografía y patrones visuales del diseño original (Material Design 3, kinetic gradient, glass morphism, timeline inmutable).

5. **Tests Unitarios:** La IA generó 57 tests unitarios organizados por capa:
   - Tests de entidades (Movement, Product)
   - Tests del servicio de dominio (InventoryDomainService)
   - Tests de casos de uso con mocks (RegisterMovement)
   - Cobertura completa de las 7 reglas de negocio

6. **QA:** Se generó el plan de pruebas completo incluyendo:
   - 29 casos de prueba mapeados a reglas de negocio
   - Matriz de riesgos con 8 riesgos identificados y mitigaciones
   - Matriz de trazabilidad reglas ↔ tests

### Decisiones humanas vs IA

| Aspecto | Humano | IA |
|---------|--------|-----|
| Requisitos del negocio | ✅ Definidos en el reto | - |
| Diseño UI/UX base | ✅ `code.html` proporcionado | - |
| Stack tecnológico | Aprobación | Propuesta (TypeScript full-stack) |
| Arquitectura | Aprobación | Propuesta (Clean Architecture) |
| Reglas de negocio | ✅ Definidas en el reto | Formalización e implementación |
| Código | Revisión y aprobación | Generación |
| Tests | Revisión | Generación y ejecución |
| QA | Revisión | Generación del plan |

### Prompts clave utilizados

1. "Vamos a realizar un reto técnico de control de inventario con los entregables [...]" — Para iniciar todo el proyecto
2. "Con la que consideres más eficiente en el equipo" — Para la elección de tecnología
3. "Continúa" — Para avanzar entre entregables

### Verificación

- ✅ Todo el código TypeScript compila sin errores (`tsc --noEmit`)
- ✅ Los 57 tests pasan exitosamente (`vitest run`)
- ✅ El servidor Express arranca correctamente
- ✅ La base de datos SQLite se crea automáticamente
