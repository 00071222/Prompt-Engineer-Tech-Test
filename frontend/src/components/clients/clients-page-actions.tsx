'use client';

import React from 'react';
import { useClientModalStore } from '@/store/client-modal-store';

export default function ClientsPageActions() {
  const openModal = useClientModalStore((state) => state.openModal);

  const handleNewClient = () => {
    openModal('', () => {});
  };

  return (
    <button
      id="new-client-btn"
      onClick={handleNewClient}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.98] select-none cursor-pointer"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
      </svg>
      Nuevo Cliente
    </button>
  );
}
