import { create } from 'zustand';

export interface Product {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precio: string;
  stock: number;
  activo: boolean;
}

interface ProductState {
  isOpen: boolean;
  selectedProduct: Product | null;
  openCreateModal: () => void;
  openEditModal: (product: Product) => void;
  closeModal: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  isOpen: false,
  selectedProduct: null,
  openCreateModal: () => set({ isOpen: true, selectedProduct: null }),
  openEditModal: (product: Product) => set({ isOpen: true, selectedProduct: product }),
  closeModal: () => set({ isOpen: false, selectedProduct: null }),
}));
