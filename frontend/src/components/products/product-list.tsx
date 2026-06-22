'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProductStore, Product } from '@/store/product-store';
import api from '@/lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductList() {
  const openEditModal = useProductStore((state) => state.openEditModal);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const res = await api.get<{ data: Product[] }>('/productos');
      return res.data.data;
    },
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const SkeletonRow = () => (
    <TableRow className="animate-pulse">
      <TableCell><div className="h-4 bg-slate-800/80 rounded w-20"></div></TableCell>
      <TableCell><div className="h-4 bg-slate-800/80 rounded w-40"></div></TableCell>
      <TableCell><div className="h-4 bg-slate-800/80 rounded w-48"></div></TableCell>
      <TableCell><div className="h-4 bg-slate-800/80 rounded w-16"></div></TableCell>
      <TableCell><div className="h-4 bg-slate-800/80 rounded w-12"></div></TableCell>
      <TableCell><div className="h-6 bg-slate-800/80 rounded w-16"></div></TableCell>
      <TableCell><div className="h-8 bg-slate-800/80 rounded w-16"></div></TableCell>
    </TableRow>
  );

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm font-semibold text-rose-400">
        Error al cargar el listado de productos. Inténtelo de nuevo más tarde.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código SKU</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Estado</TableHead>
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
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-xs text-indigo-400 select-all font-semibold">
                {product.codigo}
              </TableCell>
              <TableCell className="text-slate-205 font-bold">
                {product.nombre}
              </TableCell>
              <TableCell className="text-slate-450 text-xs font-normal max-w-xs truncate">
                {product.descripcion || <span className="text-slate-600 italic">Sin descripción</span>}
              </TableCell>
              <TableCell className="font-semibold text-slate-100">
                {formatCurrency(product.precio)}
              </TableCell>
              <TableCell>
                <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-500 font-extrabold' : 'text-slate-300'}`}>
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={product.activo ? 'ACTIVO' : 'INACTIVO'}>
                  {product.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="secondary"
                  onClick={() => openEditModal(product)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all select-none cursor-pointer"
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-10 text-slate-500 italic select-none">
              No hay productos registrados en la base de datos.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
