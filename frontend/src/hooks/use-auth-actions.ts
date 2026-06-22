'use client';

import { signIn, signOut } from 'next-auth/react';
import { useUIStore } from '@/store/ui-store';
import { useState } from 'react';

export function useAuthActions() {
  const [error, setError] = useState<string | null>(null);
  const showLoader = useUIStore((state) => state.showLoader);
  const hideLoader = useUIStore((state) => state.hideLoader);

  const login = async (email: string, password: string) => {
    setError(null);
    showLoader();
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      hideLoader();
    }
  };

  const logout = async () => {
    showLoader();
    try {
      await signOut({ callbackUrl: '/login' });
    } finally {
      hideLoader();
    }
  };

  return { login, logout, error };
}
