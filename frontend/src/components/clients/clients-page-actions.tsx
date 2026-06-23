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
      Nuevo Cliente
    </button>
  );
}
