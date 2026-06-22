import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Linkedin, Building2 } from 'lucide-react';

export default function SwipeCard({ card, type, onSwipe, isTop, index }) {
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);
  const superOpacity = useTransform(y, [-100, -20], [1, 0]);
  const likeScale = useTransform(x, [20, 100], [0.6, 1]);
  const passScale = useTransform(x, [-100, -20], [1, 0.6]);
  const superScale = useTransform(y, [-100, -20], [1, 0.6]);

  if (!card) return null;

  const handleDragEnd = (e, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(500);
      onSwipe('like');
    } else if (info.offset.x < -threshold) {
      setExitX(-500);
      onSwipe('pass');
    } else if (info.offset.y < -threshold) {
      setExitY(-500);
      onSwipe('super');
    }
  };

  const stampClass = "absolute top-10 px-5 py-2 rounded-2xl border-[3px] text-base font-extrabold tracking-wider uppercase";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: isTop ? 30 : 30 - index }}
      initial={{ scale: isTop ? 1 : 0.92, y: isTop ? 0 : 18, opacity: isTop ? 1 : 0.4 }}
      animate={{ scale: isTop ? 1 : 0.92, y: isTop ? 0 : 18, opacity: isTop ? 1 : 0.4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.div
        drag={isTop}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.75}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate }}
        animate={exitX !== 0
          ? { x: exitX, opacity: 0, rotate: exitX > 0 ? 30 : -30 }
          : exitY !== 0
            ? { y: exitY, opacity: 0, scale: 0.5, rotate: 0 }
            : {}}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full bg-white rounded-[24px] border border-border/40 shadow-[0_12px_50px_rgba(0,0,0,0.12)] overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity, scale: likeScale }}
              className={`${stampClass} right-8 border-primary text-primary bg-brand-green-bg/90 rotate-[-15]`}
            >
              Interested
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity, scale: passScale }}
              className={`${stampClass} left-8 border-pass text-pass bg-red-50/90 rotate-[15]`}
            >
              Pass
            </motion.div>
            <motion.div
              style={{ opacity: superOpacity, scale: superScale }}
              className={`${stampClass} left-1/2 -translate-x-1/2 border-gold text-gold bg-yellow-50/90 rotate-[-5]`}
            >
              Super
            </motion.div>
          </>
        )}

        {type === 'job' ? (
          <JobCardContent card={card} />
        ) : (
          <CandidateCardContent card={card} />
        )}
      </motion.div>
    </motion.div>
  );
}

function JobCardContent({ card }) {
  return (
    <div className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            backgroundColor: card.company_initial_bg || '#e8f0fc',
            color: card.company_initial_color || '#2a55a0'
          }}
        >
          {card.company_initial || card.company?.[0] || 'C'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground leading-tight">{card.title}</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">{card.company}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} className="text-muted-foreground/60" />
            <span className="text-[11px] text-muted-foreground">{card.location}{card.remote ? ' · Remote' : ''}</span>
          </div>
        </div>
        {card.remote && (
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-brand-green-light text-primary">
            Remote
          </span>
        )}
      </div>

      <div className="h-px bg-border/50 mb-4" />

      <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{card.description}</p>

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {card.tags.map((tag, i) => (
            <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[15px] font-semibold text-primary">{card.salary_range}</div>
          <div className="text-[10px] text-muted-foreground/70 mt-0.5">{card.company_size}</div>
        </div>
      </div>

      {card.recruiter_linkedin && (
        <a
          href={card.recruiter_linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-linkedin flex items-center justify-center flex-shrink-0">
            <Linkedin size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-foreground">{card.recruiter_name || 'Recruiter'}</div>
            <div className="text-[10px] text-muted-foreground">View on LinkedIn</div>
          </div>
        </a>
      )}
    </div>
  );
}

function CandidateCardContent({ card }) {
  const initials = card.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'C';
  return (
    <div className="p-5">
      <div className="flex items-start gap-3 mb-4">
        {card.profile_picture ? (
          <img src={card.profile_picture} alt={card.full_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-green-light flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground leading-tight">{card.full_name}</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {card.current_role || 'Open to new opportunities'}
          </p>
          {card.current_company && (
            <div className="flex items-center gap-1 mt-1">
              <Building2 size={12} className="text-muted-foreground/60" />
              <span className="text-[11px] text-muted-foreground">{card.current_company}</span>
            </div>
          )}
        </div>
        {card.open_to_work && (
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-brand-green-light text-primary">
            Open
          </span>
        )}
      </div>

      <div className="h-px bg-border/50 mb-4" />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <div className="text-[9px] text-muted-foreground/70 uppercase tracking-wide mb-1">Experience</div>
          <div className="text-[12px] font-semibold text-foreground">{card.years_experience || '—'}</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <div className="text-[9px] text-muted-foreground/70 uppercase tracking-wide mb-1">Location</div>
          <div className="text-[12px] font-semibold text-foreground">{card.location || '—'}</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-2.5 text-center">
          <div className="text-[9px] text-muted-foreground/70 uppercase tracking-wide mb-1">Target</div>
          <div className="text-[12px] font-semibold text-foreground">{card.target_salary || '—'}</div>
        </div>
      </div>

      {card.bio && (
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{card.bio}</p>
      )}

      {card.skills && card.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {card.skills.map((skill, i) => (
            <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      )}

      {card.linkedin_url && (
        <a
          href={card.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-linkedin flex items-center justify-center flex-shrink-0">
            <Linkedin size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-foreground">View full profile</div>
            <div className="text-[10px] text-muted-foreground">LinkedIn</div>
          </div>
        </a>
      )}
    </div>
  );
}