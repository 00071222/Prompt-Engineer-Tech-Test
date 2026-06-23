import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import FacturaForm from "@/components/facturas/factura-form";
import Link from "next/link";

interface Params {
  id: string;
}

export default async function EditFacturaPage({ params }: { params: Promise<Params> }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>

      {/* Encabezado */}
      <div className="flex justify-between items-center border-b border-card-border pb-5">
        <div>
          <Link
            href="/"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1.5 mb-2 transition-colors font-bold"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel
          </Link>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Editar Borrador de Factura
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Modifica los detalles del borrador o confírmalo para emitirlo y actualizar stock
          </p>
        </div>
      </div>

      {/* Formulario */}
      <FacturaForm invoiceId={id} />
    </div>
  );
}
