'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Specialty } from '@/types';
import { Search, ChevronDown, Check, X, Filter } from 'lucide-react';

interface SearchableSpecialtyFilterProps {
  specialties: Specialty[];
  selectedSpecialtyId: string;
  onSelectSpecialty: (specialtyId: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSpecialtyFilter({
  specialties,
  selectedSpecialtyId,
  onSelectSpecialty,
  placeholder = 'All Specialties',
  className = '',
}: SearchableSpecialtyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSpecialty = specialties.find(
    (s) => s.id === selectedSpecialtyId || s.name.toLowerCase() === selectedSpecialtyId.toLowerCase()
  );

  const filteredSpecialties = specialties.filter((s) => {
    if (!query.trim()) return true;
    const lower = query.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(lower) ||
      s.category?.toLowerCase().includes(lower) ||
      s.description?.toLowerCase().includes(lower)
    );
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
          selectedSpecialtyId
            ? 'bg-teal-50 border-teal-300 text-teal-800'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate max-w-[160px] sm:max-w-[200px]">
          <Filter className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span className="truncate">{selectedSpecialty ? selectedSpecialty.name : placeholder}</span>
        </span>

        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedSpecialtyId && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSpecialty('');
              }}
              className="p-0.5 rounded-full hover:bg-teal-200/60 text-teal-800 transition"
              title="Clear specialty filter"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Floating Searchable Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 sm:w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 p-2 space-y-1 text-xs">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search specialties..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-lg text-xs text-slate-900 focus:outline-none transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Specialties List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
            {/* 'All' option */}
            <button
              type="button"
              onClick={() => {
                onSelectSpecialty('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                !selectedSpecialtyId
                  ? 'bg-teal-50 font-bold text-teal-800'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{placeholder}</span>
              {!selectedSpecialtyId && <Check className="w-3.5 h-3.5 text-teal-600" />}
            </button>

            {filteredSpecialties.map((spec) => {
              const isSelected =
                spec.id === selectedSpecialtyId ||
                spec.name.toLowerCase() === selectedSpecialtyId.toLowerCase();
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    onSelectSpecialty(spec.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-teal-50 font-bold text-teal-800'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="block truncate">{spec.name}</span>
                    {spec.category && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        {spec.category}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />}
                </button>
              );
            })}

            {filteredSpecialties.length === 0 && (
              <p className="text-center py-4 text-xs text-slate-400 italic">
                No specialties match &quot;{query}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
