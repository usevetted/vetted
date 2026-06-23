import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { usStates } from '@/lib/usLocationData';

const allLocations = usStates.flatMap(state =>
  state.cities.map(city => ({
    value: `${city}, ${state.value}`,
    label: `${city}, ${state.label}`,
    city,
    stateLabel: state.label,
  }))
);

export default function LocationAutocomplete({ value, onChange, placeholder = 'Search city or state...', error = false }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
        if (value) setQuery(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim().length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const q = text.toLowerCase();
    const matches = allLocations
      .filter(loc =>
        loc.city.toLowerCase().includes(q) ||
        loc.stateLabel.toLowerCase().includes(q)
      )
      .slice(0, 8);
    setResults(matches);
    setShowResults(true);
  };

  const handleSelect = (loc) => {
    setQuery(loc.label);
    onChange(loc.value);
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (query.trim().length >= 1) handleSearch(query); }}
          placeholder={placeholder}
          className={`w-full h-[44px] border border-input rounded-xl pl-10 pr-10 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${error ? 'border-destructive' : ''}`}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); onChange(''); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {showResults && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-[240px] overflow-y-auto no-scrollbar">
          {results.map((loc, i) => (
            <button
              key={i}
              onClick={() => handleSelect(loc)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-muted/50 transition-colors text-left"
            >
              <MapPin size={14} className="text-muted-foreground/50 flex-shrink-0" />
              <div>
                <span className="text-[13px] text-foreground">{loc.city}</span>
                <span className="text-[12px] text-muted-foreground">, {loc.stateLabel}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {showResults && results.length === 0 && query.trim().length >= 1 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-lg px-3.5 py-3">
          <p className="text-[13px] text-muted-foreground">No matches found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}