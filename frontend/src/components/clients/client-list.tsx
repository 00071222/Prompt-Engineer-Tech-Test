'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Client } from '@/store/client-modal-store';

/* ───────────────────── Types ───────────────────── */
interface ClientFormValues {
  documentoId: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

/* ───────────────────── EditModal ───────────────────── */
function EditClientModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    defaultValues: {
      documentoId: client.documentoId,
      nombre: client.nombre,
      email: client.email ?? '',
      telefono: client.telefono ?? '',
      direccion: client.direccion ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const res = await api.put(`/clientes/${client.id}`, {
        documentoId: data.documentoId,
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Error al actualizar el cliente.');
    },
  });

  const onSubmit = (data: ClientFormValues) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 text-foreground">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />

        <div className="flex justify-between items-center border-b border-card-border pb-4 mb-5">
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Editar Cliente
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-card-muted cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Identificación / Documento"
            placeholder="e.g. 12345678-9"
            {...register('documentoId', {
              required: 'La identificación es requerida',
              minLength: { value: 5, message: 'Mínimo 5 caracteres' },
            })}
            error={errors.documentoId?.message}
          />
          <Input
            label="Nombre o Razón Social"
            placeholder="e.g. Acme Corporation"
            {...register('nombre', {
              required: 'El nombre es requerido',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            })}
            error={errors.nombre?.message}
          />
          <Input
            label="Correo Electrónico (Opcional)"
            type="email"
            placeholder="e.g. cliente@empresa.com"
            {...register('email', {
              pattern: { value: /\S+@\S+\.\S+/, message: 'Formato de correo inválido' },
            })}
            error={errors.email?.message}
          />
          <Input
            label="Teléfono (Opcional)"
            placeholder="e.g. +56912345678"
            {...register('telefono')}
            error={errors.telefono?.message}
          />
          <Input
            label="Dirección (Opcional)"
            placeholder="e.g. Av. Principal 123"
            {...register('direccion')}
            error={errors.direccion?.message}
          />

          <div className="flex justify-end gap-3 border-t border-card-border pt-4 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} className="px-4 py-2 text-xs">
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending} className="px-5 py-2.5 text-xs">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────────────────── DeleteConfirm ───────────────────── */
function DeleteConfirmModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/clientes/${client.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || 'Error al eliminar el cliente.');
    },
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card border border-rose-500/30 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 text-foreground">
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-rose-500/10 blur-[50px] pointer-events-none" />

        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/30">
            <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Eliminar Cliente</h2>
            <p className="text-xs text-muted-foreground mt-1">
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-bold text-foreground">{client.nombre}</span>?
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">Esta acción no se puede deshacer.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2 text-xs">
            Cancelar
          </Button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {mutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const SkeletonRow = () => (
  <TableRow className="animate-pulse">
    <TableCell><div className="h-4 bg-card-muted rounded w-28" /></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-40" /></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-36" /></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-24" /></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-32" /></TableCell>
    <TableCell className="text-right"><div className="ml-auto h-8 bg-card-muted/80 rounded w-24" /></TableCell>
  </TableRow>
);

/* ───────────────────── ClientList ───────────────────── */
export default function ClientList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['clientes', debouncedSearch],
    queryFn: async () => {
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const res = await api.get<{ data: Client[] }>('/clientes', { params });
      return res.data.data;
    },
  });

  

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm font-semibold text-rose-400">
        Ocurrió un error al cargar el listado de clientes.
      </div>
    );
  }

  return (
    <>
      {/* Search bar */}
      <div className="relative w-full max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="client-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o documento..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-input-bg border border-input-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : clients && clients.length > 0 ? (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold tracking-wider select-all animate-in fade-in duration-200">
                  {client.documentoId}
                </TableCell>
                <TableCell className="font-bold text-foreground">
                  {client.nombre}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {client.email ? (
                    <a
                      href={`mailto:${client.email}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {client.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/60 italic">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {client.telefono || <span className="text-muted-foreground/60 italic">—</span>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                  {client.direccion || <span className="text-muted-foreground/60 italic">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setEditingClient(client)}
                      className="px-3.5 py-1.5 text-xs font-bold"
                    >
                      Editar
                    </Button>
                    <button
                      onClick={() => setDeletingClient(client)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all select-none cursor-pointer duration-200 active:scale-95"
                    >
                      Eliminar
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-14 text-muted-foreground">
                <svg className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm font-bold">
                  {debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : 'No hay clientes registrados'}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {debouncedSearch ? 'Intenta con otro término de búsqueda' : 'Registra tu primer cliente para comenzar'}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modals */}
      {editingClient && (
        <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} />
      )}
      {deletingClient && (
        <DeleteConfirmModal client={deletingClient} onClose={() => setDeletingClient(null)} />
      )}
    </>
  );
}
