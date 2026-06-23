import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import ClientList from '@/components/clients/client-list';
import ClientModal from '@/components/clients/client-modal';
import ClientsPageActions from '@/components/clients/clients-page-actions';

export const metadata = {
  title: 'Clientes | BillingSys',
  description: 'Gestión y listado de clientes registrados en el sistema.',
};

export default async function ClientsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 relative">
      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[100px] pointer-events-none transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/5 blur-[80px] pointer-events-none transition-colors duration-300" />

      {/* Header */}
      <div className="flex justify-between items-center border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Clientes
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Directorio de clientes registrados en el sistema de facturación
          </p>
        </div>

        <ClientsPageActions />
      </div>

      {/* Client Table */}
      <ClientList />

      {/* Global client creation modal */}
      <ClientModal />
    </div>
  );
}
