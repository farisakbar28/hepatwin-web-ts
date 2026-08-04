import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchCompoundsAutocomplete } from '../../services/api';
import type { CompoundSelection } from '../../types';

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
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCompound && searchTerm === selectedCompound.compound_name) {
      // Input matches the selected compound, no need to search
      return;
    }

    if (debouncedSearchTerm.length < 2) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }

    let isMounted = true;
    const fetchResults = async () => {
      setIsFetching(true);
      setErrorMsg('');
      try {
        const data = await fetchCompoundsAutocomplete(debouncedSearchTerm, 10);
        if (isMounted) {
          const safeResults = (data.results || []).filter((c: CompoundSelection) => c.is_simulatable === true);
          setResults(safeResults);
          setIsDropdownOpen(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.response?.data?.detail || 'Gagal mengambil data.');
          setResults([]);
          setIsDropdownOpen(true);
        }
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm, selectedCompound, searchTerm]);

  // Click outside to close dropdown
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
    setIsDropdownOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedCompound(null);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input 
        type="text" 
        value={searchTerm}
        onChange={handleChange}
        onFocus={() => {
          if (results.length > 0 || errorMsg || (debouncedSearchTerm.length >= 2 && !isFetching)) {
             setIsDropdownOpen(true);
          }
        }}
        placeholder="Ketik nama INN obat (min 2 karakter)..."
        className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
      />
      {isFetching && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {isDropdownOpen && !isFetching && (
        <ul className="absolute z-10 w-full bg-white border border-slate-200 mt-1 max-h-40 overflow-y-auto rounded-lg shadow-lg">
          {errorMsg ? (
             <li className="px-4 py-2 text-sm text-rose-500">{errorMsg}</li>
          ) : results.length > 0 ? (
            results.map(c => (
              <li 
                key={c.hepatwin_id}
                onClick={() => handleSelect(c)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 flex flex-col"
              >
                <span className="font-medium">{c.compound_name}</span>
                {c.dili_concern && (
                  <span className="text-xs text-slate-500">
                    DILI Concern: {c.dili_concern}
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
