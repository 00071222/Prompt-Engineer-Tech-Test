import React from 'react';

export const Table = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/10">
    <table className={`w-full min-w-[700px] border-collapse text-left text-sm ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <thead className={`border-b border-slate-800 bg-slate-950/40 select-none ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tbody className={`divide-y divide-slate-800/50 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tr className={`hover:bg-slate-900/20 transition-colors ${className}`}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-6 py-4.5 text-slate-300 font-medium ${className}`}>
    {children}
  </td>
);
