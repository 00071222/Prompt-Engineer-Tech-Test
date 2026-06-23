import React from 'react';

export const Table = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-card-border bg-card/45 backdrop-blur-sm transition-all duration-300">
    <table className={`w-full min-w-[700px] border-collapse text-left text-sm ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <thead className={`border-b border-card-border bg-table-header-bg select-none ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tbody className={`divide-y divide-card-border/50 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tr className={`hover:bg-table-row-hover transition-colors duration-200 ${className}`}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`px-6 py-4.5 text-xs font-bold text-muted-foreground uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-6 py-4.5 text-foreground/80 font-medium ${className}`} {...props}>
    {children}
  </td>
);
