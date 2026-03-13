/**
 * MovementTimeline Component
 * Timeline inmutable de movimientos de inventario
 * Basado en el "Immutable Movement History" del diseño code.html
 */

import { Movement } from '../types';

interface MovementTimelineProps {
  movements: Movement[];
}

export function MovementTimeline({ movements }: MovementTimelineProps) {
  const getMovementConfig = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return {
          icon: 'add_circle_outline',
          iconColor: 'text-[var(--primary)]',
          bgColor: 'bg-[var(--surface-container-high)]',
          label: 'Entrada de Mercancía',
          quantityColor: 'text-[var(--primary)]',
          prefix: '+',
        };
      case 'EXIT':
        return {
          icon: 'remove_circle_outline',
          iconColor: 'text-[var(--error)]',
          bgColor: 'bg-[var(--surface-container-low)]',
          label: 'Salida de Mercancía',
          quantityColor: 'text-[var(--error)]',
          prefix: '-',
        };
      case 'ADJUSTMENT':
        return {
          icon: 'build_circle',
          iconColor: 'text-[var(--tertiary-fixed-dim)]',
          bgColor: 'bg-[var(--tertiary-container)]',
          label: 'Ajuste Manual',
          quantityColor: 'text-[var(--on-tertiary-container)]',
          prefix: '',
        };
      default:
        return {
          icon: 'help',
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Desconocido',
          quantityColor: 'text-gray-500',
          prefix: '',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' • ' + date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatQuantity = (movement: Movement) => {
    const config = getMovementConfig(movement.type);
    if (movement.type === 'ADJUSTMENT') {
      return movement.quantity > 0 ? `+${movement.quantity}` : `${movement.quantity}`;
    }
    return `${config.prefix}${Math.abs(movement.quantity)}`;
  };

  if (movements.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-5xl text-[var(--outline-variant)] mb-4 block">
          history
        </span>
        <p className="text-[var(--on-surface-variant)] text-sm">
          No hay movimientos registrados para este producto.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical Timeline Line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[var(--outline-variant)]/30"></div>

      {movements.map((movement, index) => {
        const config = getMovementConfig(movement.type);
        const isLast = index === movements.length - 1;

        return (
          <div key={movement.id} className={`relative pl-12 ${isLast ? '' : 'pb-10'}`}>
            {/* Timeline Node */}
            <div
              className={`absolute left-0 top-1 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center border border-[var(--outline-variant)]/10`}
            >
              <span className={`material-symbols-outlined ${config.iconColor} text-xl`}>
                {config.icon}
              </span>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--on-surface)]">{config.label}</h4>
                
                {/* Justificación para ajustes */}
                {movement.type === 'ADJUSTMENT' && movement.reason && (
                  <div className="mt-2 p-3 bg-[var(--surface-container-low)] border-l-4 border-[var(--tertiary-fixed-dim)]">
                    <p className="text-xs italic text-[var(--on-tertiary-container)]">
                      "{movement.reason}"
                    </p>
                  </div>
                )}

                <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                  <span className="material-symbols-outlined text-xs align-middle mr-1">lock</span>
                  Registro inmutable
                </p>
              </div>

              <div className="text-right">
                <span className={`font-[Work_Sans] text-lg font-bold ${config.quantityColor}`}>
                  {formatQuantity(movement)}
                </span>
                <p className="text-[10px] text-[var(--on-surface-variant)] uppercase">
                  {formatDate(movement.createdAt)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
