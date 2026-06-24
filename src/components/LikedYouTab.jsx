import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import MatchOverlay from '@/components/MatchOverlay';

export default function LikedYouTab({ profile }) {
  const navigate = useNavigate();
  const [likedYou, setLikedYou] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);

  const isRecruiter = profile?.account_type === 'recruiter';

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      try {
        const incoming = await base44.entities.Swipe.filter({ target_profile_id: profile.id });
        const likedSwipes = incoming.filter(s => s.action === 'like' || s.action === 'super');
        if (likedSwipes.length === 0) { setLikedYou([]); return; }

        const mySwipes = await base44.entities.Swipe.filter({ swiper_profile_id: profile.id });
        const swipedTargetIds = new Set(mySwipes.map(s => s.target_profile_id));

        const m1 = await base44.entities.Match.filter({ profile1_id: profile.id });
        const m2 = await base44.entities.Match.filter({ profile2_id: profile.id });
        const matchedIds = new Set();
        [...m1, ...m2].forEach(m => { matchedIds.add(m.profile1_id); matchedIds.add(m.profile2_id); });

        const available = likedSwipes.filter(s => !swipedTargetIds.has(s.swiper_profile_id) && !matchedIds.has(s.swiper_profile_id));

        if (isRecruiter) {
          const profiles = await Promise.all(available.map(s => base44.entities.Profile.get(s.swiper_profile_id).catch(() => null)));
          setLikedYou(available.map((swipe, i) => ({ swipe, profile: profiles[i] })).filter(c => c.profile));
        } else {
          const jobs = await Promise.all(available.map(s => s.context_job_id ? base44.entities.Job.get(s.context_job_id).catch(() => null) : Promise.resolve(null)));
          const recruiters = await Promise.all(available.map(s => base44.entities.Profile.get(s.swiper_profile_id).catch(() => null)));
          setLikedYou(available.map((swipe, i) => ({ swipe, job: jobs[i], recruiterProfile: recruiters[i] })).filter(c => c.job || c.recruiterProfile));
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, [profile, isRecruiter]);

  const handleLikeBack = async (card) => {
    try {
      let match;
      if (isRecruiter) {
        const p2 = card.profile;
        match = await base44.entities.Match.create({
          profile1_id: profile.id, profile2_id: p2.id,
          profile1_user_id: profile.created_by_id, profile2_user_id: p2.created_by_id,
          job_id: null, job_title: p2.current_role || 'New Role', company_name: p2.current_company || '',
          profile1_name: profile.full_name, profile2_name: p2.full_name,
          profile1_picture: profile.profile_picture || '', profile2_picture: p2.profile_picture || '',
          profile1_role: profile.current_role || '', profile2_role: p2.current_role || '',
          profile1_linkedin: profile.linkedin_url || '', profile2_linkedin: p2.linkedin_url || '',
          status: 'active',
        });
      } else {
        const job = card.job;
        const rp = card.recruiterProfile;
        match = await base44.entities.Match.create({
          profile1_id: profile.id, profile2_id: card.swipe.swiper_profile_id,
          profile1_user_id: profile.created_by_id, profile2_user_id: rp?.created_by_id || '',
          job_id: job?.id || null, job_title: job?.title || '', company_name: job?.company || '',
          profile1_name: profile.full_name, profile2_name: rp?.full_name || job?.recruiter_name || job?.company || '',
          profile1_picture: profile.profile_picture || '', profile2_picture: rp?.profile_picture || '',
          profile1_role: profile.current_role || '', profile2_role: job?.recruiter_name || '',
          profile1_linkedin: profile.linkedin_url || '', profile2_linkedin: rp?.linkedin_url || job?.recruiter_linkedin || '',
          status: 'active',
        });
      }
      setMatchData(match);
      setLikedYou(prev => prev.filter(c => c.swipe.id !== card.swipe.id));
    } catch { /* ignore */ }
  };

  const getCardDisplay = (card) => {
    if (isRecruiter) {
      const p = card.profile;
      const initials = p.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
      return { name: p.full_name, picture: p.profile_picture, subtitle: p.current_role || '', initials };
    } else {
      const job = card.job;
      const rp = card.recruiterProfile;
      const name = rp?.full_name || job?.recruiter_name || job?.company || 'Recruiter';
      const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'R';
      return { name: job?.title || name, picture: rp?.profile_picture, subtitle: job?.company || '', initials };
    }
  };

  if (loading) return <LoadingScreen fullscreen={false} />;

  return (
    <>
      {likedYou.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-full bg-brand-green-bg flex items-center justify-center mb-4">
            <Heart size={28} className="text-muted-foreground/40" />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground mb-1">No likes yet</h3>
          <p className="text-[13px] text-muted-foreground">When someone likes you, they'll appear here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 min-h-0">
          <div className="grid grid-cols-2 gap-3">
            {likedYou.map((card, i) => {
              const { name, picture, subtitle, initials } = getCardDisplay(card);
              return (
                <motion.div
                  key={card.swipe.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex flex-col rounded-2xl bg-card border border-border/60 overflow-hidden"
                >
                  <div className="relative aspect-square w-full bg-gradient-to-br from-brand-green-bg to-secondary/40 flex items-center justify-center overflow-hidden">
                    {picture ? (
                      <img src={picture} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[28px] font-semibold text-primary/70">{initials}</div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="text-[14px] font-semibold text-foreground truncate">{name}</div>
                    {subtitle && <div className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</div>}
                    <button
                      onClick={() => handleLikeBack(card)}
                      className="w-full bg-primary text-white rounded-xl text-[13px] font-medium py-2 mt-2 hover:bg-primary/90 transition-colors"
                    >
                      Like Back
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {matchData && (
          <MatchOverlay
            match={matchData}
            onMessage={() => { setMatchData(null); navigate(`/messages/${matchData.id}`); }}
            onKeepSwiping={() => setMatchData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}