import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { SKILLS_LIST } from '@/lib/profileConstants';

export default function FilterSheet({ open, onClose, filters, setFilters, isRecruiter }) {
  const toggleWorkArrangement = (type) => {
    if (type === 'remote') {
      setFilters({ ...filters, remoteOnly: true, inPersonOnly: false });
    } else if (type === 'inPerson') {
      setFilters({ ...filters, remoteOnly: false, inPersonOnly: true });
    } else {
      setFilters({ ...filters, remoteOnly: false, inPersonOnly: false });
    }
  };

  const toggleBtn = (active) =>
    `flex items-center justify-center h-[40px] rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
      active ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
    }`;

  const isBoth = !filters.remoteOnly && !filters.inPersonOnly;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 pb-8 z-50 shadow-2xl"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-foreground">Filters</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar">
              {/* Work arrangement — job seekers */}
              {!isRecruiter && (
                <div>
                  <label className="text-[12px] font-medium text-foreground/70 mb-2.5 block">Work arrangement</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className={toggleBtn(filters.remoteOnly && !filters.inPersonOnly)}
                      onClick={() => toggleWorkArrangement('remote')}
                    >
                      Remote
                    </button>
                    <button
                      className={toggleBtn(filters.inPersonOnly && !filters.remoteOnly)}
                      onClick={() => toggleWorkArrangement('inPerson')}
                    >
                      In-person
                    </button>
                    <button
                      className={toggleBtn(isBoth)}
                      onClick={() => toggleWorkArrangement('both')}
                    >
                      Both
                    </button>
                  </div>
                </div>
              )}

              {/* Distance slider — job seekers */}
              {!isRecruiter && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[12px] font-medium text-foreground/70">Distance</label>
                    <span className="text-[12px] font-semibold text-primary">{filters.distance} mi</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={filters.distance}
                    onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1">
                    <span>5 mi</span>
                    <span>100 mi</span>
                  </div>
                </div>
              )}

              {/* Location input — recruiters */}
              {isRecruiter && (
                <div>
                  <label className="text-[12px] font-medium text-foreground/70 mb-1.5 block">Job location</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                    <input
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      placeholder="City, State"
                      className="w-full h-[44px] border border-input rounded-xl pl-10 pr-3.5 text-[14px] bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-1.5">Filter candidates near this location</p>
                </div>
              )}

              {/* Open to work — recruiters */}
              {isRecruiter && (
                <label className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl cursor-pointer">
                  <div>
                    <div className="text-[14px] font-medium text-foreground">Open to work</div>
                    <div className="text-[12px] text-muted-foreground">Candidates open to opportunities</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.openToWork}
                    onChange={(e) => setFilters({ ...filters, openToWork: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </label>
              )}

              {/* Skills — recruiters */}
              {isRecruiter && (
                <div>
                  <label className="text-[12px] font-medium text-foreground/70 mb-2.5 block">Skills</label>
                  <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto no-scrollbar">
                    {SKILLS_LIST.map(skill => {
                      const selected = filters.skills?.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => {
                            const current = filters.skills || [];
                            setFilters({
                              ...filters,
                              skills: selected
                                ? current.filter(s => s !== skill)
                                : [...current, skill],
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                            selected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sort by — everyone */}
              <div>
                <label className="text-[12px] font-medium text-foreground/70 mb-2 block">Sort by</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={toggleBtn(filters.sortBy === 'newest')}
                    onClick={() => setFilters({ ...filters, sortBy: 'newest' })}
                  >
                    Newest
                  </button>
                  <button
                    className={toggleBtn(filters.sortBy === 'oldest')}
                    onClick={() => setFilters({ ...filters, sortBy: 'oldest' })}
                  >
                    Oldest
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full h-[48px] bg-primary text-white rounded-2xl text-[15px] font-medium mt-6 hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}