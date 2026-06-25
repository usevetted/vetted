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
  const [pendingLike, setPendingLike] = useState(null);
  const [filters, setFilters] = useState({ remoteOnly: false, inPersonOnly: false, openToWork: false, sortBy: 'newest', distance: 50, location: '', skills: [] });

  const isRecruiter = profile?.account_type === 'recruiter';

  const cards = useMemo(() => {
    let filtered = [...allCards];
    if (!isRecruiter) {
      if (filters.remoteOnly && !filters.inPersonOnly) {
        filtered = filtered.filter(c => c.remote);
      } else if (filters.inPersonOnly && !filters.remoteOnly) {
        filtered = filtered.filter(c => !c.remote);
      }
    }
    if (isRecruiter) {
      if (filters.openToWork) {
        filtered = filtered.filter(c => c.open_to_work);
      }
      if (filters.location.trim()) {
        const loc = filters.location.trim().toLowerCase();
        filtered = filtered.filter(c => c.location && c.location.toLowerCase().includes(loc));
      }
      if (filters.skills.length > 0) {
        filtered = filtered.filter(c => c.skills && c.skills.some(s => filters.skills.includes(s)));
      }
    }
    if (filters.sortBy === 'oldest') {
      filtered.reverse();
    }
    return filtered;
  }, [allCards, filters, isRecruiter]);

  const loadCards = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(false);
    try {
      const swipes = await base44.entities.Swipe.filter({ swiper_profile_id: profile.id });

      if (isRecruiter) {
        const allProfiles = await base44.entities.Profile.filter({ account_type: 'job_seeker' }, '-created_date', 50);
        const swipedProfileIds = new Set(
          swipes
            .filter(s => s.action === 'like' || s.action === 'super')
            .map(s => s.target_profile_id)
        );
        const filtered = allProfiles.filter(p => p.id !== profile.id && p.created_by_id !== profile.created_by_id && !swipedProfileIds.has(p.id));
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

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleSwipe = async (action) => {
    setTriggerAction(null);
    if (cards.length === 0) return;
    const currentCard = cards[0];

    // Job seeker liking a job — show interest picker first
    if (!isRecruiter && action === 'like') {
      setPendingLike({ card: currentCard });
      setAllCards(prev => prev.filter(c => c.id !== currentCard.id));
      return;
    }

    let targetProfileId, contextJobId, targetType;
    if (isRecruiter) {
      targetProfileId = currentCard.id;
      contextJobId = null;
      targetType = 'candidate';
    } else {
      if (currentCard.recruiter_profile_id) {
        targetProfileId = currentCard.recruiter_profile_id;
      } else {
        targetProfileId = null;
      }
      contextJobId = currentCard.id;
      targetType = 'job';
    }

    try {
      await base44.entities.Swipe.create({
        swiper_profile_id: profile.id,
        target_profile_id: targetProfileId,
        target_type: targetType,
        action,
        context_job_id: contextJobId,
      });
    } catch {
      // continue even if error
    }

    setAllCards(prev => prev.filter(c => c.id !== currentCard.id));

    if ((action === 'like' || action === 'super') && targetProfileId) {
      await checkForMatch(targetProfileId, currentCard, action);
    }
  };

  const confirmLike = async (level) => {
    const card = pendingLike?.card;
    setPendingLike(null);
    if (!card) return;

    const targetProfileId = card.recruiter_profile_id || null;
    const contextJobId = card.id;

    try {
      await base44.entities.Swipe.create({
        swiper_profile_id: profile.id,
        target_profile_id: targetProfileId,
        target_type: 'job',
        action: 'like',
        context_job_id: contextJobId,
        interest_level: level,
      });
    } catch {
      // continue even if error
    }

    if (targetProfileId) {
      await checkForMatch(targetProfileId, card, 'like');
    }
  };

  const checkForMatch = async (targetProfileId, card, action) => {
    try {
      if (targetProfileId === profile.id) return;

      if (isRecruiter) {
        const existingMatches1 = await base44.entities.Match.filter({ profile1_id: profile.id, profile2_id: targetProfileId }).catch(() => []);
        const existingMatches2 = await base44.entities.Match.filter({ profile1_id: targetProfileId, profile2_id: profile.id }).catch(() => []);
        if (existingMatches1.length > 0 || existingMatches2.length > 0) return;
      }

      const mutualSwipes = await base44.entities.Swipe.filter({
        swiper_profile_id: targetProfileId,
        target_profile_id: profile.id,
      });
      console.log('mutual swipes found:', mutualSwipes);
      const hasMutualLike = mutualSwipes.some(s => s.action === 'like' || s.action === 'super');
      if (!hasMutualLike) return;

      const existingAs1 = await base44.entities.Match.filter({
        profile1_id: profile.id,
        profile2_id: targetProfileId,
        job_id: isRecruiter ? null : card.id,
      });
      const existingAs2 = await base44.entities.Match.filter({
        profile1_id: targetProfileId,
        profile2_id: profile.id,
        job_id: isRecruiter ? null : card.id,
      });

      if (existingAs1.length > 0 || existingAs2.length > 0) return;

      const match = await base44.entities.Match.create({
        profile1_id: profile.id,
        profile2_id: targetProfileId,
        profile1_user_id: profile.created_by_id,
        profile2_user_id: card.created_by_id,
        job_id: isRecruiter ? null : card.id,
        job_title: isRecruiter ? (card.current_role || 'New Role') : card.title,
        company_name: isRecruiter ? (card.current_company || '') : card.company,
        profile1_name: profile.full_name,
        profile2_name: isRecruiter ? card.full_name : (card.recruiter_name || card.company),
        profile1_picture: profile.profile_picture || '',
        profile2_picture: card.profile_picture || '',
        profile1_role: profile.current_role || '',
        profile2_role: isRecruiter ? (card.current_role || '') : (card.recruiter_name || ''),
        profile1_linkedin: profile.linkedin_url || '',
        profile2_linkedin: isRecruiter ? (card.linkedin_url || '') : (card.recruiter_linkedin || ''),
        status: 'active',
      });

      const mySkills = profile.skills || [];
      const theirSkills = card.skills || [];
      const sharedSkills = mySkills.filter(s => theirSkills.includes(s)).slice(0, 3);

      setMatchData({ ...match, sharedSkills });
    } catch {
      // ignore match errors
    }
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
            className="w-11 h-11 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={18} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-full bg-brand-green-light flex items-center justify-center text-[11px] font-semibold text-primary overflow-hidden border border-border/50 shadow-sm cursor-pointer"
          >
            {profile?.profile_picture ? (
              <img src={profile.profile_picture} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
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
        <div className="flex items-center justify-center gap-6 pb-4 pt-2">
          <motion.button
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => handleButtonClick('pass')}
            className="w-[58px] h-[58px] rounded-full bg-card border border-destructive/20 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.12)]"
          >
            <X size={26} className="text-red-500" strokeWidth={2.5} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.82, y: -4 }}
            whileHover={{ scale: 1.12, y: -2 }}
            onClick={() => handleButtonClick('super')}
            className="w-[50px] h-[50px] rounded-full bg-gold flex items-center justify-center shadow-[0_8px_24px_rgba(245,158,11,0.3)]"
          >
            <Star size={22} className="text-white" fill="white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.82 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => handleButtonClick('like')}
            className="w-[58px] h-[58px] rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-[0_8px_24px_rgba(22,101,52,0.2)]"
          >
            <Heart size={26} className="text-white" fill="white" />
          </motion.button>
        </div>
      )}

      {/* Match overlay */}
      <AnimatePresence>
        {matchData && (
          <MatchOverlay
            match={matchData}
            onMessage={() => {
              setMatchData(null);
              navigate(`/messages/${matchData.id}`);
            }}
            onKeepSwiping={() => setMatchData(null)}
          />
        )}
      </AnimatePresence>

      {/* Interest level picker */}
      <AnimatePresence>
        {pendingLike && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col justify-end bg-black/30"
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className="bg-card rounded-t-3xl p-6 pb-8"
            >
              <h3 className="text-[16px] font-semibold text-foreground text-center mb-1">How interested are you?</h3>
              <p className="text-[13px] text-muted-foreground text-center mb-5">Let the recruiter know your level of interest</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { level: 'high', label: 'High Interest', desc: 'This is a top choice for me', color: 'border-green-500 text-green-700 bg-green-50' },
                  { level: 'medium', label: 'Interested', desc: "I'd like to learn more", color: 'border-blue-400 text-blue-700 bg-blue-50' },
                  { level: 'low', label: 'Slightly Interested', desc: 'Open to it, but not a priority', color: 'border-orange-400 text-orange-700 bg-orange-50' },
                ].map(({ level, label, desc, color }) => (
                  <button
                    key={level}
                    onClick={() => confirmLike(level)}
                    className={`w-full border-2 rounded-2xl px-4 py-3 text-left transition-all hover:opacity-90 ${color}`}
                  >
                    <div className="text-[14px] font-semibold">{label}</div>
                    <div className="text-[12px] opacity-70">{desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPendingLike(null)}
                className="w-full mt-3 text-[13px] text-muted-foreground py-2"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter sheet */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        isRecruiter={isRecruiter}
      />
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
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
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
      <button
        onClick={onRefresh}
        className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}