import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import InvoiceList from "@/components/invoices/invoice-list";
import Link from "next/link";

export default async function InvoicesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 relative">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>

      <div className="flex justify-between items-center border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Listado histórico y estados del inventario comercial
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20 active:scale-[0.98] select-none cursor-pointer"
        >
          Crear Factura
        </Link>
      </div>

      <InvoiceList />
    </div>
  );
}
