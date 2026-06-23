'use client';

import React from 'react';
import { useClientModalStore } from '@/store/client-modal-store';
import { Button } from '@/components/ui/button';

export default function ClientsPageActions() {
  const openModal = useClientModalStore((state) => state.openModal);

  const handleNewClient = () => {
    openModal('', () => {});
  };

  return (
    <Button
      id="new-client-btn"
      onClick={handleNewClient}
      size="sm"
    >
      Nuevo Cliente
    </Button>
  );
}
