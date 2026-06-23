import { useRef, useEffect, useCallback } from 'react';

export default function ScrollPicker({ items, value, onChange, height = 200, itemHeight = 40 }) {
  const listRef = useRef(null);
  const scrollTimeout = useRef(null);
  const flagTimer = useRef(null);
  const isProgrammaticScroll = useRef(false);

  const scrollToValue = useCallback((val, smooth = false) => {
    const index = items.findIndex(item => item.value === val);
    if (index < 0 || !listRef.current) return;
    const targetScroll = index * itemHeight;
    isProgrammaticScroll.current = true;
    listRef.current.scrollTo({
      top: targetScroll,
      behavior: smooth ? 'smooth' : 'auto',
    });
    clearTimeout(flagTimer.current);
    flagTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, smooth ? 350 : 80);
  }, [items, itemHeight]);

  useEffect(() => {
    scrollToValue(value);
  }, []); // eslint-disable-line

  useEffect(() => {
    scrollToValue(value);
  }, [items]); // eslint-disable-line

  useEffect(() => {
    return () => {
      clearTimeout(scrollTimeout.current);
      clearTimeout(flagTimer.current);
    };
  }, []);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!listRef.current) return;
      const index = Math.round(listRef.current.scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      const targetScroll = clampedIndex * itemHeight;
      const selectedItem = items[clampedIndex];

      if (selectedItem && selectedItem.value !== value) {
        onChange(selectedItem.value);
      }
      if (Math.abs(listRef.current.scrollTop - targetScroll) > 1) {
        isProgrammaticScroll.current = true;
        listRef.current.scrollTo({ top: targetScroll, behavior: 'auto' });
        clearTimeout(flagTimer.current);
        flagTimer.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 80);
      }
    }, 150);
  };

  const padCount = Math.max(0, Math.floor((height / itemHeight - 1) / 2));

  return (
    <div className="relative" style={{ height }}>
      <div
        className="absolute left-3 right-3 border-y border-primary/15 bg-primary/[0.03] pointer-events-none z-20 rounded-xl"
        style={{ top: '50%', height: itemHeight, transform: 'translateY(-50%)' }}
      />
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none bg-gradient-to-b from-white to-transparent" style={{ height: height * 0.35 }} />
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none bg-gradient-to-t from-white to-transparent" style={{ height: height * 0.35 }} />
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {Array.from({ length: padCount }).map((_, i) => (
          <div key={`pad-t-${i}`} style={{ height: itemHeight }} />
        ))}
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{ height: itemHeight }}
          >
            <span className={`text-[15px] transition-colors duration-150 ${item.value === value ? 'font-semibold text-foreground' : 'text-muted-foreground/40'}`}>
              {item.label}
            </span>
          </div>
        ))}
        {Array.from({ length: padCount }).map((_, i) => (
          <div key={`pad-b-${i}`} style={{ height: itemHeight }} />
        ))}
      </div>
    </div>
  );
}