'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export interface Invoice {
  id: string;
  numeroFactura: string | null;
  fechaEmision: string | null;
  estado: 'BORRADOR' | 'EMITIDA' | 'PAGADA' | 'ANULADA';
  subtotal: string;
  totalImpuestos: string;
  total: string;
  cliente: {
    nombre: string;
    documentoId: string;
  };
}

export default function InvoiceList() {
  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get<{ data: Invoice[] }>('/facturas');
      return res.data.data;
    },
  });

  const formatCurrency = (value: string) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 1. Vista de Carga (Skeletons con animate-pulse)
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="animate-pulse">
                <TableCell>
                  <div className="h-4 w-20 rounded bg-card-muted"></div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 w-36 rounded bg-card-muted"></div>
                    <div className="h-3 w-24 rounded bg-card-muted/60"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-28 rounded bg-card-muted"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 rounded-full bg-card-muted"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-20 rounded bg-card-muted"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-8 w-16 rounded bg-card-muted/40"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // 2. Vista de Error
  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm font-semibold text-rose-600 dark:text-rose-400">
        Ocurrió un error al cargar el listado de facturas.
      </div>
    );
  }

  // 3. Tabla Vacía
  if (!invoices || invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-card-border bg-card/30 p-12 text-center text-muted-foreground">
        <svg className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-bold">No se encontraron facturas registradas</p>
        <p className="text-xs text-muted-foreground/80 mt-1">Crea una nueva factura para comenzar</p>
      </div>
    );
  }

  // 4. Tabla de Datos
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nº Factura</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha Emisión</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 tracking-wider font-bold select-all animate-in fade-in duration-200">
              {invoice.numeroFactura || (
                <span className="text-muted-foreground/60 italic">Borrador</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{invoice.cliente.nombre}</span>
                <span className="text-xs text-muted-foreground font-semibold mt-0.5">{invoice.cliente.documentoId}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground font-medium">
              {formatDate(invoice.fechaEmision)}
            </TableCell>
            <TableCell>
              <Badge variant={invoice.estado}>{invoice.estado}</Badge>
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-foreground">
              {formatCurrency(invoice.total)}
            </TableCell>
            <TableCell className="text-right">
              {invoice.estado === 'BORRADOR' ? (
                <Link
                  href={`/invoices/${invoice.id}/edit`}
                  className="inline-flex px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all select-none cursor-pointer duration-200 active:scale-95"
                >
                  Editar
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground/50 select-none">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
