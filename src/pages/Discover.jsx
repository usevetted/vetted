import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart, Star, SlidersHorizontal } from 'lucide-react';
import Logo from '@/components/Logo';
import SwipeCard from '@/components/SwipeCard';
import MatchOverlay from '@/components/MatchOverlay';
import FilterSheet from '@/components/FilterSheet';
import PostJobButton from '@/components/PostJobButton';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';

export default function Discover() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [triggerAction, setTriggerAction] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ remoteOnly: false, inPersonOnly: false, openToWork: false, sortBy: 'newest', distance: 50, location: '', skills: [] });
  const [pendingSwipe, setPendingSwipe] = useState(null);
  const [myJobs, setMyJobs] = useState([]);

  const isRecruiter = profile?.account_type === 'recruiter';

  const cards = useMemo(() => {
    let filtered = [...allCards];
    if (!isRecruiter) {
      if (filters.remoteOnly && !filters.inPersonOnly) filtered = filtered.filter(c => c.remote);
      else if (filters.inPersonOnly && !filters.remoteOnly) filtered = filtered.filter(c => !c.remote);
    }
    if (isRecruiter) {
      if (filters.openToWork) filtered = filtered.filter(c => c.open_to_work);
      if (filters.location.trim()) {
        const loc = filters.location.trim().toLowerCase();
        filtered = filtered.filter(c => c.location && c.location.toLowerCase().includes(loc));
      }
      if (filters.skills.length > 0) filtered = filtered.filter(c => c.skills && c.skills.some(s => filters.skills.includes(s)));
    }
    if (filters.sortBy === 'oldest') filtered.reverse();
    return filtered;
  }, [allCards, filters, isRecruiter]);

  const loadCards = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(false);
    try {
      const swipes = await base44.entities.Swipe.filter({ swiper_profile_id: profile.id });

      if (isRecruiter) {
        const jobs = await base44.entities.Job.filter({ recruiter_profile_id: profile.id });
        setMyJobs(jobs);

        const allProfiles = await base44.entities.Profile.filter({ account_type: 'job_seeker' }, '-created_date', 50);
        const swipedSeekerIds = new Set(
          swipes.filter(s => s.action === 'like' || s.action === 'super' || s.action === 'pass').map(s => s.target_profile_id)
        );
        const filtered = allProfiles.filter(p =>
          p.id !== profile.id &&
          p.created_by_id !== profile.created_by_id &&
          !swipedSeekerIds.has(p.id)
        );
        setAllCards(filtered);
      } else {
        const allJobs = await base44.entities.Job.list('-created_date', 50);
        const swipedJobIds = new Set(swipes.filter(s => s.context_job_id).map(s => s.context_job_id));
        const filtered = allJobs.filter(j => !swipedJobIds.has(j.id));
        setAllCards(filtered);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [profile, isRecruiter]);

  useEffect(() => { loadCards(); }, [loadCards]);

  const handleSwipe = async (action) => {
    setTriggerAction(null);
    if (cards.length === 0) return;
    const currentCard = cards[0];

    if (isRecruiter && (action === 'like' || action === 'super')) {
      setPendingSwipe({ card: currentCard, action });
      setAllCards(prev => prev.filter(c => c.id !== currentCard.id));
      return;
    }

    await recordSwipe(currentCard, action, null);
  };

  const recordSwipe = async (card, action, contextJobId) => {
    let targetProfileId, targetType;
    if (isRecruiter) {
      targetProfileId = card.id;
      targetType = 'candidate';
    } else {
      targetProfileId = card.recruiter_profile_id || null;
      targetType = 'job';
    }

    try {
      await base44.entities.Swipe.create({
        swiper_profile_id: profile.id,
        target_profile_id: targetProfileId,
        target_type: targetType,
        action,
        context_job_id: contextJobId || (isRecruiter ? null : card.id),
      });
    } catch { /* continue even if error */ }

    setAllCards(prev => prev.filter(c => c.id !== card.id));

    if ((action === 'like' || action === 'super') && targetProfileId) {
      await checkForMatch(targetProfileId, card, contextJobId);
    }
  };

  const handleJobPicked = async (job) => {
    if (!pendingSwipe) return;
    const { card, action } = pendingSwipe;
    setPendingSwipe(null);
    await recordSwipe(card, action, job.id);
  };

  const handleJobPickerCancel = () => {
    if (pendingSwipe) {
      setAllCards(prev => [pendingSwipe.card, ...prev]);
    }
    setPendingSwipe(null);
  };

  const checkForMatch = async (targetProfileId, card, contextJobId) => {
    try {
      if (targetProfileId === profile.id) return;

      const seekerId = isRecruiter ? targetProfileId : profile.id;
      const recruiterId = isRecruiter ? profile.id : targetProfileId;
      const jobId = isRecruiter ? contextJobId : card.id;
      const jobTitle = isRecruiter
        ? (myJobs.find(j => j.id === contextJobId)?.title || '')
        : card.title;
      const companyName = isRecruiter
        ? (myJobs.find(j => j.id === contextJobId)?.company || '')
        : card.company;

      const mutualSwipes = await base44.entities.Swipe.filter({
        swiper_profile_id: targetProfileId,
        target_profile_id: profile.id,
      });
      const hasMutualLike = mutualSwipes.some(s => s.action === 'like' || s.action === 'super');
      if (!hasMutualLike) return;

      if (!isRecruiter) {
        const recruiterLikedUs = mutualSwipes.some(s =>
          s.target_profile_id === profile.id && (s.action === 'like' || s.action === 'super')
        );
        if (!recruiterLikedUs) return;
      } else {
        const seekerLikedJob = mutualSwipes.some(s =>
          s.context_job_id === contextJobId && (s.action === 'like' || s.action === 'super')
        );
        if (!seekerLikedJob) return;
      }

      const existingAs1 = await base44.entities.Match.filter({ profile1_id: seekerId, profile2_id: recruiterId });
      const existingAs2 = await base44.entities.Match.filter({ profile1_id: recruiterId, profile2_id: seekerId });
      const existing = [...existingAs1, ...existingAs2].find(m => m.status === 'active');

      if (existing) {
        const currentJobIds = [existing.job_id, ...(existing.additional_job_ids || [])].filter(Boolean);
        if (jobId && !currentJobIds.includes(jobId)) {
          const newAdditionalIds = [...(existing.additional_job_ids || []), jobId];
          const newAdditionalTitles = [...(existing.additional_job_titles || []), jobTitle];
          await base44.entities.Match.update(existing.id, {
            additional_job_ids: newAdditionalIds,
            additional_job_titles: newAdditionalTitles,
          });
          setMatchData({ ...existing, additional_job_ids: newAdditionalIds, additional_job_titles: newAdditionalTitles, sharedSkills: [] });
        }
        return;
      }

      const seekerProfile = isRecruiter ? card : profile;
      const recruiterData = isRecruiter ? profile : card;

      const match = await base44.entities.Match.create({
        profile1_id: seekerId,
        profile2_id: recruiterId,
        profile1_user_id: seekerProfile.created_by_id || '',
        profile2_user_id: isRecruiter ? profile.created_by_id : (card.created_by_id || ''),
        job_id: jobId || null,
        job_title: jobTitle,
        company_name: companyName,
        profile1_name: isRecruiter ? card.full_name : profile.full_name,
        profile2_name: isRecruiter ? profile.full_name : (card.recruiter_name || card.company || ''),
        profile1_picture: isRecruiter ? (card.profile_picture || '') : (profile.profile_picture || ''),
        profile2_picture: isRecruiter ? (profile.profile_picture || '') : '',
        profile1_role: isRecruiter ? (card.current_role || '') : (profile.current_role || ''),
        profile2_role: isRecruiter ? (profile.current_role || '') : (card.recruiter_name || ''),
        profile1_linkedin: isRecruiter ? (card.linkedin_url || '') : (profile.linkedin_url || ''),
        profile2_linkedin: isRecruiter ? (profile.linkedin_url || '') : (card.recruiter_linkedin || ''),
        profile1_resume: isRecruiter ? (card.resume_url || '') : (profile.resume_url || ''),
        profile2_resume: isRecruiter ? (profile.resume_url || '') : '',
        additional_job_ids: [],
        additional_job_titles: [],
        status: 'active',
      });

      const mySkills = profile.skills || [];
      const theirSkills = card.skills || [];
      const sharedSkills = mySkills.filter(s => theirSkills.includes(s)).slice(0, 3);
      setMatchData({ ...match, sharedSkills });
    } catch { /* ignore match errors */ }
  };

  const handleButtonClick = (action) => {
    if (triggerAction || cards.length === 0) return;
    setTriggerAction(action);
  };

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 relative z-10">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <PostJobButton isRecruiter={isRecruiter} profile={profile} onJobPosted={loadCards} />
          <button
            onClick={() => setFilterOpen(true)}
            className="!rounded-button w-11 h-11 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={18} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="!rounded-button w-11 h-11 rounded-full bg-brand-green-light flex items-center justify-center text-[11px] font-semibold text-primary overflow-hidden border border-border/50 shadow-sm cursor-pointer"
          >
            {profile?.profile_picture ? (
              <img src={profile.profile_picture} alt="" className="w-full h-full object-cover" />
            ) : initials}
          </button>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-3 relative min-h-0">
        {loading ? (
          <LoadingScreen fullscreen={false} />
        ) : error ? (
          <ErrorState onRetry={loadCards} />
        ) : cards.length === 0 ? (
          <EmptyState onRefresh={loadCards} />
        ) : (
          <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
            <AnimatePresence>
              {cards.slice(0, 3).map((card, index) => (
                <SwipeCard
                  key={card.id}
                  card={card}
                  type={isRecruiter ? 'candidate' : 'job'}
                  onSwipe={handleSwipe}
                  isTop={index === 0}
                  index={index}
                  triggerAction={index === 0 ? triggerAction : null}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!loading && cards.length > 0 && (
        <div className="flex items-center justify-center gap-5 pb-5 pt-3 border-t border-border/20">
          <motion.button whileTap={{ scale: 0.82 }} whileHover={{ scale: 1.08 }} onClick={() => handleButtonClick('pass')}
            className="!rounded-button w-[58px] h-[58px] rounded-full bg-red-500 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.25)]">
            <X size={26} className="text-white" strokeWidth={2.5} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.82, y: -4 }} whileHover={{ scale: 1.12, y: -2 }} onClick={() => handleButtonClick('super')}
            className="!rounded-button w-[50px] h-[50px] rounded-full bg-gold flex items-center justify-center shadow-[0_8px_24px_rgba(245,158,11,0.3)]">
            <Star size={22} className="text-white" fill="white" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.82 }} whileHover={{ scale: 1.08 }} onClick={() => handleButtonClick('like')}
            className="!rounded-button w-[58px] h-[58px] rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-[0_8px_24px_rgba(22,101,52,0.2)]">
            <Heart size={26} className="text-white" fill="white" />
          </motion.button>
        </div>
      )}

      {/* Recruiter job picker sheet */}
      <AnimatePresence>
        {pendingSwipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40"
            onClick={handleJobPickerCancel}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-t-3xl p-5 pb-8"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
              <h3 className="text-[16px] font-semibold text-foreground mb-1">
                Which role is {pendingSwipe.card.full_name?.split(' ')[0]} a fit for?
              </h3>
              <p className="text-[13px] text-muted-foreground mb-4">Select the position you're considering them for</p>
              {myJobs.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-4">You haven't posted any jobs yet.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
                  {myJobs.map(job => (
                    <button
                      key={job.id}
                      onClick={() => handleJobPicked(job)}
                      className="!rounded-button w-full text-left px-4 py-3 rounded-2xl border border-border bg-background hover:border-primary/40 hover:bg-brand-green-bg transition-all"
                    >
                      <div className="text-[14px] font-medium text-foreground">{job.title}</div>
                      {job.company && <div className="text-[12px] text-muted-foreground">{job.company}</div>}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={handleJobPickerCancel} className="w-full mt-3 py-2 text-[13px] text-muted-foreground">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match overlay */}
      <AnimatePresence>
        {matchData && (
          <MatchOverlay
            match={matchData}
            onMessage={() => { setMatchData(null); navigate(`/messages/${matchData.id}`); }}
            onKeepSwiping={() => setMatchData(null)}
          />
        )}
      </AnimatePresence>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} isRecruiter={isRecruiter} />
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center text-center px-8">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <Heart size={28} className="text-destructive/40" />
      </div>
      <h3 className="text-[16px] font-semibold text-foreground mb-1">Something went wrong</h3>
      <p className="text-[13px] text-muted-foreground mb-5">Couldn't load cards. Please check your connection and try again.</p>
      <button onClick={onRetry} className="!rounded-button px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">Retry</button>
    </div>
  );
}

function EmptyState({ onRefresh }) {
  return (
    <div className="flex flex-col items-center text-center px-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Heart size={28} className="text-muted-foreground/40" />
      </div>
      <h3 className="text-[16px] font-semibold text-foreground mb-1">You're all caught up</h3>
      <p className="text-[13px] text-muted-foreground mb-5">Check back later for new opportunities</p>
      <button onClick={onRefresh} className="!rounded-button px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">Refresh</button>
    </div>
  );
}