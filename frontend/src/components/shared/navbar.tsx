'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthActions } from '@/hooks/use-auth-actions';

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuthActions();

  const links = [
    { name: 'Facturas', href: '/invoices' },
    { name: 'Clientes', href: '/clients' },
    { name: 'Productos', href: '/products' },
    { name: 'Perfil', href: '/profile' },
  ];


  return (
    <nav className="w-full bg-slate-900/40 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-indigo-350 bg-clip-text text-transparent tracking-tight flex items-center gap-2 select-none">
              <div className="h-6 w-6 rounded bg-indigo-650 flex items-center justify-center text-white font-black text-xs">
                B
              </div>
              BillingSys
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href) || (link.href === '/invoices' && (pathname === '/' || pathname === '/invoices'));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-indigo-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-xs font-semibold text-slate-400 hover:text-slate-250 transition-colors select-none cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
