import { create } from 'zustand';

export interface Client {
  id: string;
  nombre: string;
  documentoId: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

interface ClientModalState {
  isOpen: boolean;
  initialNombre: string;
  onClientCreated: ((client: Client) => void) | null;
  openModal: (initialNombre: string, onClientCreated: (client: Client) => void) => void;
  closeModal: () => void;
}

export const useClientModalStore = create<ClientModalState>((set) => ({
  isOpen: false,
  initialNombre: '',
  onClientCreated: null,
  openModal: (initialNombre, onClientCreated) => set({ isOpen: true, initialNombre, onClientCreated }),
  closeModal: () => set({ isOpen: false, initialNombre: '', onClientCreated: null }),
}));
