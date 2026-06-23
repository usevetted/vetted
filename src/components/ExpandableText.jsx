import { useState } from 'react';

export default function ExpandableText({ text, lines = 3, className = '' }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > 100;
  return (
    <div className={className}>
      <p className={`text-[12px] text-muted-foreground leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-[12px] font-medium text-primary mt-1 active:opacity-60"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}