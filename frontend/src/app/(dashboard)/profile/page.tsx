import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Derive a friendly, professional Name from the email or use session.user.name if available
  const userEmail = session.user?.email || "";
  const nameFromEmail = userEmail.split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const userName = session.user?.name || nameFromEmail || "Usuario";

  return (
    <div className="flex flex-col items-center justify-start py-8 relative">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-md space-y-6 relative">
        <div className="border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            User Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Información de acceso y permisos del usuario logueado
          </p>
        </div>

        <div className="space-y-6">
          {/* Header Card / Avatar */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4 select-none">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-indigo-600/20">
              {userName[0]}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-base font-bold text-slate-100">{userName}</h3>
              <p className="text-xs text-slate-450 mt-0.5">{userEmail}</p>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-2">
                {session.user.rol}
              </span>
            </div>
          </div>

          {/* Form details (Read-Only) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Nombre Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  Nombre
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-sm text-slate-300 select-all font-medium">
                  {userName}
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  Email
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-sm text-slate-300 select-all font-medium">
                  {userEmail}
                </div>
              </div>

              {/* Rol Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  Rol / Perfil
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-sm text-slate-300 font-medium">
                  {session.user.rol}
                </div>
              </div>

              {/* Identificador Único Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  Identificador Único (UUID)
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs font-mono text-slate-400 select-all">
                  {session.user.id}
                </div>
              </div>
            </div>

            {/* Description/Permissions banner */}
            <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-850 text-xs text-slate-400 leading-relaxed mt-2 select-none">
              <span className="font-bold text-indigo-400 block mb-1">Permisos asignados a su rol:</span>
              {session.user.rol === "ADMIN" 
                ? "Como Administrador, usted posee control total sobre el sistema, incluyendo facturación histórica, consulta de inventario, auditoría transaccional e inicio de sesión." 
                : "Como Vendedor, sus permisos le permiten emitir facturas y consultar el catálogo de productos con control de inventario."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

