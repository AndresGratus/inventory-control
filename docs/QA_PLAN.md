# Plan de Pruebas — Sistema de Control de Inventario

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Proyecto** | Control de Inventario de Bodega |
| **Versión** | 1.0 |
| **Fecha** | 2026-03-13 |
| **Responsable QA** | Equipo ACMOTOS |
| **Alcance** | Backend (API REST), Frontend (React), Dominio (Reglas de Negocio) |

---

## 2. Objetivo del Plan de Pruebas

Validar que el sistema de control de inventario cumple con las 7 reglas de negocio definidas, garantizando:
- Integridad del stock (nunca negativo)
- Inmutabilidad de los movimientos registrados
- Correcta validación de ajustes con justificación obligatoria
- Cálculo de stock siempre basado en historial de movimientos
- Experiencia de usuario clara con mensajes de error descriptivos

---

## 3. Estrategia de Pruebas

| Nivel | Tipo | Herramienta | Cobertura |
|-------|------|-------------|-----------|
| **Unitarias** | Caja blanca | Vitest | Entidades, Value Objects, Domain Services, Use Cases |
| **Integración** | API REST | Vitest + Supertest | Endpoints, flujos completos |
| **Frontend** | Componentes | Manual / Visual | Formularios, estados, errores |
| **Aceptación** | Criterios HU | Manual | Criterios de aceptación de cada HU |

---

## 4. Casos de Prueba sobre Reglas de Negocio

### RN-001: El stock no puede ser negativo en ningún momento

| ID | Caso | Precondición | Acción | Resultado Esperado | Prioridad |
|----|------|-------------|--------|-------------------|-----------|
| TC-001 | Salida que excede stock | Stock = 10 | Salida qty=15 | Error: "Stock insuficiente. Disponible: 10" | CRÍTICA |
| TC-002 | Salida con stock 0 | Stock = 0 | Salida qty=1 | Error: "Stock insuficiente. Disponible: 0" | CRÍTICA |
| TC-003 | Ajuste negativo excede stock | Stock = 5 | Ajuste qty=-8 | Error: "El ajuste dejaría el stock en negativo" | CRÍTICA |
| TC-004 | Ajuste negativo con stock 0 | Stock = 0 | Ajuste qty=-1 | Error: "El ajuste dejaría el stock en negativo" | CRÍTICA |
| TC-005 | Salida deja stock en 0 | Stock = 20 | Salida qty=20 | Stock = 0 (permitido) | ALTA |
| TC-006 | Ajuste negativo deja stock en 0 | Stock = 15 | Ajuste qty=-15 | Stock = 0 (permitido) | ALTA |

### RN-002: Salida solo si existe stock suficiente

| ID | Caso | Precondición | Acción | Resultado Esperado | Prioridad |
|----|------|-------------|--------|-------------------|-----------|
| TC-007 | Salida válida | Stock = 100 | Salida qty=30 | Stock = 70 | ALTA |
| TC-008 | Salida por stock completo | Stock = 50 | Salida qty=50 | Stock = 0 | ALTA |
| TC-009 | Validación después de múltiples salidas | Stock = 100, sale 40, sale 35 | Salida qty=26 | Error (stock disponible: 25) | CRÍTICA |
| TC-010 | Salida de 1 unidad con stock 1 | Stock = 1 | Salida qty=1 | Stock = 0 | MEDIA |

### RN-003: Movimientos inmutables una vez registrados

| ID | Caso | Precondición | Acción | Resultado Esperado | Prioridad |
|----|------|-------------|--------|-------------------|-----------|
| TC-011 | No existe endpoint PUT para movimientos | Movimiento registrado | PUT /api/products/:id/movements/:mid | 404 / Method Not Allowed | CRÍTICA |
| TC-012 | No existe endpoint DELETE para movimientos | Movimiento registrado | DELETE /api/products/:id/movements/:mid | 404 / Method Not Allowed | CRÍTICA |
| TC-013 | Propiedades readonly en entidad | Movimiento creado | Intentar modificar .quantity | Error de compilación TypeScript | ALTA |
| TC-014 | Save solo insert, nunca update | Movimiento registrado | Verificar SQL ejecutado | Solo INSERT, nunca UPDATE | ALTA |

### RN-004: Ajuste con justificación obligatoria

| ID | Caso | Precondición | Acción | Resultado Esperado | Prioridad |
|----|------|-------------|--------|-------------------|-----------|
| TC-015 | Ajuste sin justificación | Stock = 10 | Ajuste qty=5, reason="" | Error: "La justificación es obligatoria para ajustes" | ALTA |
| TC-016 | Ajuste con justificación de espacios | Stock = 10 | Ajuste qty=5, reason="   " | Error: "La justificación es obligatoria para ajustes" | ALTA |
| TC-017 | Justificación menor a 10 chars | Stock = 10 | Ajuste qty=5, reason="Corta" | Error: "La justificación debe tener al menos 10 caracteres" | ALTA |
| TC-018 | Justificación de exactamente 10 chars | Stock = 10 | Ajuste qty=5, reason="1234567890" | Ajuste registrado correctamente | MEDIA |
| TC-019 | Ajuste positivo con justificación válida | Stock = 10 | Ajuste qty=+5, reason válida | Stock = 15, justificación guardada | ALTA |
| TC-020 | Ajuste negativo con justificación válida | Stock = 10 | Ajuste qty=-3, reason válida | Stock = 7, justificación guardada | ALTA |

### RN-005: Stock calculado desde historial de movimientos

| ID | Caso | Precondición | Acción | Resultado Esperado | Prioridad |
|----|------|-------------|--------|-------------------|-----------|
| TC-021 | Stock inicial de producto nuevo | Producto recién creado | Consultar stock | Stock = 0 (sin movimientos) | CRÍTICA |
| TC-022 | Stock con solo entradas | 3 entradas: +10, +5, +3 | Consultar stock | Stock = 18 | ALTA |
| TC-023 | Stock con entradas y salidas | Entrada +100, Salida -30 | Consultar stock | Stock = 70 | ALTA |
| TC-024 | Stock con entradas, salidas y ajustes | E+100, S-30, A-5, E+20, A+3, S-8 | Consultar stock | Stock = 80 | CRÍTICA |
| TC-025 | No existe campo stock en BD | Tabla products | Verificar schema | No hay columna "stock" en products | ALTA |

### RN-006 y RN-007: Validaciones de cantidad y nombre

| ID | Caso | Precondición | Acción | Resultado Esperado | Prioridad |
|----|------|-------------|--------|-------------------|-----------|
| TC-026 | Cantidad 0 en entrada | - | Entrada qty=0 | Error: "La cantidad debe ser mayor a 0" | ALTA |
| TC-027 | Cantidad negativa en salida | - | Salida qty=-5 | Error: "La cantidad debe ser mayor a 0" | ALTA |
| TC-028 | Producto sin nombre | - | Crear producto name="" | Error: "El nombre del producto es obligatorio" | ALTA |
| TC-029 | Producto con nombre duplicado | Producto "Tornillo" existe | Crear producto name="Tornillo" | Error: "Ya existe un producto con este nombre" | ALTA |

---

## 5. Matriz de Riesgos del Dominio

| ID | Riesgo | Probabilidad | Impacto | Severidad | Mitigación |
|----|--------|-------------|---------|-----------|------------|
| R-001 | **Stock negativo por condiciones de carrera** (dos salidas concurrentes sobre el mismo producto) | Media | Crítico | 🔴 ALTO | SQLite usa serialización por defecto (un solo writer). Para producción con otra BD, implementar bloqueo optimista o transacciones con nivel de aislamiento SERIALIZABLE |
| R-002 | **Modificación de movimientos a nivel de BD** (bypass del API, acceso directo a SQLite) | Baja | Crítico | 🟡 MEDIO | En producción: permisos de BD restrictivos, auditoría de acceso, considerar base de datos append-only |
| R-003 | **Pérdida de datos por corrupción del archivo SQLite** | Baja | Alto | 🟡 MEDIO | Backups periódicos del archivo .db, uso de WAL mode (ya implementado), migración a motor de BD con replicación para producción |
| R-004 | **Inconsistencia en cálculo de stock** por errores en el historial | Muy Baja | Crítico | 🟡 MEDIO | Stock siempre calculado (RN-005), tests unitarios exhaustivos sobre calculateStock, auditoría periódica comparando suma de movimientos vs stock mostrado |
| R-005 | **Inyección SQL a través de campos de texto** (nombre producto, justificación) | Baja | Alto | 🟡 MEDIO | Uso de prepared statements (better-sqlite3 los usa por defecto), validación de inputs con Zod |
| R-006 | **Degradación de rendimiento** con alto volumen de movimientos (cálculo de stock desde historial completo) | Media | Medio | 🟡 MEDIO | Para producción: implementar vista materializada o cache de stock con invalidación al registrar movimiento. Mantener cálculo desde historial como fuente de verdad para auditorías |
| R-007 | **Falta de autenticación y autorización** | Alta | Alto | 🔴 ALTO | Fuera del alcance del reto técnico. Para producción: implementar JWT, roles (operador, supervisor, admin), auditoría por usuario |
| R-008 | **Cantidades decimales** podrían causar errores de precisión flotante | Baja | Medio | 🟢 BAJO | Actualmente se usan números enteros. Si se requieren decimales, usar biblioteca de precisión decimal |

---

## 6. Cobertura de Tests Implementados

### Tests Unitarios (57 tests)

| Archivo | Tests | Reglas Cubiertas |
|---------|-------|-----------------|
| `Movement.test.ts` | 19 | RN-003, RN-004, RN-006 |
| `Product.test.ts` | 11 | RN-005, RN-007 |
| `InventoryDomainService.test.ts` | 19 | RN-001, RN-002, RN-004, RN-005 |
| `RegisterMovement.test.ts` | 8 | RN-001, RN-002, RN-003, RN-004 |

### Matriz de Trazabilidad: Reglas vs Tests

| Regla | Tests que la cubren | Estado |
|-------|-------------------|--------|
| RN-001 (Stock ≥ 0) | TC-001→006, InventoryDomainService.test | ✅ Cubierta |
| RN-002 (Salida con stock suficiente) | TC-007→010, InventoryDomainService.test | ✅ Cubierta |
| RN-003 (Inmutabilidad) | TC-011→014, Movement.test, RegisterMovement.test | ✅ Cubierta |
| RN-004 (Justificación obligatoria) | TC-015→020, Movement.test, InventoryDomainService.test | ✅ Cubierta |
| RN-005 (Stock desde historial) | TC-021→025, Product.test, InventoryDomainService.test | ✅ Cubierta |
| RN-006 (Cantidad > 0) | TC-026→027, Movement.test | ✅ Cubierta |
| RN-007 (Nombre obligatorio) | TC-028→029, Product.test | ✅ Cubierta |

---

## 7. Criterios de Aceptación / Salida

- ✅ Todos los tests unitarios pasan (57/57)
- ✅ Todas las reglas de negocio tienen al menos 2 tests
- ✅ Backend compila sin errores TypeScript
- ✅ Frontend compila sin errores TypeScript
- ✅ API REST responde correctamente a requests válidos e inválidos
- ✅ Mensajes de error son claros y descriptivos para el usuario
- ✅ No existen endpoints PUT/DELETE para movimientos (inmutabilidad)
- ✅ Stock se calcula siempre desde historial, nunca almacenado como campo

---

## 8. Entorno de Pruebas

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Runtime | Node.js | 22.x |
| Test Runner | Vitest | 2.1.x |
| Base de Datos | SQLite (in-memory para tests) | - |
| Cobertura | V8 Provider | - |
| CI/CD | Compatible con cualquier CI | - |
