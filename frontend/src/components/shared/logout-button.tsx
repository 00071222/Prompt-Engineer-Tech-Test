'use client';

import React from 'react';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Button } from '../ui/button';

export default function LogoutButton() {
  const { logout } = useAuthActions();

  return (
    <Button variant="secondary" className="px-4 py-2 text-xs font-bold" onClick={logout}>
      Cerrar Sesión
    </Button>
  );
}
