import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function FilterSheet({ open, onClose, filters, setFilters, isRecruiter }) {
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
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-8 z-50 shadow-2xl"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-foreground">Filters</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {!isRecruiter && (
                <label className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl cursor-pointer">
                  <div>
                    <div className="text-[14px] font-medium text-foreground">Remote only</div>
                    <div className="text-[12px] text-muted-foreground">Show remote jobs</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary"
                  />
                </label>
              )}
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
              <div>
                <label className="text-[12px] font-medium text-foreground/70 mb-2 block">Sort by</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full h-[44px] border border-input rounded-xl px-3.5 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
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