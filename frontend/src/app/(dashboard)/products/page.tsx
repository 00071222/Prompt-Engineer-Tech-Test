import React from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 text-white relative">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-md space-y-4 relative">
        <svg className="mx-auto h-12 w-12 text-indigo-400 mb-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          Products Catalog
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          El catálogo de productos está administrado a nivel de base de datos. Próximamente se habilitará la gestión visual de inventario aquí.
        </p>
        <Link href="/" className="inline-flex px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-750 transition-colors">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
