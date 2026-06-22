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
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col justify-start items-center text-white relative">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl space-y-6 relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <Link
              href="/"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 mb-2 transition-colors font-semibold"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Panel
            </Link>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Invoices Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Listado histórico y estados del inventario comercial
            </p>
          </div>

          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20 active:scale-[0.98] select-none cursor-pointer"
          >
            Create Invoice
          </Link>
        </div>

        <InvoiceList />
      </div>
    </div>
  );
}
