import React from 'react';
import Link from 'next/link';

interface TableButtonBaseProps {
  children: React.ReactNode;
  variant?: 'edit' | 'delete' | 'indigo' | 'rose';
  className?: string;
}

type TableButtonProps<T extends 'button' | typeof Link> = TableButtonBaseProps & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof TableButtonBaseProps | 'as'>;

export function TableButton<T extends 'button' | typeof Link = 'button'>({
  as,
  variant = 'edit',
  className = '',
  children,
  ...props
}: TableButtonProps<T>) {
  const Component = (as || 'button') as React.ElementType;

  const variantStyles = {
    edit: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-600 hover:text-white hover:border-indigo-600',
    delete: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-rose-600',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-600 hover:text-white hover:border-indigo-600',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-rose-600',
  };

  const baseStyles = 'inline-flex items-center justify-center font-bold border transition-all duration-200 px-3.5 py-1.5 text-xs rounded-xl select-none cursor-pointer active:scale-95';

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
