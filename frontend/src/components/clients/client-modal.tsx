'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useClientModalStore } from '@/store/client-modal-store';
import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ClientFormValues {
  documentoId: string;
  nombre: string;
  email: string;
  telefono: string;
}

export default function ClientModal() {
  const queryClient = useQueryClient();
  const { isOpen, initialNombre, onClientCreated, closeModal } = useClientModalStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    defaultValues: {
      documentoId: '',
      nombre: '',
      email: '',
      telefono: '',
    },
  });

  // Pre-fill name from combobox search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      reset({
        documentoId: '',
        nombre: initialNombre,
        email: '',
        telefono: '',
      });
    }
  }, [isOpen, initialNombre, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const res = await api.post('/clientes', {
        documentoId: data.documentoId,
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
      });
      return res.data;
    },
    onSuccess: (res) => {
      const nuevoCliente = res.data;
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      // Execute callback to auto-select in the combobox
      if (onClientCreated && nuevoCliente) {
        onClientCreated(nuevoCliente);
      }
      closeModal();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Error al registrar el cliente.');
    },
  });

  const onSubmit = (data: ClientFormValues) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 text-white">
        {/* Glow decorative */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none"></div>

        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Crear Nuevo Cliente
          </h2>
          <button
            onClick={closeModal}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-450 animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identificación / Documento ID */}
          <Input
            label="Identificación / Documento (RFC, RUT, DNI)"
            placeholder="e.g. 12345678-9"
            {...register('documentoId', {
              required: 'La identificación es requerida',
              minLength: { value: 5, message: 'Mínimo 5 caracteres' },
            })}
            error={errors.documentoId?.message}
          />

          {/* Nombre */}
          <Input
            label="Nombre o Razón Social"
            placeholder="e.g. Acme Corporation"
            {...register('nombre', {
              required: 'El nombre es requerido',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            })}
            error={errors.nombre?.message}
          />

          {/* Correo Electrónico */}
          <Input
            label="Correo Electrónico (Opcional)"
            type="email"
            placeholder="e.g. cliente@empresa.com"
            {...register('email', {
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Formato de correo inválido',
              },
            })}
            error={errors.email?.message}
          />

          {/* Teléfono */}
          <Input
            label="Teléfono (Opcional)"
            placeholder="e.g. +56912345678"
            {...register('telefono')}
            error={errors.telefono?.message}
          />

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
            <Button type="button" variant="secondary" onClick={closeModal} className="px-4 py-2 text-xs">
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending} className="px-5 py-2.5 text-xs">
              Registrar Cliente
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
