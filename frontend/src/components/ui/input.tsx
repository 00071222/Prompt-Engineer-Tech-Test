import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl text-sm bg-input-bg border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 ${
            error
              ? 'border-rose-500/85 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-input-border hover:border-input-hover-border focus:border-indigo-500'
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-semibold text-rose-500 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
