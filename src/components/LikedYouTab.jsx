import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import MatchOverlay from '@/components/MatchOverlay';

export default function LikedYouTab({ profile }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [jobIndexMap, setJobIndexMap] = useState({});

  const isRecruiter = profile?.account_type === 'recruiter';

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      try {
        const incoming = await base44.entities.Swipe.filter({ target_profile_id: profile.id });
        const likedSwipes = incoming.filter(s => s.action === 'like' || s.action === 'super');
        if (likedSwipes.length === 0) { setCards([]); return; }

        const mySwipes = await base44.entities.Swipe.filter({ swiper_profile_id: profile.id });
        const swipedTargetIds = new Set(mySwipes.map(s => s.target_profile_id));

        const m1 = await base44.entities.Match.filter({ profile1_id: profile.id });
        const m2 = await base44.entities.Match.filter({ profile2_id: profile.id });
        const matchedCombos = new Set();
        [...m1, ...m2].forEach(m => {
          const otherId = m.profile1_id === profile.id ? m.profile2_id : m.profile1_id;
          matchedCombos.add(`${otherId}__${m.job_id || ''}`);
        });

        if (isRecruiter) {
          const passedSeekerIds = new Set(mySwipes.filter(s => s.action === 'pass').map(s => s.target_profile_id));
          const available = likedSwipes.filter(s => {
            const comboKey = `${s.swiper_profile_id}__${s.context_job_id || ''}`;
            return !passedSeekerIds.has(s.swiper_profile_id) && !matchedCombos.has(comboKey);
          });

          if (available.length === 0) { setCards([]); return; }

          const grouped = {};
          available.forEach(swipe => {
            if (!grouped[swipe.swiper_profile_id]) grouped[swipe.swiper_profile_id] = [];
            grouped[swipe.swiper_profile_id].push(swipe);
          });

          const seekerIds = Object.keys(grouped);
          const seekerProfiles = await Promise.all(seekerIds.map(id => base44.entities.Profile.get(id).catch(() => null)));

          const result = [];
          for (let i = 0; i < seekerIds.length; i++) {
            const seekerId = seekerIds[i];
            const seekerProfile = seekerProfiles[i];
            if (!seekerProfile) continue;
            const swipes = grouped[seekerId];
            const jobs = await Promise.all(swipes.map(s => s.context_job_id ? base44.entities.Job.get(s.context_job_id).catch(() => null) : Promise.resolve(null)));
            const jobEntries = swipes.map((swipe, j) => ({ swipe, job: jobs[j], interest_level: swipe.interest_level || 'medium' })).filter(e => e.job);
            result.push({ seekerProfile, swipes, jobEntries, groupKey: seekerId });
          }
          setCards(result);
        } else {
          const available = likedSwipes.filter(s => {
            const comboKey = `${s.swiper_profile_id}__${s.context_job_id || ''}`;
            return !swipedTargetIds.has(s.swiper_profile_id) && !matchedCombos.has(comboKey);
          });
          if (available.length === 0) { setCards([]); return; }
          const jobs = await Promise.all(available.map(s => s.context_job_id ? base44.entities.Job.get(s.context_job_id).catch(() => null) : Promise.resolve(null)));
          const recruiters = await Promise.all(available.map(s => base44.entities.Profile.get(s.swiper_profile_id).catch(() => null)));
          setCards(available.map((swipe, i) => ({ swipe, job: jobs[i], recruiterProfile: recruiters[i] })).filter(c => c.job || c.recruiterProfile));
        }
      } catch (err) {
        console.error('LikedYouTab load error:', err);
      } finally { setLoading(false); }
    };
    load();
  }, [profile, isRecruiter]);

  const handleLikeBack = async (card) => {
    try {
      let match;
      if (isRecruiter) {
        const p2 = card.seekerProfile;
        const primaryEntry = card.jobEntries[0];
        const otherEntries = card.jobEntries.slice(1);
        const otherJobIds = otherEntries.map(e => e.job?.id).filter(Boolean);
        const otherJobTitles = otherEntries.map(e => e.job?.title).filter(Boolean);

        match = await base44.entities.Match.create({
          profile1_id: profile.id, profile2_id: p2.id,
          profile1_user_id: profile.created_by_id, profile2_user_id: p2.created_by_id,
          job_id: primaryEntry?.job?.id || null,
          job_title: primaryEntry?.job?.title || p2.current_role || '',
          company_name: primaryEntry?.job?.company || profile.current_company || '',
          profile1_name: profile.full_name, profile2_name: p2.full_name,
          profile1_picture: profile.profile_picture || '', profile2_picture: p2.profile_picture || '',
          profile1_role: profile.current_role || '', profile2_role: p2.current_role || '',
          profile1_linkedin: profile.linkedin_url || '', profile2_linkedin: p2.linkedin_url || '',
          other_job_ids: otherJobIds,
          other_job_titles: otherJobTitles,
          status: 'active',
        });

        await base44.entities.Swipe.create({
          swiper_profile_id: profile.id,
          target_profile_id: p2.id,
          target_type: 'candidate',
          action: 'like',
          context_job_id: null,
        }).catch(() => {});
      } else {
        const job = card.job;
        const rp = card.recruiterProfile;
        match = await base44.entities.Match.create({
          profile1_id: profile.id, profile2_id: card.swipe.swiper_profile_id,
          profile1_user_id: profile.created_by_id, profile2_user_id: rp?.created_by_id || '',
          job_id: job?.id || null, job_title: job?.title || '', company_name: job?.company || '',
          profile1_name: profile.full_name, profile2_name: rp?.full_name || job?.company || '',
          profile1_picture: profile.profile_picture || '', profile2_picture: rp?.profile_picture || '',
          profile1_role: profile.current_role || '', profile2_role: job?.recruiter_name || '',
          profile1_linkedin: profile.linkedin_url || '', profile2_linkedin: rp?.linkedin_url || job?.recruiter_linkedin || '',
          other_job_ids: [], other_job_titles: [],
          status: 'active',
        });

        await base44.entities.Swipe.create({
          swiper_profile_id: profile.id,
          target_profile_id: card.swipe.swiper_profile_id,
          target_type: 'job',
          action: 'like',
          context_job_id: job?.id || null,
        }).catch(() => {});
      }

      const mySkills = profile.skills || [];
      const theirSkills = (isRecruiter ? card.seekerProfile?.skills : card.recruiterProfile?.skills) || [];
      const sharedSkills = mySkills.filter(s => theirSkills.includes(s)).slice(0, 3);

      setMatchData({ ...match, sharedSkills });
      setCards(prev => prev.filter(c => (c.groupKey || c.swipe?.id) !== (card.groupKey || card.swipe?.id)));
    } catch { /* ignore */ }
  };

  const handlePass = async (card) => {
    try {
      if (isRecruiter) {
        await base44.entities.Swipe.create({
          swiper_profile_id: profile.id,
          target_profile_id: card.seekerProfile.id,
          target_type: 'candidate',
          action: 'pass',
          context_job_id: null,
        }).catch(() => {});
      } else {
        await base44.entities.Swipe.create({
          swiper_profile_id: profile.id,
          target_profile_id: card.swipe.swiper_profile_id,
          target_type: 'job',
          action: 'pass',
          context_job_id: card.job?.id || null,
        }).catch(() => {});
      }
      setCards(prev => prev.filter(c => (c.groupKey || c.swipe?.id) !== (card.groupKey || card.swipe?.id)));
    } catch { /* ignore */ }
  };

  const interestColor = (level) => {
    if (level === 'high') return 'text-green-600 bg-green-50';
    if (level === 'low') return 'text-orange-500 bg-orange-50';
    return 'text-blue-500 bg-blue-50';
  };

  const interestLabel = (level) => {
    if (level === 'high') return 'High Interest';
    if (level === 'low') return 'Low Interest';
    return 'Interested';
  };

  if (loading) return <LoadingScreen fullscreen={false} />;

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-full bg-brand-green-bg flex items-center justify-center mb-4">
          <Heart size={28} className="text-muted-foreground/40" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">No likes yet</h3>
        <p className="text-[13px] text-muted-foreground">
          {isRecruiter ? "When candidates like your jobs, they'll appear here" : "When recruiters are interested, they'll appear here"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 min-h-0">
        {isRecruiter ? (
          <div className="flex flex-col gap-3 pt-3">
            {cards.map((card, i) => {
              const p = card.seekerProfile;
              const initials = p.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
              const jobIdx = jobIndexMap[card.groupKey] || 0;
              const currentJobEntry = card.jobEntries[jobIdx] || card.jobEntries[0];
              const hasMultipleJobs = card.jobEntries.length > 1;

              return (
                <motion.div
                  key={card.groupKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="rounded-2xl bg-card border border-border/60 overflow-hidden"
                >
                  <div className="flex gap-3 p-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-green-bg to-secondary/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.profile_picture ? (
                        <img src={p.profile_picture} alt={p.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[20px] font-semibold text-primary/70">{initials}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-foreground truncate">{p.full_name}</div>
                      {p.current_role && <div className="text-[12px] text-muted-foreground truncate">{p.current_role}</div>}
                      {card.jobEntries.length > 1 && (
                        <div className="text-[11px] text-primary font-medium mt-0.5">Liked {card.jobEntries.length} of your jobs</div>
                      )}
                    </div>
                  </div>

                  {card.jobEntries.length > 0 && (
                    <div className="px-3 pb-2">
                      <div className="bg-muted/40 rounded-xl p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          {hasMultipleJobs && (
                            <button
                              onClick={() => setJobIndexMap(prev => ({ ...prev, [card.groupKey]: Math.max(0, (prev[card.groupKey] || 0) - 1) }))}
                              disabled={jobIdx === 0}
                              className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 flex-shrink-0"
                            >
                              <ChevronLeft size={14} />
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-foreground truncate">{currentJobEntry?.job?.title || 'Unknown Role'}</div>
                            {currentJobEntry?.job?.company && (
                              <div className="text-[11px] text-muted-foreground truncate">{currentJobEntry.job.company}</div>
                            )}
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${interestColor(currentJobEntry?.interest_level)}`}>
                            {interestLabel(currentJobEntry?.interest_level)}
                          </span>
                          {hasMultipleJobs && (
                            <button
                              onClick={() => setJobIndexMap(prev => ({ ...prev, [card.groupKey]: Math.min(card.jobEntries.length - 1, (prev[card.groupKey] || 0) + 1) }))}
                              disabled={jobIdx >= card.jobEntries.length - 1}
                              className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 flex-shrink-0"
                            >
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                        {hasMultipleJobs && (
                          <div className="flex justify-center gap-1 mt-2">
                            {card.jobEntries.map((_, di) => (
                              <div key={di} className={`w-1.5 h-1.5 rounded-full transition-colors ${di === jobIdx ? 'bg-primary' : 'bg-border'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 px-3 pb-3">
                    <button
                      onClick={() => handlePass(card)}
                      className="flex-1 border border-border text-muted-foreground rounded-xl text-[13px] font-medium py-2 hover:bg-muted/40 transition-colors"
                    >
                      Pass
                    </button>
                    <button
                      onClick={() => handleLikeBack(card)}
                      className="flex-1 bg-primary text-white rounded-xl text-[13px] font-medium py-2 hover:bg-primary/90 transition-colors"
                    >
                      Like Back
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-3">
            {cards.map((card, i) => {
              const job = card.job;
              const rp = card.recruiterProfile;
              const name = job?.title || rp?.current_role || 'Recruiter';
              const subtitle = job?.company || rp?.full_name || '';
              const picture = rp?.profile_picture || null;
              const initials = (rp?.full_name || 'R').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handlePass(card)}
                        className="flex-1 border border-border text-muted-foreground rounded-xl text-[12px] font-medium py-2 hover:bg-muted/40 transition-colors"
                      >
                        Pass
                      </button>
                      <button
                        onClick={() => handleLikeBack(card)}
                        className="flex-1 bg-primary text-white rounded-xl text-[12px] font-medium py-2 hover:bg-primary/90 transition-colors"
                      >
                        Like Back
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {matchData && (
          <MatchOverlay
            match={matchData}
            onMessage={() => { setMatchData(null); navigate(`/messages/${matchData.id}`); }}
            onKeepSwiping={() => setMatchData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}