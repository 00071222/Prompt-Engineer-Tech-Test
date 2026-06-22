'use client';

import React, { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FacturaItemInput {
  productoId: string;
  cantidad: number;
  porcentajeImpuesto: number;
}

interface FacturaFormValues {
  clienteId: string;
  detalles: FacturaItemInput[];
}

interface Cliente {
  id: string;
  nombre: string;
  documentoId: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio: string;
  stock: number;
}

export default function FacturaForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const showLoader = useUIStore((state) => state.showLoader);
  const hideLoader = useUIStore((state) => state.hideLoader);

  // Queries para traer los catálogos activos
  const { data: clientesResponse, isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const res = await api.get<{ data: Cliente[] }>('/clientes');
      return res.data.data;
    },
  });

  const { data: productosResponse, isLoading: loadingProductos } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const res = await api.get<{ data: Producto[] }>('/productos');
      return res.data.data;
    },
  });

  // Mapear productos por ID para búsquedas rápidas en la previsualización
  const productosMap = useMemo(() => {
    const map = new Map<string, Producto>();
    productosResponse?.forEach((p) => map.set(p.id, p));
    return map;
  }, [productosResponse]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FacturaFormValues>({
    defaultValues: {
      clienteId: '',
      detalles: [{ productoId: '', cantidad: 1, porcentajeImpuesto: 16.00 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detalles',
  });

  // Mutation para enviar y crear la factura
  const mutation = useMutation({
    mutationFn: async (data: FacturaFormValues) => {
      const res = await api.post('/facturas', {
        clienteId: data.clienteId,
        detalles: data.detalles.map((d) => ({
          productoId: d.productoId,
          cantidad: Number(d.cantidad),
          porcentajeImpuesto: Number(d.porcentajeImpuesto),
        })),
      });
      return res.data;
    },
    onSuccess: () => {
      alert('¡Factura emitida exitosamente!');
      reset();
      router.push('/');
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error || 'Error al emitir la factura.';
      setFormError(errorMsg);
    },
    onSettled: () => {
      hideLoader();
    },
  });

  const onSubmit = (data: FacturaFormValues) => {
    setFormError(null);
    showLoader();
    mutation.mutate(data);
  };

  const watchDetalles = watch('detalles');

  // Calcular total estimado de la factura en el lado del cliente (con fines visuales)
  const subtotalPredictivo = useMemo(() => {
    return watchDetalles.reduce((acc, current) => {
      const prod = productosMap.get(current.productoId);
      if (!prod) return acc;
      const precio = parseFloat(prod.precio) || 0;
      const cant = Number(current.cantidad) || 0;
      return acc + (precio * cant);
    }, 0);
  }, [watchDetalles, productosMap]);

  if (loadingClientes || loadingProductos) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <span className="ml-3 text-sm text-slate-400">Cargando catálogos de venta...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-slate-100">
      {formError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-rose-450 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {/* Selector de Cliente */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
            Cliente Receptor
          </label>
          <select
            {...register('clienteId', { required: 'Seleccione un cliente' })}
            className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-950 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 ${
              errors.clienteId ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
            }`}
          >
            <option value="">-- Seleccionar Cliente --</option>
            {clientesResponse?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.documentoId})
              </option>
            ))}
          </select>
          {errors.clienteId && (
            <span className="text-xs font-semibold text-rose-500 mt-0.5">
              {errors.clienteId.message}
            </span>
          )}
        </div>
      </div>

      {/* Listado de Ítems */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Detalles de la Venta</h3>
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs font-bold"
            onClick={() => append({ productoId: '', cantidad: 1, porcentajeImpuesto: 16.00 })}
          >
            + Agregar Línea
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const currentItem = watchDetalles[index];
            const currentProd = currentItem ? productosMap.get(currentItem.productoId) : undefined;
            const precioUnitario = currentProd ? parseFloat(currentProd.precio) : 0;
            const itemSubtotal = precioUnitario * (Number(currentItem?.cantidad) || 0);

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border border-slate-800/60 bg-slate-950/40 p-4 rounded-xl relative animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Selector de Producto */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                    Producto #{index + 1}
                  </label>
                  <select
                    {...register(`detalles.${index}.productoId` as const, { required: 'Requerido' })}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 focus:border-indigo-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {productosResponse?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div className="md:col-span-2">
                  <Input
                    label="Cant"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register(`detalles.${index}.cantidad` as const, {
                      required: 'Requerido',
                      min: { value: 1, message: 'Mínimo 1' },
                    })}
                  />
                </div>

                {/* Porcentaje Impuesto */}
                <div className="md:col-span-2">
                  <Input
                    label="Impuesto (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="16.00"
                    {...register(`detalles.${index}.porcentajeImpuesto` as const, {
                      required: 'Requerido',
                      min: { value: 0, message: 'Mínimo 0' },
                    })}
                  />
                </div>

                {/* Vista Previa Predictiva */}
                <div className="md:col-span-3 flex flex-col justify-end p-2 bg-slate-900/60 rounded-xl border border-slate-800 h-[46px]">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Previsualización</span>
                  <span className="text-sm font-semibold text-slate-300 mt-1 leading-none">
                    {currentItem?.productoId ? (
                      `$${precioUnitario.toFixed(2)} c/u → $${itemSubtotal.toFixed(2)}`
                    ) : (
                      '—'
                    )}
                  </span>
                </div>

                {/* Eliminar fila */}
                <div className="md:col-span-1 flex justify-center md:justify-end">
                  <button
                    type="button"
                    disabled={fields.length === 1}
                    className="p-3 text-slate-500 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    onClick={() => remove(index)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer del Formulario */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
        {/* El Cisne Negro Visual */}
        <div className="flex flex-col text-left max-w-md">
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">
            Subtotal Estimado: ${subtotalPredictivo.toFixed(2)}
          </span>
          <p className="text-[9px] text-slate-500 italic mt-1.5 leading-relaxed">
            * Esta UI es solo predictiva; la fuente de la verdad de los precios, impuestos y la inmutabilidad financiera reside estrictamente en el backend.
          </p>
        </div>

        <Button
          type="submit"
          isLoading={mutation.isPending}
          className="w-full md:w-auto px-8 py-3.5"
        >
          Crear Factura
        </Button>
      </div>
    </form>
  );
}
