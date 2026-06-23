'use client';

import React from 'react';
import { useProductStore } from '@/store/product-store';
import { Button } from '@/components/ui/button';

export default function CreateProductButton() {
  const openCreateModal = useProductStore((state) => state.openCreateModal);

  return (
    <Button
      onClick={openCreateModal}
      size="sm"
    >
      Agregar Producto
    </Button>
  );
}
