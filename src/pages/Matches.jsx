import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Linkedin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import LikedYouTab from '@/components/LikedYouTab';
import ActivityTab from '@/components/ActivityTab';

export default function Matches() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');

  const isRecruiter = profile?.account_type === 'recruiter';

  const load = async () => {
    if (!profile) return;
    try {
      const m1 = await base44.entities.Match.filter({ profile1_id: profile.id, status: 'active' });
      const m2 = await base44.entities.Match.filter({ profile2_id: profile.id, status: 'active' });
      const all = [...m1, ...m2].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      // Group matches by the other person's profile ID
      const groups = {};
      all.forEach(match => {
        const isP1 = match.profile1_id === profile.id;
        const otherId = isP1 ? match.profile2_id : match.profile1_id;
        if (!groups[otherId]) {
          groups[otherId] = {
            otherId,
            otherName: isP1 ? match.profile2_name : match.profile1_name,
            otherPicture: isP1 ? match.profile2_picture : match.profile1_picture,
            otherLinkedin: isP1 ? match.profile2_linkedin : match.profile1_linkedin,
            otherRole: isP1 ? match.profile2_role : match.profile1_role,
            matches: [],
          };
        }
        groups[otherId].matches.push(match);
      });

      setGrouped(Object.values(groups));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [profile]);

  const tabs = [
    { key: 'matches', label: 'Matches' },
    { key: 'liked-you', label: isRecruiter ? 'Applied to Jobs' : 'Interested In You' },
    { key: 'activity', label: isRecruiter ? 'Jobs You Posted' : 'Jobs You Liked' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3 pb-2 flex-shrink-0">
        <h1 className="text-[22px] font-semibold text-foreground">Matches</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {grouped.length > 0
            ? `${grouped.length} mutual ${grouped.length === 1 ? 'match' : 'matches'}`
            : 'Your matches will appear here'}
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Tab bar */}
        <div className="flex px-5 border-b border-border/50 flex-shrink-0 gap-5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-[13px] font-medium py-2.5 px-0 border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'matches' && (
            <div className="flex-1 flex flex-col min-h-0">
              {loading && (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingScreen fullscreen={false} />
                </div>
              )}

              {!loading && grouped.length === 0 && (
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

              {!loading && grouped.length > 0 && (
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 min-h-0 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {grouped.map((group, i) => {
                      const { otherName, otherPicture, otherLinkedin, otherRole, matches: groupMatches } = group;
                      const firstName = otherName?.split(' ')[0] || '';
                      const initials = otherName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
                      const primaryMatch = groupMatches[0];
                      const extraCount = groupMatches.length - 1;

                      return (
                        <motion.button
                          key={group.otherId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          onClick={() => navigate(`/messages/${primaryMatch.id}`)}
                          className="flex flex-col rounded-2xl bg-white border border-border/60 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all text-left group"
                        >
                          {/* Photo */}
                          <div className="relative aspect-square w-full bg-gradient-to-br from-brand-green-bg to-secondary/40 flex items-center justify-center overflow-hidden">
                            {otherPicture ? (
                              <img src={otherPicture} alt={otherName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-[28px] font-semibold text-primary/70">{initials}</div>
                            )}
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
                            {/* Badge for multiple job matches */}
                            {extraCount > 0 && (
                              <div className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                +{extraCount} role{extraCount > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3">
                            <div className="text-[14px] font-semibold text-foreground truncate">{firstName}</div>
                            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {primaryMatch.job_title}{primaryMatch.company_name ? ` · ${primaryMatch.company_name}` : ''}
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
          )}

          {activeTab === 'liked-you' && (
            <div className="flex-1 flex flex-col min-h-0">
              <LikedYouTab profile={profile} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="flex-1 flex flex-col min-h-0">
              <ActivityTab profile={profile} isRecruiter={isRecruiter} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}