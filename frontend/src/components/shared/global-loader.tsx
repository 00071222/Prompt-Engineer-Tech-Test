'use client';

import React from 'react';
import { useUIStore } from '@/store/ui-store';

export default function GlobalLoader() {
  const isGlobalLoading = useUIStore((state) => state.isGlobalLoading);

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-900/90 p-8 shadow-2xl border border-slate-800/80 animate-in fade-in zoom-in duration-200">
        {/* Modern Premium Spinner */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-4 border-slate-800"></div>
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent"></div>
        </div>
        <p className="text-sm font-semibold text-slate-200 tracking-wide mt-2">
          Procesando solicitud...
        </p>
        <p className="text-xs text-slate-500">
          Por favor, no cierre esta ventana.
        </p>
      </div>
    </div>
  );
}
