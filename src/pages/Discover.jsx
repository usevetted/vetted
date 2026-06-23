import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart, Star, SlidersHorizontal, Plus, Briefcase } from 'lucide-react';
import Logo from '@/components/Logo';
import SwipeCard from '@/components/SwipeCard';
import MatchOverlay from '@/components/MatchOverlay';
import FilterSheet from '@/components/FilterSheet';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';
import PullToRefresh from '@/components/PullToRefresh';

export default function Discover() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [triggerAction, setTriggerAction] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ remoteOnly: false, inPersonOnly: false, openToWork: false, sortBy: 'newest', distance: 50, location: '' });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const isRecruiter = useMemo(() => profile?.account_type === 'recruiter', [profile?.account_type]);

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
        const filtered = allProfiles.filter(p => p.id !== profile.id && p.created_by_id !== profile.created_by_id && !swipedProfileIds.has(p.id));
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

    setAllCards(prev => prev.filter(c => c.id !== currentCard.id));

    if (action === 'like' || action === 'super') {
      try {
        const response = await base44.functions.invoke('processSwipe', {
          target_profile_id: targetProfileId,
          action,
          context_job_id: contextJobId,
          target_type: targetType,
        });
        const data = response.data || response;
        if (data.matched && data.match) {
          setMatchData(data.match);
        }
      } catch {
        // ignore
      }
    } else {
      try {
        await base44.entities.Swipe.create({
          swiper_profile_id: profile.id,
          target_profile_id: targetProfileId,
          target_type: targetType,
          action,
          context_job_id: contextJobId,
        });
      } catch {
        // ignore
      }
    }
  };

  const handleButtonClick = (action) => {
    if (triggerAction || cards.length === 0) return;
    setTriggerAction(action);
  };

  const initials = useMemo(() => profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U', [profile?.full_name]);

  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target) && !profileButtonRef.current?.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <PullToRefresh onRefresh={loadCards} className="flex-1 flex flex-col bg-secondary/30 min-h-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 relative z-10">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="w-11 h-11 rounded-full bg-white border border-border/50 flex items-center justify-center shadow-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={18} className="text-muted-foreground" />
          </button>
          
          {/* Profile dropdown */}
          <div className="relative">
            <button
              ref={profileButtonRef}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-11 h-11 rounded-full bg-brand-green-light flex items-center justify-center text-[12px] font-semibold text-primary overflow-hidden border border-border/50 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              {profile?.profile_picture ? (
                <img src={profile.profile_picture} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  ref={profileDropdownRef}
                  initial={{ opacity: 0, scale: 0.8, y: -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -12 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute top-full right-0 mt-3 bg-white dark:bg-card border border-border/50 rounded-3xl shadow-lg p-3 w-44 z-50"
                >
                  {isRecruiter && (
                    <button
                      onClick={() => {
                        navigate('/post-job');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Plus size={16} className="text-primary" />
                      </div>
                      <span className="text-[13px] font-medium text-foreground">Post Job</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate('/profile-settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <SlidersHorizontal size={16} className="text-muted-foreground" />
                    </div>
                    <span className="text-[13px] font-medium text-foreground">Settings</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-3 relative min-h-0">
        {cards.length === 0 && !loading ? (
          <EmptyState onRefresh={loadCards} />
        ) : loading ? null : (
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
    </PullToRefresh>
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