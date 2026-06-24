import { Check } from 'lucide-react';
import { SKILLS_LIST } from '@/lib/profileConstants';

export default function SkillsPicker({ selected = [], onChange, maxHeight = '200px' }) {
  const toggle = (skill) => {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else {
      onChange([...selected, skill]);
    }
  };

  return (
    <div className="overflow-y-auto no-scrollbar" style={{ maxHeight }}>
      <div className="flex flex-wrap gap-2">
        {SKILLS_LIST.map((skill) => {
          const isSelected = selected.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              className={`inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                isSelected
                  ? 'bg-brand-green-light text-primary border-primary/30'
                  : 'bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/20 hover:text-foreground'
              }`}
            >
              {isSelected && <Check size={12} className="text-primary" />}
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
}