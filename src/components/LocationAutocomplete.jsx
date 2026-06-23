import { useState, useRef, useEffect } from 'react';
import { MapPin, X, Loader2 } from 'lucide-react';

export default function LocationAutocomplete({ value, onChange, placeholder = 'Search city or state...', error = false }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&countrycodes=us&addressdetails=1&limit=8`,
          { signal: controller.signal, headers: { 'Accept': 'application/json' } }
        );
        const data = await response.json();
        const mapped = data
          .map((item) => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || '';
            const state = addr.state || '';
            if (!city || !state) return null;
            const label = `${city}, ${state}`;
            return { value: label, label, city, stateLabel: state };
          })
          .filter(Boolean);
        const seen = new Set();
        const deduped = mapped.filter(loc => {
          if (seen.has(loc.label)) return false;
          seen.add(loc.label);
          return true;
        });
        setResults(deduped);
        setShowResults(true);
      } catch {
        // ignore aborted/failed requests
      } finally {
        setLoading(false);
      }
    }, 350);
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
          onFocus={() => { if (query.trim().length >= 2) handleSearch(query); }}
          placeholder={placeholder}
          className={`w-full h-[44px] border border-input rounded-xl pl-10 pr-10 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${error ? 'border-destructive' : ''}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {loading && <Loader2 size={14} className="text-muted-foreground/50 animate-spin mr-1" />}
          {query && !loading && (
            <button
              onClick={() => { setQuery(''); onChange(''); setResults([]); }}
              className="text-muted-foreground/50 hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
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
      {showResults && results.length === 0 && !loading && query.trim().length >= 2 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-lg px-3.5 py-3">
          <p className="text-[13px] text-muted-foreground">No matches found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}