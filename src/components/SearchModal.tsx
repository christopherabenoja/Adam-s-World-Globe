import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CONTINENT_BY_ID, CONTINENTS, COUNTRIES } from '../data/worldData';
import type { ContinentConfig, ContinentId, CountryFeature } from '../types/globe';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onPickContinent: (continent: ContinentConfig) => void;
  onPickCountry: (country: CountryFeature) => void;
}

export function SearchModal({
  open,
  onClose,
  onPickContinent,
  onPickCountry,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        continents: CONTINENTS,
        countries: COUNTRIES.slice(0, 18),
      };
    }
    const continents = CONTINENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.sub && c.sub.toLowerCase().includes(q)),
    );
    const countries = COUNTRIES.filter((c) => {
      const n = c.properties.n.toLowerCase();
      const k = (c.properties.k || '').toLowerCase();
      return n.includes(q) || k.includes(q);
    }).slice(0, 30);

    return { continents, countries };
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center bg-[#040916]/75 px-4 pt-16 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#0d1930] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-700/80 px-3.5 py-3">
          <Search className="h-5 w-5 shrink-0 text-sky-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a country, capital, or continent..."
            className="w-full bg-transparent text-base font-medium text-white placeholder-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-2">
          {results.continents.length > 0 && (
            <div className="mb-2">
              <div className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Continents
              </div>
              {results.continents.map((cont) => (
                <button
                  key={cont.id}
                  type="button"
                  onClick={() => {
                    onPickContinent(cont);
                    setQuery('');
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-800/80 active:bg-slate-700"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: cont.color }}
                  />
                  <span className="text-xl leading-none">{cont.animals.slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">
                      {cont.name} {cont.sub ? cont.sub : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.countries.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Countries
              </div>
              {results.countries.map((ct) => {
                const firstCont = (ct.properties.c || '').split(' ')[0] as ContinentId;
                const cont = CONTINENT_BY_ID[firstCont];
                return (
                  <button
                    key={ct.id + ct.properties.n}
                    type="button"
                    onClick={() => {
                      onPickCountry(ct);
                      setQuery('');
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-800/80 active:bg-slate-700"
                  >
                    <span className="text-2xl leading-none">{ct.properties.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-white">{ct.properties.n}</div>
                      <div className="truncate text-xs text-slate-400">
                        {cont ? cont.name : 'World'}
                        {ct.properties.k ? ` · Capital: ${ct.properties.k}` : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {results.continents.length === 0 && results.countries.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No places found for &ldquo;{query}&rdquo;. Try another country or city!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
