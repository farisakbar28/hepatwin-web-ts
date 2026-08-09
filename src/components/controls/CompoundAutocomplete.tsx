import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchCompoundsAutocomplete } from '../../services/api';
import type { AppApiError, CompoundSelection } from '../../types';

interface Props {
  selectedCompound: CompoundSelection | null;
  setSelectedCompound: (compound: CompoundSelection | null) => void;
}

export function CompoundAutocomplete({ selectedCompound, setSelectedCompound }: Props) {
  const [searchTerm, setSearchTerm] = useState(selectedCompound?.compound_name || '');
  const [results, setResults] = useState<CompoundSelection[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Map<string, { timestamp: number; data: CompoundSelection[] }>>(new Map());

  useEffect(() => {
    if (!selectedCompound) return;
    setSearchTerm(selectedCompound.compound_name);
  }, [selectedCompound]);

  useEffect(() => {
    if (selectedCompound && searchTerm === selectedCompound.compound_name) {
      return;
    }

    if (debouncedSearchTerm.length < 2) {
      setResults([]);
      setErrorMsg('');
      setIsDropdownOpen(false);
      setIsFetching(false);
      return;
    }

    const cacheKey = debouncedSearchTerm.toLowerCase();
    const cached = cacheRef.current.get(cacheKey);
    const now = Date.now();
    const CACHE_TTL_MS = 3600000; // 1 hour TTL

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      setResults(cached.data);
      setErrorMsg('');
      setIsDropdownOpen(true);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      setIsFetching(true);
      setErrorMsg('');
      try {
        const data = await fetchCompoundsAutocomplete(debouncedSearchTerm, 10, { signal: controller.signal });
        const safeResults = data.results.filter((compound) => compound.is_simulatable === true);
        cacheRef.current.set(cacheKey, { timestamp: now, data: safeResults });
        setResults(safeResults);
        setIsDropdownOpen(true);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const error = err as AppApiError;
        setErrorMsg(error.message || 'Gagal mengambil data senyawa.');
        setResults([]);
        setIsDropdownOpen(true);
      } finally {
        if (!controller.signal.aborted) setIsFetching(false);
      }
    };

    void fetchResults();

    return () => controller.abort();
  }, [debouncedSearchTerm, selectedCompound, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (compound: CompoundSelection) => {
    setSelectedCompound(compound);
    setSearchTerm(compound.compound_name);
    setErrorMsg('');
    setIsDropdownOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedCompound(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      return;
    }
    if (e.key === 'Enter' && isDropdownOpen && results.length > 0) {
      e.preventDefault();
      handleSelect(results[0]);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        role="combobox"
        aria-expanded={isDropdownOpen}
        aria-autocomplete="list"
        aria-controls="compound-autocomplete-list"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0 || errorMsg || (debouncedSearchTerm.length >= 2 && !isFetching)) {
             setIsDropdownOpen(true);
          }
        }}
        placeholder="Ketik nama generik internasional obat (INN) (min 2 karakter)..."
        className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
      />
      {isFetching && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {isDropdownOpen && !isFetching && (
        <ul id="compound-autocomplete-list" role="listbox" className="absolute z-10 w-full bg-white border border-slate-200 mt-1 max-h-40 overflow-y-auto rounded-lg shadow-lg">
          {errorMsg ? (
             <li className="px-4 py-2 text-sm text-rose-500">{errorMsg}</li>
          ) : results.length > 0 ? (
            results.map(c => (
              <li
                key={c.hepatwin_id}
                role="option"
                aria-selected={selectedCompound?.hepatwin_id === c.hepatwin_id}
                onClick={() => handleSelect(c)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 flex flex-col"
              >
                <span className="font-medium">{c.compound_name}</span>
                {c.dili_concern && (
                  <span className="text-xs text-slate-500">
                    Kategori Risiko DILI: {c.dili_concern}
                  </span>
                )}
              </li>
            ))
          ) : debouncedSearchTerm.length >= 2 ? (
            <li className="px-4 py-2 text-sm text-slate-500 italic">Senyawa tidak ditemukan</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
