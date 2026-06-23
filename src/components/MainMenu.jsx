import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function MainMenu({ open, onClose }) {
  const [level, setLevel] = useState('main');
  const { theme, setTheme } = useTheme();

  const handleMenuClick = (item) => {
    setLevel(item);
  };

  const handleBack = () => {
    setLevel('main');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/30"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-[210] w-[280px] bg-white flex flex-col pt-[env(safe-area-inset-top)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              {level !== 'main' && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-[14px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X size={20} className="text-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {level === 'main' && (
                <MainMenu.MainLevel onNavigate={handleMenuClick} />
              )}
              {level === 'settings' && (
                <MainMenu.SettingsLevel />
              )}
              {level === 'security' && (
                <MainMenu.SecurityLevel />
              )}
              {level === 'device' && (
                <MainMenu.DeviceLevel theme={theme} setTheme={setTheme} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

MainMenu.MainLevel = ({ onNavigate }) => (
  <div className="py-2 space-y-0">
    {[
      { id: 'settings', label: 'Account Settings' },
      { id: 'security', label: 'Account Security' },
      { id: 'device', label: 'Device Settings' },
    ].map(item => (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left border-b border-border/30 last:border-0"
      >
        <span className="text-[15px] font-medium text-foreground">{item.label}</span>
        <ChevronRight size={18} className="text-muted-foreground/50" />
      </button>
    ))}
  </div>
);

MainMenu.SettingsLevel = () => (
  <div className="py-2 space-y-0">
    <div className="px-5 py-3.5 border-b border-border/30">
      <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Profile</h3>
      <div className="space-y-2.5">
        <div className="text-[13px] text-foreground/70">Full Name</div>
        <div className="text-[13px] text-foreground/70">Email Address</div>
        <div className="text-[13px] text-foreground/70">Profile Photo</div>
        <div className="text-[13px] text-foreground/70">Notification Preferences</div>
      </div>
    </div>
  </div>
);

MainMenu.SecurityLevel = () => (
  <div className="py-2 space-y-0">
    <div className="px-5 py-3.5 border-b border-border/30">
      <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Security</h3>
      <div className="space-y-2.5">
        <div className="text-[13px] text-foreground/70">Change Password</div>
        <div className="text-[13px] text-foreground/70">Two-Factor Authentication</div>
        <div className="text-[13px] text-foreground/70">Active Sessions</div>
      </div>
    </div>
  </div>
);

MainMenu.DeviceLevel = ({ theme, setTheme }) => (
  <div className="py-2 space-y-0">
    <div className="px-5 py-3.5 border-b border-border/30">
      <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Display</h3>
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-3">
          {theme === 'dark' ? (
            <Moon size={18} className="text-foreground" />
          ) : (
            <Sun size={18} className="text-foreground" />
          )}
          <span className="text-[13px] font-medium text-foreground">Dark Mode</span>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
            theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  </div>
);