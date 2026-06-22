import React from 'react';

export type BadgeVariant = 'BORRADOR' | 'EMITIDA' | 'PAGADA' | 'ANULADA' | 'ACTIVO' | 'INACTIVO';

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className = '' }) => {
  const styles = {
    BORRADOR: 'bg-slate-800 text-slate-400 border-slate-700/60',
    EMITIDA: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    PAGADA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ANULADA: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    ACTIVO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    INACTIVO: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
