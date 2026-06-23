'use client';

import React from 'react';
import { useProductStore } from '@/store/product-store';
import { Button } from '@/components/ui/button';

export default function CreateProductButton() {
  const openCreateModal = useProductStore((state) => state.openCreateModal);

  return (
    <Button
      onClick={openCreateModal}
      className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20 active:scale-[0.98] select-none cursor-pointer"
    >
      Agregar Producto
    </Button>
  );
}
