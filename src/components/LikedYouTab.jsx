import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import MatchOverlay from '@/components/MatchOverlay';

export default function LikedYouTab({ profile }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [acting, setActing] = useState({});

  const isRecruiter = profile?.account_type === 'recruiter';

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      try {
        const incoming = await base44.entities.Swipe.filter({ target_profile_id: profile.id });
        const likedSwipes = incoming.filter((s) => s.action === 'like' || s.action === 'super');
        if (likedSwipes.length === 0) {setCards([]);return;}

        const mySwipes = await base44.entities.Swipe.filter({ swiper_profile_id: profile.id });

        const m1 = await base44.entities.Match.filter({ profile1_id: profile.id });
        const m2 = await base44.entities.Match.filter({ profile2_id: profile.id });
        const allMyMatches = [...m1, ...m2].filter((m) => m.status === 'active');

        if (isRecruiter) {
          const myPassCombos = new Set(
            mySwipes.filter((s) => s.action === 'pass').map((s) => `${s.target_profile_id}__${s.context_job_id || ''}`)
          );

          const grouped = {};
          likedSwipes.forEach((swipe) => {
            const seekerId = swipe.swiper_profile_id;
            if (!grouped[seekerId]) grouped[seekerId] = [];
            grouped[seekerId].push(swipe);
          });

          const seekerIds = Object.keys(grouped);
          const seekerProfiles = await Promise.all(seekerIds.map((id) => base44.entities.Profile.get(id).catch(() => null)));

          const result = [];
          for (let i = 0; i < seekerIds.length; i++) {
            const seekerId = seekerIds[i];
            const seekerProfile = seekerProfiles[i];
            if (!seekerProfile) continue;

            const swipes = grouped[seekerId];
            const jobs = await Promise.all(swipes.map((s) => s.context_job_id ? base44.entities.Job.get(s.context_job_id).catch(() => null) : Promise.resolve(null)));

            const existingMatchJobIds = new Set(
              allMyMatches.
              filter((m) => m.profile1_id === seekerId || m.profile2_id === seekerId).
              flatMap((m) => [m.job_id, ...(m.additional_job_ids || [])].filter(Boolean))
            );

            const jobEntries = swipes.map((swipe, j) => {
              const job = jobs[j];
              if (!job) return null;
              const comboKey = `${seekerId}__${job.id}`;
              if (myPassCombos.has(comboKey)) return null;
              if (existingMatchJobIds.has(job.id)) return null;
              return { swipe, job, isSuper: swipe.action === 'super' };
            }).filter(Boolean);

            if (jobEntries.length === 0) continue;
            result.push({ seekerProfile, jobEntries, seekerId });
          }
          setCards(result);
        } else {
          const alreadyActedRecruiterIds = new Set(mySwipes.map((s) => s.target_profile_id));
          const matchedRecruiterIds = new Set(
            allMyMatches.map((m) => m.profile1_id === profile.id ? m.profile2_id : m.profile1_id)
          );

          const available = likedSwipes.filter((s) =>
          !alreadyActedRecruiterIds.has(s.swiper_profile_id) &&
          !matchedRecruiterIds.has(s.swiper_profile_id)
          );

          const recruiters = await Promise.all(available.map((s) => base44.entities.Profile.get(s.swiper_profile_id).catch(() => null)));
          const jobs = await Promise.all(available.map((s) => s.context_job_id ? base44.entities.Job.get(s.context_job_id).catch(() => null) : Promise.resolve(null)));

          setCards(available.map((swipe, i) => ({
            swipe,
            recruiterProfile: recruiters[i],
            job: jobs[i]
          })).filter((c) => c.recruiterProfile));
        }
      } catch (err) {
        console.error('LikedYouTab error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile, isRecruiter]);

  const ensureMatch = async ({ seekerId, recruiterId, seekerProfile, recruiterProfile, job }) => {
    const seekerUserId = seekerProfile?.created_by_id || '';
    const recruiterUserId = recruiterProfile?.created_by_id || '';

    const [ex1, ex2] = await Promise.all([
    base44.entities.Match.filter({ profile1_id: seekerId, profile2_id: recruiterId }),
    base44.entities.Match.filter({ profile1_id: recruiterId, profile2_id: seekerId })]
    );
    const existing = [...ex1, ...ex2].find((m) => m.status === 'active');

    if (existing) {
      const currentJobIds = [existing.job_id, ...(existing.additional_job_ids || [])].filter(Boolean);
      if (job?.id && !currentJobIds.includes(job.id)) {
        const updated = await base44.entities.Match.update(existing.id, {
          additional_job_ids: [...(existing.additional_job_ids || []), job.id],
          additional_job_titles: [...(existing.additional_job_titles || []), job.title || '']
        });
        return updated || existing;
      }
      return existing;
    }

    return await base44.entities.Match.create({
      profile1_id: seekerId,
      profile2_id: recruiterId,
      profile1_user_id: seekerUserId,
      profile2_user_id: recruiterUserId,
      job_id: job?.id || null,
      job_title: job?.title || '',
      company_name: job?.company || recruiterProfile?.current_company || '',
      profile1_name: seekerProfile?.full_name || '',
      profile2_name: recruiterProfile?.full_name || '',
      profile1_picture: seekerProfile?.profile_picture || '',
      profile2_picture: recruiterProfile?.profile_picture || '',
      profile1_role: seekerProfile?.current_role || '',
      profile2_role: recruiterProfile?.current_role || '',
      profile1_linkedin: seekerProfile?.linkedin_url || '',
      profile2_linkedin: recruiterProfile?.linkedin_url || '',
      additional_job_ids: [],
      additional_job_titles: [],
      status: 'active'
    });
  };

  const handleRecruiterLikeJob = async (card, jobEntry) => {
    const key = `${card.seekerId}__${jobEntry.job.id}`;
    setActing((prev) => ({ ...prev, [key]: 'liking' }));
    try {
      const match = await ensureMatch({
        seekerId: card.seekerId,
        recruiterId: profile.id,
        seekerProfile: card.seekerProfile,
        recruiterProfile: profile,
        job: jobEntry.job
      });

      await base44.entities.Swipe.create({
        swiper_profile_id: profile.id,
        target_profile_id: card.seekerId,
        target_type: 'candidate',
        action: 'like',
        context_job_id: jobEntry.job.id
      }).catch(() => {});

      const mySkills = profile.skills || [];
      const theirSkills = card.seekerProfile?.skills || [];
      const sharedSkills = mySkills.filter((s) => theirSkills.includes(s)).slice(0, 3);
      setMatchData({ ...match, sharedSkills });

      setCards((prev) => prev.map((c) => {
        if (c.seekerId !== card.seekerId) return c;
        const remaining = c.jobEntries.filter((e) => e.job.id !== jobEntry.job.id);
        return remaining.length > 0 ? { ...c, jobEntries: remaining } : null;
      }).filter(Boolean));
    } catch {/* ignore */} finally {
      setActing((prev) => {const n = { ...prev };delete n[key];return n;});
    }
  };

  const handleRecruiterPassJob = async (card, jobEntry) => {
    const key = `${card.seekerId}__${jobEntry.job.id}`;
    setActing((prev) => ({ ...prev, [key]: 'passing' }));
    try {
      await base44.entities.Swipe.create({
        swiper_profile_id: profile.id,
        target_profile_id: card.seekerId,
        target_type: 'candidate',
        action: 'pass',
        context_job_id: jobEntry.job.id
      }).catch(() => {});

      setCards((prev) => prev.map((c) => {
        if (c.seekerId !== card.seekerId) return c;
        const remaining = c.jobEntries.filter((e) => e.job.id !== jobEntry.job.id);
        return remaining.length > 0 ? { ...c, jobEntries: remaining } : null;
      }).filter(Boolean));
    } catch {/* ignore */} finally {
      setActing((prev) => {const n = { ...prev };delete n[key];return n;});
    }
  };

  const handleSeekerLikeBack = async (card) => {
    try {
      const match = await ensureMatch({
        seekerId: profile.id,
        recruiterId: card.swipe.swiper_profile_id,
        seekerProfile: profile,
        recruiterProfile: card.recruiterProfile,
        job: card.job
      });

      await base44.entities.Swipe.create({
        swiper_profile_id: profile.id,
        target_profile_id: card.swipe.swiper_profile_id,
        target_type: 'job',
        action: 'like',
        context_job_id: card.job?.id || null
      }).catch(() => {});

      const mySkills = profile.skills || [];
      const theirSkills = card.recruiterProfile?.skills || [];
      const sharedSkills = mySkills.filter((s) => theirSkills.includes(s)).slice(0, 3);
      setMatchData({ ...match, sharedSkills });
      setCards((prev) => prev.filter((c) => c.swipe.id !== card.swipe.id));
    } catch {/* ignore */}
  };

  const handleSeekerPass = async (card) => {
    try {
      await base44.entities.Swipe.create({
        swiper_profile_id: profile.id,
        target_profile_id: card.swipe.swiper_profile_id,
        target_type: 'job',
        action: 'pass',
        context_job_id: card.job?.id || null
      }).catch(() => {});
      setCards((prev) => prev.filter((c) => c.swipe.id !== card.swipe.id));
    } catch {/* ignore */}
  };

  if (loading) return <LoadingScreen fullscreen={false} />;

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[hsl(var(--brand-green))]">
          <Heart size={28} className="text-muted-foreground/40" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">No likes yet</h3>
        <p className="text-[13px] text-muted-foreground">
          {isRecruiter ? "When candidates apply to your jobs, they'll appear here" : "When recruiters are interested in you, they'll appear here"}
        </p>
      </div>);

  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 pt-3 min-h-0">
        {isRecruiter ?
        <div className="flex flex-col gap-3">
            {cards.map((card, i) => {
            const p = card.seekerProfile;
            const initials = p.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
            return (
              <motion.div
                key={card.seekerId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                
                  <div className="flex items-center gap-3 p-3 pb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-green-bg to-secondary/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.profile_picture ?
                    <img src={p.profile_picture} alt={p.full_name} className="w-full h-full object-cover" /> :

                    <div className="text-[18px] font-semibold text-primary/70">{initials}</div>
                    }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-foreground truncate">{p.full_name}</div>
                      {p.current_role && <div className="text-[12px] text-muted-foreground truncate">{p.current_role}</div>}
                    </div>
                    {card.jobEntries.length > 1 &&
                  <div className="text-[11px] text-primary font-medium flex-shrink-0">
                        {card.jobEntries.length} roles
                      </div>
                  }
                  </div>

                  <div className="px-3 pb-3 flex flex-col gap-2">
                    {card.jobEntries.map((entry) => {
                    const key = `${card.seekerId}__${entry.job.id}`;
                    const isActing = acting[key];
                    return (
                      <div key={entry.job.id} className="bg-muted/40 rounded-xl p-2.5 flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {entry.isSuper && <Zap size={12} className="text-amber-500 flex-shrink-0" fill="currentColor" />}
                              <span className="text-[13px] font-medium text-foreground truncate">{entry.job.title}</span>
                            </div>
                            {entry.job.company && <div className="text-[11px] text-muted-foreground truncate">{entry.job.company}</div>}
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                            onClick={() => handleRecruiterPassJob(card, entry)}
                            disabled={!!isActing}
                            className="!rounded-button px-3 py-1.5 rounded-lg border border-border text-[12px] text-muted-foreground font-medium hover:bg-muted/60 transition-colors disabled:opacity-40">
                            
                              Pass
                            </button>
                            <button
                            onClick={() => handleRecruiterLikeJob(card, entry)}
                            disabled={!!isActing}
                            className="!rounded-button px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40">
                            
                              Like
                            </button>
                          </div>
                        </div>);

                  })}
                  </div>
                </motion.div>);

          })}
          </div> :

        <div className="grid grid-cols-2 gap-3">
            {cards.map((card, i) => {
            const rp = card.recruiterProfile;
            const job = card.job;
            const name = rp?.full_name || 'Recruiter';
            const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
            const isSuper = card.swipe.action === 'super';
            return (
              <motion.div
                key={card.swipe.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex flex-col rounded-2xl bg-card border border-border/60 overflow-hidden">
                
                  <div className="relative aspect-square w-full bg-gradient-to-br from-brand-green-bg to-secondary/40 flex items-center justify-center overflow-hidden">
                    {rp?.profile_picture ?
                  <img src={rp.profile_picture} alt={name} className="w-full h-full object-cover" /> :

                  <div className="text-[28px] font-semibold text-primary/70">{initials}</div>
                  }
                    {isSuper &&
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={9} fill="white" /> Super
                      </div>
                  }
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="text-[13px] font-semibold text-foreground truncate">{name}</div>
                    {job ?
                  <div className="text-[11px] text-primary font-medium truncate mt-0.5">Re: {job.title}</div> :

                  rp?.current_company && <div className="text-[11px] text-muted-foreground truncate mt-0.5">{rp.current_company}</div>
                  }
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => handleSeekerPass(card)}
                    className="!rounded-button flex-1 border border-border text-muted-foreground rounded-xl text-[11px] font-medium py-1.5 hover:bg-muted/40 transition-colors">
                        Pass
                      </button>
                      <button onClick={() => handleSeekerLikeBack(card)}
                    className="!rounded-button flex-1 bg-primary text-white rounded-xl text-[11px] font-medium py-1.5 hover:bg-primary/90 transition-colors">
                        Like Back
                      </button>
                    </div>
                  </div>
                </motion.div>);

          })}
          </div>
        }
      </div>

      <AnimatePresence>
        {matchData &&
        <MatchOverlay
          match={matchData}
          onMessage={() => {setMatchData(null);navigate(`/messages/${matchData.id}`);}}
          onKeepSwiping={() => setMatchData(null)} />

        }
      </AnimatePresence>
    </div>);

}