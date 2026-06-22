import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import LogoutButton from "@/components/shared/logout-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Panel de Control
            </h1>
            <p className="text-xs text-slate-400 mt-1">Facturación e Inventario Activo</p>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Usuario Autenticado</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <span className="font-medium text-slate-500">ID del Usuario:</span>
              <span>{session.user.id}</span>
              
              <span className="font-medium text-slate-500">Correo Electrónico:</span>
              <span>{session.user.email}</span>
              
              <span className="font-medium text-slate-500">Rol asignado:</span>
              <span className="inline-flex max-w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {session.user.rol}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">JWT de Express (Sesión Segura)</h2>
            <div className="overflow-x-auto">
              <pre className="text-xs text-indigo-300 font-mono bg-black/40 p-3 rounded-lg border border-slate-900 overflow-x-auto whitespace-pre-wrap break-all">
                {session.user.token}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
