import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md';
  isLoading?: boolean;
}

export const buttonStyles = (
  variant: 'primary' | 'secondary' | 'destructive' = 'primary',
  size: 'sm' | 'md' = 'md'
) => {
  const base = 'inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-600/10 active:scale-[0.98]',
    secondary: 'bg-card hover:bg-card-muted active:bg-card-muted/80 text-foreground border border-card-border focus:ring-indigo-500 active:scale-[0.98]',
    destructive: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white focus:ring-rose-500 shadow-lg shadow-rose-600/10 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-xs font-bold gap-2',
    md: 'px-5 py-3 text-sm font-semibold gap-2.5',
  };

  return `${base} ${variants[variant]} ${sizes[size]}`;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={`${buttonStyles(variant, size)} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
