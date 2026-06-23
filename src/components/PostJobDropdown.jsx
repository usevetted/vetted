import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase } from 'lucide-react';

export default function PostJobDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <Plus size={18} className="text-white" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 bg-white dark:bg-card border border-border/50 rounded-2xl shadow-lg p-2 w-48 z-50"
          >
            <button
              onClick={() => {
                navigate('/post-job');
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase size={16} className="text-primary" />
              </div>
              <span className="text-[14px] font-medium text-foreground">Post a Job</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}