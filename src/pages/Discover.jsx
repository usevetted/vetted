import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart, Star, SlidersHorizontal } from 'lucide-react';
import Logo from '@/components/Logo';
import SwipeCard from '@/components/SwipeCard';
import MatchOverlay from '@/components/MatchOverlay';
import FilterSheet from '@/components/FilterSheet';
import { base44 } from '@/api/base44Client';

export default function Discover() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [triggerAction, setTriggerAction] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ remoteOnly: false, inPersonOnly: false, openToWork: false, sortBy: 'newest', distance: 50, location: '' });

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
    }
    if (filters.sortBy === 'oldest') {
      filtered.reverse();
    }
    return filtered;
  }, [allCards, filters, isRecruiter]);

  const loadCards = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const swipes = await base44.entities.Swipe.filter({ swiper_profile_id: profile.id });

      if (isRecruiter) {
        const allProfiles = await base44.entities.Profile.filter({ account_type: 'job_seeker' }, '-created_date', 50);
        const swipedProfileIds = new Set(swipes.map(s => s.target_profile_id));
        const filtered = allProfiles.filter(p => p.id !== profile.id && !swipedProfileIds.has(p.id));
        setAllCards(filtered);
      } else {
        const allJobs = await base44.entities.Job.list('-created_date', 50);
        const swipedJobIds = new Set(swipes.filter(s => s.context_job_id).map(s => s.context_job_id));
        const filtered = allJobs.filter(j => !swipedJobIds.has(j.id));
        setAllCards(filtered);
      }
    } catch {
      // ignore
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

    let targetProfileId, contextJobId, targetType;
    if (isRecruiter) {
      targetProfileId = currentCard.id;
      contextJobId = null;
      targetType = 'candidate';
    } else {
      targetProfileId = currentCard.recruiter_profile_id || currentCard.id;
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

    if (action === 'like' || action === 'super') {
      await checkForMatch(targetProfileId, currentCard, action);
    }
  };

  const checkForMatch = async (targetProfileId, card, action) => {
    try {
      const reciprocalSwipes = await base44.entities.Swipe.filter({
        swiper_profile_id: targetProfileId,
        target_profile_id: profile.id,
      });
      const reciprocalLike = reciprocalSwipes.find(s => s.action === 'like' || s.action === 'super');
      const shouldMatch = reciprocalLike || Math.random() < (action === 'super' ? 0.55 : 0.3);

      if (shouldMatch) {
        if (!reciprocalLike) {
          await base44.entities.Swipe.create({
            swiper_profile_id: targetProfileId,
            target_profile_id: profile.id,
            target_type: isRecruiter ? 'job' : 'candidate',
            action: 'like',
          });
        }

        const match = await base44.entities.Match.create({
          profile1_id: profile.id,
          profile2_id: targetProfileId,
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

        setMatchData(match);
      }
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
    <div className="flex-1 flex flex-col bg-secondary/30 min-h-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 relative z-10">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="w-9 h-9 rounded-full bg-white border border-border/50 flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
          >
            <SlidersHorizontal size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center text-[11px] font-semibold text-primary overflow-hidden border border-border/50 shadow-sm"
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
          <div className="w-7 h-7 border-2 border-secondary border-t-primary rounded-full animate-spin" />
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
            className="w-[58px] h-[58px] rounded-full bg-white border border-red-100 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.12)]"
          >
            <X size={26} className="text-red-500" strokeWidth={2.5} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.82, y: -4 }}
            whileHover={{ scale: 1.12, y: -2 }}
            onClick={() => handleButtonClick('super')}
            className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-[0_8px_24px_rgba(245,158,11,0.3)]"
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