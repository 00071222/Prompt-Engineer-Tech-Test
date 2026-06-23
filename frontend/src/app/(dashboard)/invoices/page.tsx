import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import InvoiceList from "@/components/invoices/invoice-list";
import { buttonStyles } from "@/components/ui/button";
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
          className={buttonStyles("primary", "sm")}
        >
          Crear Factura
        </Link>
      </div>

      <InvoiceList />
    </div>
  );
}
