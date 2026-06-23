'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProductStore, Product } from '@/store/product-store';
import api from '@/lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableButton } from '@/components/ui/table-button';

const SkeletonRow = () => (
  <TableRow className="animate-pulse">
    <TableCell><div className="h-4 bg-card-muted rounded w-20"></div></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-40"></div></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-48"></div></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-16"></div></TableCell>
    <TableCell><div className="h-4 bg-card-muted rounded w-12"></div></TableCell>
    <TableCell><div className="h-6 bg-card-muted rounded w-16"></div></TableCell>
    <TableCell><div className="h-8 bg-card-muted/80 rounded w-16"></div></TableCell>
  </TableRow>
);

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
              <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 select-all font-bold animate-in fade-in duration-200">
                {product.codigo}
              </TableCell>
              <TableCell className="text-foreground font-bold">
                {product.nombre}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs font-normal max-w-xs truncate">
                {product.descripcion || <span className="text-muted-foreground/60 italic">Sin descripción</span>}
              </TableCell>
              <TableCell className="font-bold text-foreground">
                {formatCurrency(product.precio)}
              </TableCell>
              <TableCell>
                <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-500 font-extrabold' : 'text-foreground/80'}`}>
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={product.activo ? 'ACTIVO' : 'INACTIVO'}>
                  {product.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <TableButton
                  onClick={() => openEditModal(product)}
                  variant="edit"
                >
                  Editar
                </TableButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground italic select-none">
              No hay productos registrados en la base de datos.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
