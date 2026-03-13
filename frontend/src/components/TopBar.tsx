/**
 * TopBar Component
 * Header con navegación y título del dashboard
 * Basado en el diseño de code.html
 */

interface TopBarProps {
  title: string;
  onBack?: () => void;
}

export function TopBar({ title, onBack }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--surface-container-low)] px-6 py-4 flex items-center justify-between border-b border-[var(--outline-variant)]/20">
      <div className="flex items-center gap-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 hover:bg-[var(--surface-container)] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[var(--on-surface)]">arrow_back</span>
          </button>
        ) : (
          <div className="flex items-center justify-center w-10 h-10">
            <span className="material-symbols-outlined text-[var(--on-surface)]">inventory_2</span>
          </div>
        )}
        <h1 className="font-[Work_Sans] text-xl font-bold text-[var(--on-surface)]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center justify-center w-10 h-10 hover:bg-[var(--surface-container)] rounded-full transition-colors">
          <span className="material-symbols-outlined text-[var(--on-surface)]">notifications</span>
        </button>
      </div>
    </header>
  );
}
