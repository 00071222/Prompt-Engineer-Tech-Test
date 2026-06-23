'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthActions } from '@/hooks/use-auth-actions';
import ThemeToggle from './theme-toggle';

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuthActions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { name: 'Facturas', href: '/invoices' },
    { name: 'Clientes', href: '/clients' },
    { name: 'Productos', href: '/products' },
    { name: 'Perfil', href: '/profile' },
  ];

  return (
    <nav className="w-full bg-card/70 border-b border-card-border backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 dark:from-indigo-300 dark:to-indigo-500 bg-clip-text text-transparent tracking-tight flex items-center gap-2 select-none active:scale-98 transition-transform"
            >
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
                B
              </div>
              BillingSys
            </Link>

            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {links.map((link) => {
                const isActive =
                  pathname.startsWith(link.href) ||
                  (link.href === '/invoices' && (pathname === '/' || pathname === '/invoices'));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-semibold transition-all duration-200 px-3.5 py-2 rounded-xl relative ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-table-row-hover'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-card-border bg-card-muted/40 hover:bg-card-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all duration-200 select-none cursor-pointer active:scale-95 shadow-sm"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl border border-card-border bg-card-muted/40 hover:bg-card-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer active:scale-95"
              aria-label="Menu Principal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-card-border bg-card/95 backdrop-blur-md px-4 py-3 space-y-1.5 animate-in slide-in-from-top-4 fade-in duration-200">
          {links.map((link) => {
            const isActive =
              pathname.startsWith(link.href) ||
              (link.href === '/invoices' && (pathname === '/' || pathname === '/invoices'));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-semibold transition-all duration-200 px-4 py-2.5 rounded-xl ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-table-row-hover'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-card-border mt-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-center px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all duration-200 active:scale-[0.98] select-none cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

