'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProductStore, Product } from '@/store/product-store';
import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductFormValues {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  activo: boolean;
}

export default function ProductModal() {
  const queryClient = useQueryClient();
  const { isOpen, selectedProduct, closeModal } = useProductStore();

  const isEditMode = !!selectedProduct;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: '0.00',
      stock: '0',
      activo: true,
    },
  });

  // Reset form when modal opens or selectedProduct changes
  useEffect(() => {
    if (isOpen) {
      if (selectedProduct) {
        reset({
          codigo: selectedProduct.codigo,
          nombre: selectedProduct.nombre,
          descripcion: selectedProduct.descripcion || '',
          precio: parseFloat(selectedProduct.precio).toFixed(2),
          stock: String(selectedProduct.stock),
          activo: selectedProduct.activo,
        });
      } else {
        reset({
          codigo: '',
          nombre: '',
          descripcion: '',
          precio: '0.00',
          stock: '0',
          activo: true,
        });
      }
    }
  }, [isOpen, selectedProduct, reset]);

  // Mutation for creating or updating a product
  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const payload = {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: parseFloat(data.precio),
        stock: parseInt(data.stock, 10),
        activo: data.activo,
      };

      if (isEditMode && selectedProduct?.id) {
        const res = await api.put(`/productos/${selectedProduct.id}`, payload);
        return res.data;
      } else {
        const res = await api.post('/productos', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      closeModal();
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Error al guardar el producto.');
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 text-white">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none"></div>

        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
          <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            {isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Código SKU */}
            <div className="sm:col-span-1">
              <Input
                label="Código SKU"
                placeholder="PROD-001"
                {...register('codigo', {
                  required: 'El código es requerido',
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message: 'Solo letras, números, guiones y guiones bajos',
                  },
                })}
                error={errors.codigo?.message}
                disabled={isEditMode} // Usually SKU codes shouldn't change
              />
            </div>

            {/* Nombre */}
            <div className="sm:col-span-1">
              <Input
                label="Nombre del Producto"
                placeholder="Tornillo 1/2 pulgada"
                {...register('nombre', {
                  required: 'El nombre es requerido',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                })}
                error={errors.nombre?.message}
              />
            </div>

            {/* Precio */}
            <div>
              <Input
                label="Precio de Venta ($)"
                type="number"
                step="0.01"
                min="0"
                placeholder="10.99"
                {...register('precio', {
                  required: 'El precio es requerido',
                  validate: (v) => parseFloat(v) >= 0 || 'El precio no puede ser negativo',
                })}
                error={errors.precio?.message}
              />
            </div>

            {/* Stock */}
            <div>
              <Input
                label="Stock Inicial"
                type="number"
                min="0"
                step="1"
                placeholder="100"
                {...register('stock', {
                  required: 'El stock es requerido',
                  validate: (v) => parseInt(v, 10) >= 0 || 'El stock no puede ser negativo',
                })}
                error={errors.stock?.message}
              />
            </div>

            {/* Descripción */}
            <div className="sm:col-span-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  Descripción
                </label>
                <textarea
                  placeholder="Detalles adicionales del producto (opcional)"
                  {...register('descripcion')}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Activo (Toggle / Checkbox) */}
            <div className="sm:col-span-2 flex items-center gap-2.5 py-1 select-none">
              <input
                id="activo"
                type="checkbox"
                {...register('activo')}
                className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950 text-indigo-650 focus:ring-indigo-500/20 focus:ring-offset-slate-900 focus:outline-none transition-colors accent-indigo-600"
              />
              <label htmlFor="activo" className="text-xs font-bold text-slate-350 cursor-pointer">
                Producto Activo (Disponible para la venta)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
            <Button type="button" variant="secondary" onClick={closeModal} className="px-4 py-2 text-xs">
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending} className="px-5 py-2.5 text-xs">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
