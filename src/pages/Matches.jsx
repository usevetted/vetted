import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Linkedin } from 'lucide-react';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';

export default function Matches() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      try {
        const m1 = await base44.entities.Match.filter({ profile1_id: profile.id, status: 'active' });
        const m2 = await base44.entities.Match.filter({ profile2_id: profile.id, status: 'active' });
        const all = [...m1, ...m2].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setMatches(all);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile]);

  const getMatchDisplay = (match) => {
    const isProfile1 = match.profile1_id === profile.id;
    const otherName = isProfile1 ? match.profile2_name : match.profile1_name;
    const otherPicture = isProfile1 ? match.profile2_picture : match.profile1_picture;
    const otherLinkedin = isProfile1 ? match.profile2_linkedin : match.profile1_linkedin;
    const otherRole = isProfile1 ? match.profile2_role : match.profile1_role;
    const initials = otherName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    return { otherName, otherPicture, otherLinkedin, otherRole, initials };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
        <Logo size="sm" />
      </div>
      <div className="px-5 pb-3 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Matches</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {matches.length > 0 ? `${matches.length} mutual ${matches.length === 1 ? 'match' : 'matches'}` : 'Your matches will appear here'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 min-h-0">
        {loading ? (
          <div className="flex justify-center mt-8">
            <div className="w-7 h-7 border-2 border-secondary border-t-primary rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-16 px-6">
            <div className="w-16 h-16 rounded-full bg-brand-green-bg flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-primary/40" />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground mb-1">No matches yet</h3>
            <p className="text-[13px] text-muted-foreground">Start swiping to find your next match</p>
            <button
              onClick={() => navigate('/discover')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {matches.map((match, i) => {
              const { otherName, otherPicture, otherLinkedin, otherRole, initials } = getMatchDisplay(match);
              return (
                <motion.button
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => navigate(`/messages/${match.id}`)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-border/60 hover:border-primary/20 hover:shadow-sm transition-all text-left"
                >
                  {otherPicture ? (
                    <img src={otherPicture} alt={otherName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-green-light flex items-center justify-center text-[14px] font-semibold text-primary flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-foreground">{otherName}</div>
                    <div className="text-[12px] text-muted-foreground truncate">
                      {match.job_title}
                      {match.company_name ? ` · ${match.company_name}` : ''}
                    </div>
                  </div>
                  {otherLinkedin && (
                    <a
                      href={otherLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-lg bg-linkedin/10 flex items-center justify-center hover:bg-linkedin/20 transition-colors flex-shrink-0"
                    >
                      <Linkedin size={15} className="text-linkedin" />
                    </a>
                  )}
                  <MessageCircle size={18} className="text-muted-foreground/40 flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}