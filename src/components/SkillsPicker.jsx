import { Check } from 'lucide-react';
import { SKILLS_LIST } from '@/lib/profileConstants';

const MAX_SKILLS = 5;

export default function SkillsPicker({ selected = [], onChange, maxHeight = '200px' }) {
  const toggle = (skill) => {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else if (selected.length < MAX_SKILLS) {
      onChange([...selected, skill]);
    }
  };

  const atCap = selected.length >= MAX_SKILLS;

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-muted-foreground">
          {selected.length}/{MAX_SKILLS} selected
        </span>
      </div>
      <div className="overflow-y-auto no-scrollbar" style={{ maxHeight }}>
        <div className="flex flex-wrap gap-2">
          {SKILLS_LIST.map((skill) => {
            const isSelected = selected.includes(skill);
            const disabled = !isSelected && atCap;
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggle(skill)}
                className={`inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  isSelected
                    ? 'bg-brand-green-light text-primary border-primary/30'
                    : disabled
                    ? 'bg-muted/20 text-muted-foreground/30 border-border/40 cursor-not-allowed'
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
    </>
  );
}