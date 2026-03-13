/**
 * StockBadge Component
 * Indicador visual de nivel de stock
 * Verde (>10), Amarillo (1-10), Rojo (0)
 */

interface StockBadgeProps {
  stock: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StockBadge({ stock, size = 'md' }: StockBadgeProps) {
  const getStockLevel = () => {
    if (stock === 0) return { label: 'Sin Stock', color: 'bg-[var(--error)] text-[var(--on-error)]', icon: 'error' };
    if (stock <= 10) return { label: 'Stock Bajo', color: 'bg-amber-500 text-white', icon: 'warning' };
    return { label: 'Disponible', color: 'bg-emerald-600 text-white', icon: 'check_circle' };
  };

  const level = getStockLevel();
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${level.color} ${sizeClasses[size]}`}>
      <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '12px' : '16px' }}>
        {level.icon}
      </span>
      {level.label}
    </span>
  );
}
