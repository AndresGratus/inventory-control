/**
 * MovementForm Component
 * Formulario para registrar movimientos (entrada, salida, ajuste)
 * Con validaciones y mensajes de error
 */

import { useState } from 'react';
import { CreateMovementRequest } from '../types';

interface MovementFormProps {
  currentStock: number;
  onSubmit: (data: CreateMovementRequest) => Promise<void>;
  isLoading: boolean;
}

export function MovementForm({ currentStock, onSubmit, isLoading }: MovementFormProps) {
  const [type, setType] = useState<'ENTRY' | 'EXIT' | 'ADJUSTMENT'>('ENTRY');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = Number(quantity);

    // Client-side validations
    if (!quantity || qty === 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (type !== 'ADJUSTMENT' && qty <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (type === 'EXIT' && qty > currentStock) {
      setError(`Stock insuficiente. Disponible: ${currentStock}`);
      return;
    }

    if (type === 'ADJUSTMENT' && !reason.trim()) {
      setError('La justificación es obligatoria para ajustes');
      return;
    }

    if (type === 'ADJUSTMENT' && reason.trim().length < 10) {
      setError('La justificación debe tener al menos 10 caracteres');
      return;
    }

    try {
      await onSubmit({
        type,
        quantity: type === 'EXIT' ? qty : qty,
        reason: type === 'ADJUSTMENT' ? reason.trim() : undefined,
      });
      // Reset form on success
      setQuantity('');
      setReason('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar movimiento');
    }
  };

  const typeConfig = {
    ENTRY: {
      label: 'Entrada',
      icon: 'add_circle_outline',
      color: 'bg-[var(--primary)] text-[var(--on-primary)]',
      activeColor: 'border-[var(--primary)] bg-[var(--primary-fixed)]',
    },
    EXIT: {
      label: 'Salida',
      icon: 'remove_circle_outline',
      color: 'bg-[var(--error)] text-[var(--on-error)]',
      activeColor: 'border-[var(--error)] bg-[var(--error-container)]',
    },
    ADJUSTMENT: {
      label: 'Ajuste',
      icon: 'build_circle',
      color: 'bg-[var(--tertiary-container)] text-[var(--tertiary-fixed-dim)]',
      activeColor: 'border-[var(--on-tertiary-container)] bg-[var(--tertiary-fixed)]',
    },
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--surface-container-lowest)] p-6 space-y-6">
      <h3 className="font-[Work_Sans] text-lg font-bold text-[var(--primary)]">
        Registrar Movimiento
      </h3>

      {/* Type Selector */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold block mb-3">
          Tipo de Movimiento
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((key) => {
            const config = typeConfig[key];
            const isActive = type === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => { setType(key); setError(null); }}
                className={`flex flex-col items-center gap-1 p-3 border-2 transition-all ${
                  isActive
                    ? config.activeColor
                    : 'border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{config.icon}</span>
                <span className="text-xs font-bold">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold block mb-2">
          Cantidad {type === 'ADJUSTMENT' && '(positiva o negativa)'}
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => { setQuantity(e.target.value); setError(null); }}
          placeholder={type === 'ADJUSTMENT' ? 'Ej: 5 o -3' : 'Ej: 10'}
          min={type === 'ADJUSTMENT' ? undefined : 1}
          step="1"
          className="w-full px-4 py-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] text-lg font-semibold focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
        {type === 'EXIT' && (
          <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">
            Stock disponible: <strong>{currentStock}</strong> unidades
          </p>
        )}
      </div>

      {/* Reason (only for adjustments) */}
      {type === 'ADJUSTMENT' && (
        <div>
          <label className="text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold block mb-2">
            Justificación <span className="text-[var(--error)]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(null); }}
            placeholder="Describa la razón del ajuste (mín. 10 caracteres)..."
            rows={3}
            className="w-full px-4 py-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--on-tertiary-container)] transition-colors resize-none"
          />
          <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">
            {reason.trim().length}/10 caracteres mínimos
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--error-container)] text-[var(--on-error-container)]">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 font-semibold text-xs uppercase tracking-widest transition-opacity ${
          typeConfig[type].color
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            Registrando...
          </span>
        ) : (
          `Registrar ${typeConfig[type].label}`
        )}
      </button>
    </form>
  );
}
