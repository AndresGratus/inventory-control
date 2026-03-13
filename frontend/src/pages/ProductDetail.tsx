/**
 * ProductDetail Page
 * Detalle de producto con stock monolith, formulario de movimiento y timeline
 * Basado en el diseño de code.html
 */

import { useState, useEffect } from 'react';
import { ProductDetail as ProductDetailType } from '../types';
import { api } from '../services/api';
import { StockMonolith } from '../components/StockMonolith';
import { MovementForm } from '../components/MovementForm';
import { MovementTimeline } from '../components/MovementTimeline';
import { StockBadge } from '../components/StockBadge';
import { CreateMovementRequest } from '../types';

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getProductById(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar producto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleRegisterMovement = async (data: CreateMovementRequest) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      await api.registerMovement(productId, data);
      setSuccessMessage(`Movimiento de ${data.type === 'ENTRY' ? 'entrada' : data.type === 'EXIT' ? 'salida' : 'ajuste'} registrado exitosamente`);
      await loadProduct(); // Refresh data
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl text-[var(--outline-variant)] animate-spin block mb-4">
          progress_activity
        </span>
        <p className="text-[var(--on-surface-variant)]">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl text-[var(--error)] block mb-4">
          error
        </span>
        <p className="text-[var(--on-surface-variant)]">{error || 'Producto no encontrado'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Product Hero Header */}
      <section className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold tracking-[0.05em] text-[var(--on-tertiary-container)] bg-[var(--tertiary-fixed)] px-2 py-1">
              DETALLE PRODUCTO
            </span>
            <StockBadge stock={product.currentStock} />
          </div>
          <h2 className="font-[Work_Sans] text-3xl lg:text-4xl font-bold tracking-tight text-[var(--primary)] mb-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="text-sm text-[var(--on-surface-variant)]">{product.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-highest)] px-3 py-1 font-semibold">
              ID: {product.id.substring(0, 8)}...
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--outline-variant)]"></span>
            <span className="text-xs text-[var(--on-surface-variant)]">
              Creado: {new Date(product.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stock Monolith */}
        <StockMonolith stock={product.currentStock} productName={product.name} />
      </section>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 mb-6 border-l-4 border-emerald-500">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Bento Grid: Form + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Movement Form */}
          <MovementForm
            currentStock={product.currentStock}
            onSubmit={handleRegisterMovement}
            isLoading={isSubmitting}
          />

          {/* Stats Card */}
          <div className="bg-[var(--surface-container-lowest)] p-6">
            <h3 className="font-[Work_Sans] text-lg font-bold text-[var(--primary)] mb-6">
              Resumen de Movimientos
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-[var(--outline-variant)]/10 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Total Movimientos
                </span>
                <span className="text-sm font-semibold">{product.movements.length}</span>
              </div>
              <div className="flex justify-between items-end border-b border-[var(--outline-variant)]/10 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Entradas
                </span>
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {product.movements.filter(m => m.type === 'ENTRY').length}
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-[var(--outline-variant)]/10 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Salidas
                </span>
                <span className="text-sm font-semibold text-[var(--error)]">
                  {product.movements.filter(m => m.type === 'EXIT').length}
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-[var(--outline-variant)]/10 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Ajustes
                </span>
                <span className="text-sm font-semibold text-[var(--on-tertiary-container)]">
                  {product.movements.filter(m => m.type === 'ADJUSTMENT').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Movement History */}
        <div className="lg:col-span-8 bg-[var(--surface-container-lowest)] p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <h3 className="font-[Work_Sans] text-2xl font-bold text-[var(--primary)]">
              Historial Inmutable de Movimientos
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
              <span className="material-symbols-outlined text-sm">lock</span>
              Los registros no pueden ser modificados
            </div>
          </div>

          <MovementTimeline movements={product.movements} />
        </div>
      </div>
    </div>
  );
}
