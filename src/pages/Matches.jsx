import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Linkedin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';

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
      <div className="px-5 pt-3 pb-2 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Matches</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {matches.length > 0 ? `${matches.length} mutual ${matches.length === 1 ? 'match' : 'matches'}` : 'Your matches will appear here'}
        </p>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <LoadingScreen fullscreen={false} />
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
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
      )}

      {!loading && matches.length > 0 && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 min-h-0">
          <div className="grid grid-cols-2 gap-3">
            {matches.map((match, i) => {
              const { otherName, otherPicture, otherLinkedin, otherRole, initials } = getMatchDisplay(match);
              const firstName = otherName?.split(' ')[0] || '';
              return (
                <motion.button
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => navigate(`/messages/${match.id}`)}
                  className="flex flex-col rounded-2xl bg-white border border-border/60 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all text-left group"
                >
                  {/* Square photo / initials */}
                  <div className="relative aspect-square w-full bg-gradient-to-br from-brand-green-bg to-secondary/40 flex items-center justify-center overflow-hidden">
                    {otherPicture ? (
                      <img src={otherPicture} alt={otherName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[28px] font-semibold text-primary/70">
                        {initials}
                      </div>
                    )}
                    {/* LinkedIn badge */}
                    {otherLinkedin && (
                      <a
                        href={otherLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 glass flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                      >
                        <Linkedin size={15} className="text-linkedin" />
                      </a>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="text-[14px] font-semibold text-foreground truncate">{firstName}</div>
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {match.job_title}{match.company_name ? ` · ${match.company_name}` : ''}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-primary font-medium">
                      <MessageCircle size={12} />
                      <span>Message</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}