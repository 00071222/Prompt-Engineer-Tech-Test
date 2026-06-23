'use client';

import React, { useState } from 'react';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, error: authError } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas antes de enviar
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato del correo es inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await login(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground transition-colors duration-300 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Luces de fondo decorativas premium (Glow Effects) */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>

      <div className="w-full max-w-md space-y-8 rounded-2xl border border-card-border bg-card p-8 backdrop-blur-md shadow-2xl relative transition-all duration-300">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Ingreso al Sistema
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Administración de Facturas e Inventarios
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-2 duration-200">
              {authError}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="admin@empresa.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full mt-6 py-3.5">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
