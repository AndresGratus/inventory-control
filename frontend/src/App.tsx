/**
 * App - Main Application Component
 * Simple router using state for navigation between ProductList and ProductDetail
 */

import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';

function App() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar
        title={selectedProductId ? 'Detalle de Producto' : 'Dashboard'}
        onBack={selectedProductId ? () => setSelectedProductId(null) : undefined}
      />

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-24">
        {selectedProductId ? (
          <ProductDetail productId={selectedProductId} />
        ) : (
          <ProductList onSelectProduct={setSelectedProductId} />
        )}
      </main>

      {/* Bottom Nav Bar (from code.html design) */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav h-20 px-6 flex items-center justify-around z-50">
        <button
          onClick={() => setSelectedProductId(null)}
          className="flex flex-col items-center gap-1 group"
        >
          <span className={`material-symbols-outlined text-white ${!selectedProductId ? 'filled' : 'opacity-60'}`}>
            dashboard
          </span>
          <span className={`text-[10px] text-white font-bold ${!selectedProductId ? '' : 'opacity-60'}`}>
            Dashboard
          </span>
        </button>

        <button
          onClick={() => setSelectedProductId(null)}
          className="flex flex-col items-center gap-1 group opacity-60"
        >
          <span className="material-symbols-outlined text-white">inventory_2</span>
          <span className="text-[10px] text-white">Inventario</span>
        </button>

        <div className="flex flex-col items-center -mt-10">
          <div className="w-14 h-14 kinetic-gradient rounded-full flex items-center justify-center shadow-lg border-4 border-[var(--background)]">
            <span className="material-symbols-outlined text-white text-2xl">add</span>
          </div>
          <span className="text-[10px] text-white mt-2">Nuevo</span>
        </div>

        <button className="flex flex-col items-center gap-1 group opacity-60">
          <span className="material-symbols-outlined text-white">history</span>
          <span className="text-[10px] text-white">Historial</span>
        </button>

        <button className="flex flex-col items-center gap-1 group opacity-60">
          <span className="material-symbols-outlined text-white">person</span>
          <span className="text-[10px] text-white">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
