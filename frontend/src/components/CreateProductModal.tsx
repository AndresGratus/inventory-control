/**
 * CreateProductModal Component
 * Modal para crear un nuevo producto
 */

import { useState } from 'react';
import { CreateProductRequest } from '../types';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
}

export function CreateProductModal({ isOpen, onClose, onSubmit }: CreateProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del producto es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--surface-container-lowest)] w-full max-w-md shadow-2xl">
        <div className="kinetic-gradient p-6">
          <h2 className="font-[Work_Sans] text-xl font-bold text-white">Nuevo Producto</h2>
          <p className="text-sm text-[var(--primary-fixed-dim)] mt-1">
            Registra un nuevo producto en el inventario
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold block mb-2">
              Nombre del Producto <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              placeholder="Ej: Tornillo 3/8 galvanizado"
              autoFocus
              className="w-full px-4 py-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold block mb-2">
              Descripción <span className="text-[var(--on-surface-variant)]">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[var(--error-container)] text-[var(--on-error-container)]">
              <span className="material-symbols-outlined text-lg">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[var(--outline-variant)] text-[var(--on-surface)] text-xs uppercase tracking-widest font-bold hover:bg-[var(--surface-container-low)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 bg-[var(--primary)] text-[var(--on-primary)] text-xs uppercase tracking-widest font-bold transition-opacity ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              {isLoading ? 'Creando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
