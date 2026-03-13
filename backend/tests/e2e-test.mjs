/**
 * Integration Test Script
 * Prueba end-to-end de todos los endpoints y reglas de negocio
 */

const BASE = 'http://localhost:3001/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  
  const res = await fetch(`${BASE}${path}`, opts);
  let data;
  try {
    const text = await res.text();
    data = JSON.parse(text);
  } catch {
    data = { error: 'Non-JSON response' };
  }
  return { status: res.status, data };
}

function log(icon, msg) { console.log(`${icon} ${msg}`); }
function pass(msg) { log('✅', msg); }
function fail(msg) { log('❌', msg); }
function section(msg) { console.log(`\n${'='.repeat(60)}\n  ${msg}\n${'='.repeat(60)}`); }

let productId1, productId2, productId3;
let passed = 0, failed = 0;

function assert(condition, successMsg, failMsg) {
  if (condition) { pass(successMsg); passed++; }
  else { fail(failMsg || successMsg); failed++; }
}

async function run() {
  // ==========================================
  section('TEST 1: HEALTH CHECK');
  // ==========================================
  const health = await request('GET', '/health');
  assert(health.status === 200 && health.data.status === 'OK',
    `Health check OK: ${health.data.timestamp}`);

  // ==========================================
  section('TEST 2: CREAR PRODUCTOS');
  // ==========================================
  
  // 2.1 Crear producto válido
  const p1 = await request('POST', '/products', {
    name: 'Tornillo 3/8 galvanizado',
    description: 'Tornillo de acero galvanizado para uso industrial'
  });
  assert(p1.status === 201, `Producto 1 creado: "${p1.data.name}" (ID: ${p1.data.id?.substring(0,8)}...)`,
    `Error creando producto 1: ${JSON.stringify(p1.data)}`);
  productId1 = p1.data.id;

  // 2.2 Segundo producto
  const p2 = await request('POST', '/products', {
    name: 'Motor Eléctrico 12V',
    description: 'Motor DC de alto torque'
  });
  assert(p2.status === 201, `Producto 2 creado: "${p2.data.name}"`);
  productId2 = p2.data.id;

  // 2.3 Producto sin descripción
  const p3 = await request('POST', '/products', { name: 'Arandela Plana M8' });
  assert(p3.status === 201, `Producto 3 creado: "${p3.data.name}" (sin descripción)`);
  productId3 = p3.data.id;

  // 2.4 Stock inicial = 0
  assert(p1.data.currentStock === 0, `RN-005: Stock inicial = 0 (calculado desde historial vacío)`,
    `Stock inicial debería ser 0, pero es ${p1.data.currentStock}`);

  // 2.5 ERROR: Nombre duplicado
  const pDup = await request('POST', '/products', { name: 'Tornillo 3/8 galvanizado' });
  assert(pDup.status === 400 && pDup.data.error.includes('Ya existe'),
    `RN-007: Nombre duplicado rechazado: "${pDup.data.error}"`,
    `Debería rechazar nombre duplicado`);

  // 2.6 ERROR: Nombre vacío
  const pEmpty = await request('POST', '/products', { name: '' });
  assert(pEmpty.status === 400 && pEmpty.data.error.includes('obligatorio'),
    `RN-007: Nombre vacío rechazado: "${pEmpty.data.error}"`,
    `Debería rechazar nombre vacío`);

  // ==========================================
  section('TEST 3: MOVIMIENTOS DE ENTRADA');
  // ==========================================

  // 3.1 Entrada de 100 unidades
  const e1 = await request('POST', `/products/${productId1}/movements`, {
    type: 'ENTRY', quantity: 100
  });
  assert(e1.status === 201 && e1.data.type === 'ENTRY' && e1.data.quantity === 100,
    `Entrada registrada: +100 unidades al Tornillo`,
    `Error en entrada: ${JSON.stringify(e1.data)}`);

  // 3.2 Segunda entrada
  const e2 = await request('POST', `/products/${productId1}/movements`, {
    type: 'ENTRY', quantity: 50
  });
  assert(e2.status === 201, `Entrada registrada: +50 unidades al Tornillo`);

  // 3.3 Verificar stock = 150
  const check1 = await request('GET', `/products/${productId1}`);
  assert(check1.data.currentStock === 150,
    `RN-005: Stock calculado correctamente: 100 + 50 = ${check1.data.currentStock}`,
    `Stock debería ser 150, pero es ${check1.data.currentStock}`);

  // 3.4 ERROR: Cantidad 0
  const e0 = await request('POST', `/products/${productId1}/movements`, {
    type: 'ENTRY', quantity: 0
  });
  assert(e0.status === 400, `RN-006: Cantidad 0 rechazada: "${e0.data.error}"`);

  // 3.5 ERROR: Cantidad negativa
  const eNeg = await request('POST', `/products/${productId1}/movements`, {
    type: 'ENTRY', quantity: -10
  });
  assert(eNeg.status === 400, `RN-006: Cantidad negativa rechazada: "${eNeg.data.error}"`);

  // ==========================================
  section('TEST 4: MOVIMIENTOS DE SALIDA');
  // ==========================================

  // 4.1 Salida válida (stock 150 → 120)
  const s1 = await request('POST', `/products/${productId1}/movements`, {
    type: 'EXIT', quantity: 30
  });
  assert(s1.status === 201, `Salida registrada: -30 unidades (stock: 150 → 120)`);

  // 4.2 Verificar stock = 120
  const check2 = await request('GET', `/products/${productId1}`);
  assert(check2.data.currentStock === 120,
    `RN-005: Stock actualizado: ${check2.data.currentStock}`,
    `Stock debería ser 120, pero es ${check2.data.currentStock}`);

  // 4.3 ERROR: Salida que excede stock
  const sFail = await request('POST', `/products/${productId1}/movements`, {
    type: 'EXIT', quantity: 999
  });
  assert(sFail.status === 400 && sFail.data.error.includes('Stock insuficiente'),
    `RN-001/002: Salida excesiva rechazada: "${sFail.data.error}"`,
    `Debería rechazar salida excesiva`);

  // 4.4 Salida que deja stock en 0 (sacar todo: 120)
  const sAll = await request('POST', `/products/${productId1}/movements`, {
    type: 'EXIT', quantity: 120
  });
  assert(sAll.status === 201, `Salida total registrada: -120 unidades (stock → 0)`);

  // 4.5 Verificar stock = 0
  const check3 = await request('GET', `/products/${productId1}`);
  assert(check3.data.currentStock === 0,
    `RN-001: Stock en 0 (permitido, nunca negativo): ${check3.data.currentStock}`,
    `Stock debería ser 0, pero es ${check3.data.currentStock}`);

  // 4.6 ERROR: Salida con stock 0
  const sZero = await request('POST', `/products/${productId1}/movements`, {
    type: 'EXIT', quantity: 1
  });
  assert(sZero.status === 400 && sZero.data.error.includes('Stock insuficiente'),
    `RN-002: Salida con stock 0 rechazada: "${sZero.data.error}"`);

  // ==========================================
  section('TEST 5: AJUSTES DE INVENTARIO');
  // ==========================================

  // Primero metemos stock al producto 2
  await request('POST', `/products/${productId2}/movements`, { type: 'ENTRY', quantity: 50 });

  // 5.1 Ajuste positivo con justificación
  const a1 = await request('POST', `/products/${productId2}/movements`, {
    type: 'ADJUSTMENT', quantity: 10,
    reason: 'Inventario físico encontró 10 unidades adicionales en zona B'
  });
  assert(a1.status === 201 && a1.data.reason !== null,
    `Ajuste positivo registrado: +10 con justificación`,
    `Error en ajuste positivo: ${JSON.stringify(a1.data)}`);

  // 5.2 Ajuste negativo con justificación
  const a2 = await request('POST', `/products/${productId2}/movements`, {
    type: 'ADJUSTMENT', quantity: -5,
    reason: 'Merma detectada durante auditoría mensual de diciembre'
  });
  assert(a2.status === 201, `Ajuste negativo registrado: -5 con justificación`);

  // 5.3 Verificar stock = 55 (50 + 10 - 5)
  const check4 = await request('GET', `/products/${productId2}`);
  assert(check4.data.currentStock === 55,
    `RN-005: Stock con ajustes: 50 + 10 - 5 = ${check4.data.currentStock}`,
    `Stock debería ser 55, pero es ${check4.data.currentStock}`);

  // 5.4 ERROR: Ajuste sin justificación
  const aNoReason = await request('POST', `/products/${productId2}/movements`, {
    type: 'ADJUSTMENT', quantity: 5
  });
  assert(aNoReason.status === 400 && aNoReason.data.error.includes('justificación'),
    `RN-004: Ajuste sin justificación rechazado: "${aNoReason.data.error}"`);

  // 5.5 ERROR: Justificación vacía
  const aEmptyReason = await request('POST', `/products/${productId2}/movements`, {
    type: 'ADJUSTMENT', quantity: 5, reason: ''
  });
  assert(aEmptyReason.status === 400,
    `RN-004: Justificación vacía rechazada: "${aEmptyReason.data.error}"`);

  // 5.6 ERROR: Justificación muy corta
  const aShortReason = await request('POST', `/products/${productId2}/movements`, {
    type: 'ADJUSTMENT', quantity: 5, reason: 'Corta'
  });
  assert(aShortReason.status === 400 && aShortReason.data.error.includes('10 caracteres'),
    `RN-004: Justificación corta rechazada: "${aShortReason.data.error}"`);

  // 5.7 ERROR: Ajuste negativo que dejaría stock negativo
  const aNegOver = await request('POST', `/products/${productId2}/movements`, {
    type: 'ADJUSTMENT', quantity: -100,
    reason: 'Ajuste que debería fallar por superar stock'
  });
  assert(aNegOver.status === 400 && aNegOver.data.error.includes('negativo'),
    `RN-001: Ajuste que dejaría stock negativo rechazado: "${aNegOver.data.error}"`);

  // ==========================================
  section('TEST 6: INMUTABILIDAD (RN-003)');
  // ==========================================

  // 6.1 No debe existir endpoint PUT
  const put = await request('PUT', `/products/${productId1}/movements`);
  assert(put.status === 404,
    `RN-003: PUT /movements no existe (status: ${put.status})`,
    `PUT debería devolver 404, devolvió ${put.status}`);

  // 6.2 No debe existir endpoint DELETE
  const del = await request('DELETE', `/products/${productId1}/movements`);
  assert(del.status === 404,
    `RN-003: DELETE /movements no existe (status: ${del.status})`,
    `DELETE debería devolver 404, devolvió ${del.status}`);

  // ==========================================
  section('TEST 7: PRODUCTO INEXISTENTE');
  // ==========================================

  const notFound = await request('GET', '/products/nonexistent-id');
  assert(notFound.status === 404,
    `Producto inexistente: 404 (${notFound.data.error})`);

  const movNotFound = await request('POST', '/products/nonexistent-id/movements', {
    type: 'ENTRY', quantity: 10
  });
  assert(movNotFound.status === 400 && movNotFound.data.error.includes('no encontrado'),
    `Movimiento para producto inexistente rechazado: "${movNotFound.data.error}"`);

  // ==========================================
  section('TEST 8: TIPO DE MOVIMIENTO INVÁLIDO');
  // ==========================================

  const invalidType = await request('POST', `/products/${productId1}/movements`, {
    type: 'INVALID', quantity: 10
  });
  assert(invalidType.status === 400 && invalidType.data.error.includes('inválido'),
    `Tipo inválido rechazado: "${invalidType.data.error}"`);

  // ==========================================
  section('TEST 9: HISTORIAL COMPLETO Y STOCK CALCULADO');
  // ==========================================

  // Reponer stock al producto 1 y hacer secuencia compleja
  await request('POST', `/products/${productId1}/movements`, { type: 'ENTRY', quantity: 200 });
  await request('POST', `/products/${productId1}/movements`, { type: 'EXIT', quantity: 45 });
  await request('POST', `/products/${productId1}/movements`, {
    type: 'ADJUSTMENT', quantity: -8,
    reason: 'Merma por productos dañados en transporte'
  });
  await request('POST', `/products/${productId1}/movements`, { type: 'ENTRY', quantity: 30 });

  const detail = await request('GET', `/products/${productId1}`);
  // Stock: 0 (anterior) + 200 - 45 - 8 + 30 = 177
  assert(detail.data.currentStock === 177,
    `RN-005: Stock calculado tras secuencia compleja: 0 + 200 - 45 - 8 + 30 = ${detail.data.currentStock}`,
    `Stock debería ser 177, pero es ${detail.data.currentStock}`);

  assert(detail.data.movements.length > 0,
    `Historial tiene ${detail.data.movements.length} movimientos`,
    `Historial vacío inesperado`);

  // Verificar que los movimientos están ordenados (más reciente primero)
  const dates = detail.data.movements.map(m => new Date(m.createdAt).getTime());
  const isSorted = dates.every((d, i) => i === 0 || d <= dates[i - 1]);
  assert(isSorted, `Historial ordenado del más reciente al más antiguo`);

  // ==========================================
  section('TEST 10: LISTADO GENERAL CON STOCK CALCULADO');
  // ==========================================

  const allProducts = await request('GET', '/products');
  assert(allProducts.status === 200 && allProducts.data.length === 3,
    `Listado: ${allProducts.data.length} productos encontrados`);

  allProducts.data.forEach(p => {
    log('📦', `${p.name} | Stock: ${p.currentStock}`);
  });

  // ==========================================
  // RESUMEN
  // ==========================================
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  RESUMEN DE PRUEBAS END-TO-END`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  ✅ Pasaron: ${passed}`);
  console.log(`  ❌ Fallaron: ${failed}`);
  console.log(`  📊 Total: ${passed + failed}`);
  console.log(`${'='.repeat(60)}`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
