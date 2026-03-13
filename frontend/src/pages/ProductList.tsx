/**
 * ProductList Page
 * Listado de productos con stock calculado y estados visuales
 */

import { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { StockBadge } from '../components/StockBadge';
import { CreateProductModal } from '../components/CreateProductModal';

interface ProductListProps {
  onSelectProduct: (id: string) => void;
}

export function ProductList({ onSelectProduct }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (data: { name: string; description?: string }) => {
    await api.createProduct(data);
    await loadProducts();
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold tracking-[0.05em] text-[var(--on-tertiary-container)] bg-[var(--tertiary-fixed)] px-2 py-1 inline-block mb-3">
              INVENTARIO GENERAL
            </span>
            <h2 className="font-[Work_Sans] text-3xl lg:text-4xl font-bold tracking-tight text-[var(--primary)]">
              Control de Inventario
            </h2>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">
              {products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="kinetic-gradient text-[var(--on-primary)] px-6 py-3 text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:opacity-90 transition-opacity self-start"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Nuevo Producto
          </button>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-[var(--error-container)] text-[var(--on-error-container)] mb-6">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm">{error}</span>
          <button onClick={loadProducts} className="ml-auto text-xs font-bold uppercase underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-[var(--outline-variant)] animate-spin block mb-4">
            progress_activity
          </span>
          <p className="text-[var(--on-surface-variant)]">Cargando productos...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-16 bg-[var(--surface-container-lowest)]">
          <span className="material-symbols-outlined text-6xl text-[var(--outline-variant)] mb-4 block">
            inventory_2
          </span>
          <h3 className="font-[Work_Sans] text-lg font-bold text-[var(--primary)] mb-2">
            No hay productos registrados
          </h3>
          <p className="text-sm text-[var(--on-surface-variant)] mb-6">
            Crea tu primer producto para comenzar a gestionar el inventario
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[var(--primary)] text-[var(--on-primary)] px-6 py-3 text-xs uppercase tracking-widest font-bold"
          >
            Crear Primer Producto
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className="bg-[var(--surface-container-lowest)] p-6 cursor-pointer hover:shadow-lg transition-shadow border border-transparent hover:border-[var(--outline-variant)]/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--on-surface)] truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-[var(--on-surface-variant)] mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                <StockBadge stock={product.currentStock} size="sm" />
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-[Work_Sans] text-3xl font-bold text-[var(--primary)]">
                  {product.currentStock.toLocaleString()}
                </span>
                <span className="text-sm text-[var(--on-surface-variant)]">unidades</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--on-surface-variant)] uppercase">
                <span>Creado: {new Date(product.createdAt).toLocaleDateString('es-ES')}</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
}
