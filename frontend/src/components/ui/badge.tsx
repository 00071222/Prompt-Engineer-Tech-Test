import React from 'react';

export type BadgeVariant =
  | 'BORRADOR'
  | 'EMITIDA'
  | 'PAGADA'
  | 'ANULADA'
  | 'ACTIVO'
  | 'INACTIVO'
  | 'slate'
  | 'indigo'
  | 'emerald'
  | 'rose'
  | 'amber';

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className = '' }) => {
  const colorMap: Record<BadgeVariant, string> = {
    BORRADOR: 'slate',
    EMITIDA: 'indigo',
    PAGADA: 'emerald',
    ANULADA: 'rose',
    ACTIVO: 'emerald',
    INACTIVO: 'rose',
    slate: 'slate',
    indigo: 'indigo',
    emerald: 'emerald',
    rose: 'rose',
    amber: 'amber',
  };

  const color = colorMap[variant];

  const colorStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    slate: 'bg-card-muted text-muted-foreground border-card-border',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  const matchedStyles = colorStyles[color as keyof typeof colorStyles] || colorStyles.slate;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${matchedStyles} ${className}`}>
      {children}
    </span>
  );
};
