'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { useClientModalStore, Client } from '@/store/client-modal-store';
import api from '@/lib/axios';

interface AsyncComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function AsyncCombobox({ value, onChange, error }: AsyncComboboxProps) {
  const openModal = useClientModalStore((state) => state.openModal);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch clients based on search query
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ['clientes', debouncedSearchTerm],
    queryFn: async () => {
      const res = await api.get<{ data: Client[] }>(`/clientes?search=${encodeURIComponent(debouncedSearchTerm)}`);
      return res.data.data;
    },
    enabled: isDropdownOpen,
  });

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update selected client if we can find it in the current data
  useEffect(() => {
    if (value && clients) {
      const match = clients.find((c) => c.id === value);
      if (match) {
        setSelectedClient(match);
      }
    } else if (!value) {
      setSelectedClient(null);
    }
  }, [value, clients]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    onChange(client.id);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    onChange('');
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    openModal(searchTerm, (newClient: Client) => {
      setSelectedClient(newClient);
      onChange(newClient.id);
    });
    setIsDropdownOpen(false);
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1.5 relative">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
        Cliente Receptor
      </label>

      {selectedClient ? (
        // Mode 1: Selected Client Display
        <div className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm bg-slate-900/60 border border-indigo-500/50 text-slate-100 placeholder-slate-500">
          <div className="flex flex-col text-left">
            <span className="font-bold text-indigo-400">{selectedClient.nombre}</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">ID Doc: {selectedClient.documentoId}</span>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Cambiar
          </button>
        </div>
      ) : (
        // Mode 2: Search Input
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar cliente por nombre o documento..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-950 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-800 hover:border-slate-700/80 focus:border-indigo-500'
            }`}
          />

          {error && (
            <span className="text-xs font-semibold text-rose-500 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150 block">
              {error}
            </span>
          )}

          {/* Search Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col divide-y divide-slate-800 max-h-64 overflow-y-auto">
              <div className="p-2 max-h-48 overflow-y-auto space-y-1">
                {isLoading ? (
                  <div className="flex justify-center items-center py-4 text-xs text-slate-400 gap-2 select-none">
                    <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Buscando coincidencias...</span>
                  </div>
                ) : clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-bold text-slate-200">{client.nombre}</span>
                      <span className="font-mono text-slate-500 text-[10px]">Doc: {client.documentoId}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500 italic select-none">
                    No se encontraron clientes registrados
                  </div>
                )}
              </div>

              {/* Bottom Quick Creation Option */}
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full px-4 py-3 bg-slate-950 hover:bg-indigo-650 hover:text-white transition-all text-xs font-bold text-indigo-400 text-left flex items-center gap-1.5 select-none cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {searchTerm.trim() ? (
                  <span>Crear nuevo cliente: <span className="underline italic">"{searchTerm}"</span></span>
                ) : (
                  <span>+ Registrar nuevo cliente</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
