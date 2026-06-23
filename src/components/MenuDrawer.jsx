import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Moon, Sun } from 'lucide-react';

export default function MenuDrawer({ open, onClose }) {
  const [activePanel, setActivePanel] = useState('main');
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const menuItems = [
    { id: 'account-settings', label: 'Account Settings', icon: null },
    { id: 'account-security', label: 'Account Security', icon: null },
    { id: 'device-settings', label: 'Device Settings', icon: null },
  ];

  const accountSettingsContent = [
    { label: 'Name', value: 'Edit in profile' },
    { label: 'Email', value: 'Update email' },
    { label: 'Profile Photo', value: 'Change photo' },
    { label: 'Notifications', value: 'Manage alerts' },
  ];

  const accountSecurityContent = [
    { label: 'Change Password', value: 'Update password' },
    { label: 'Two-Factor Authentication', value: 'Enable 2FA' },
    { label: 'Active Sessions', value: 'View & manage' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <motion.div
            initial={{ x: -360 }}
            animate={{ x: 0 }}
            exit={{ x: -360 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[320px] bg-white dark:bg-slate-950 overflow-y-auto no-scrollbar"
          >
            {/* Main Menu */}
            <AnimatePresence mode="wait">
              {activePanel === 'main' && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[18px] font-semibold text-foreground">Menu</h2>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X size={20} className="text-foreground" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {menuItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActivePanel(item.id)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-muted transition-colors text-left"
                      >
                        <span className="text-[15px] font-medium text-foreground">
                          {item.label}
                        </span>
                        <ChevronRight size={18} className="text-muted-foreground/50" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Account Settings Panel */}
              {activePanel === 'account-settings' && (
                <motion.div
                  key="account-settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setActivePanel('main')}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronLeft size={20} className="text-foreground" />
                    </button>
                    <h2 className="text-[18px] font-semibold text-foreground">
                      Account Settings
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {accountSettingsContent.map((item, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-muted/40 text-left"
                      >
                        <div className="text-[12px] font-medium text-muted-foreground mb-1">
                          {item.label}
                        </div>
                        <div className="text-[13px] text-foreground/70">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Account Security Panel */}
              {activePanel === 'account-security' && (
                <motion.div
                  key="account-security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setActivePanel('main')}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronLeft size={20} className="text-foreground" />
                    </button>
                    <h2 className="text-[18px] font-semibold text-foreground">
                      Account Security
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {accountSecurityContent.map((item, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-muted/40 text-left"
                      >
                        <div className="text-[12px] font-medium text-muted-foreground mb-1">
                          {item.label}
                        </div>
                        <div className="text-[13px] text-foreground/70">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Device Settings Panel */}
              {activePanel === 'device-settings' && (
                <motion.div
                  key="device-settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setActivePanel('main')}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronLeft size={20} className="text-foreground" />
                    </button>
                    <h2 className="text-[18px] font-semibold text-foreground">
                      Device Settings
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40">
                      <div className="flex items-center gap-3">
                        {darkMode ? (
                          <Moon size={18} className="text-primary" />
                        ) : (
                          <Sun size={18} className="text-primary" />
                        )}
                        <span className="text-[14px] font-medium text-foreground">
                          Dark Mode
                        </span>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                          darkMode ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            darkMode ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}