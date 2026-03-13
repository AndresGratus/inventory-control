/**
 * StockMonolith Component
 * Bloque visual grande mostrando el stock calculado actual
 * Basado en el "Calculated Current Stock Monolith" del diseño code.html
 */

interface StockMonolithProps {
  stock: number;
  productName: string;
}

export function StockMonolith({ stock, productName }: StockMonolithProps) {
  const getStockColor = () => {
    if (stock === 0) return 'text-red-400';
    if (stock <= 10) return 'text-amber-400';
    return 'text-white';
  };

  return (
    <div className="w-full md:w-auto kinetic-gradient p-8 text-[var(--on-primary)] shadow-xl flex flex-col items-start min-w-[280px]">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--primary-fixed-dim)] mb-4">
        Stock Actual Calculado
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`font-[Work_Sans] text-6xl font-bold ${getStockColor()}`}>
          {stock.toLocaleString()}
        </span>
        <span className="text-lg text-[var(--primary-fixed-dim)]">unidades</span>
      </div>
      <div className="mt-4 text-xs text-[var(--primary-fixed-dim)]">
        <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
        Calculado desde el historial de movimientos
      </div>
    </div>
  );
}
