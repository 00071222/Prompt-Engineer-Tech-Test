import { create } from 'zustand';

interface UIState {
  isGlobalLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGlobalLoading: false,
  showLoader: () => set({ isGlobalLoading: true }),
  hideLoader: () => set({ isGlobalLoading: false }),
}));
