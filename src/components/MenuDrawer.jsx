import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Sun, Moon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/lib/ThemeContext';

export default function MenuDrawer({ open, onClose, user, profile }) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [expanded, setExpanded] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [emailForm, setEmailForm] = useState({ new: '', confirm: '' });
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showTwoFaSetup, setShowTwoFaSetup] = useState(false);
  const [twoFaQR, setTwoFaQR] = useState('');
  const [twoFaSecret, setTwoFaSecret] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaError, setTwoFaError] = useState('');
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [loadingTwoFaStatus, setLoadingTwoFaStatus] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Fetch actual 2FA status when drawer opens
    const fetchTwoFaStatus = async () => {
      setLoadingTwoFaStatus(true);
      try {
        const currentUser = await base44.auth.me();
        setTwoFaEnabled(currentUser?.two_fa_enabled || false);
      } catch {
        // Default to false if fetch fails
        setTwoFaEnabled(false);
      } finally {
        setLoadingTwoFaStatus(false);
      }
    };
    fetchTwoFaStatus();
  }, [open]);

  const handleToggleDarkMode = () => {
    toggleDarkMode(!darkMode);
  };

  const handleChangeEmail = async () => {
    setEmailError('');
    if (!emailForm.new || !emailForm.confirm) {
      setEmailError('Both fields are required');
      return;
    }
    if (emailForm.new !== emailForm.confirm) {
      setEmailError('Email addresses do not match');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.new)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailLoading(true);
    try {
      await base44.functions.invoke('changeEmail', { newEmail: emailForm.new });
      setEmailChangeSent(true);
      setEmailForm({ new: '', confirm: '' });
      setTimeout(() => {
        setEmailChangeSent(false);
        setShowEmailChange(false);
      }, 3000);
    } catch (err) {
      setEmailError(err?.message || 'Failed to send verification email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('All fields are required');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await base44.auth.changePassword(passwordForm.current, passwordForm.new);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowChangePassword(false);
    } catch (err) {
      setPasswordError(err?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setPasswordError('');
    setPasswordLoading(true);
    try {
      await base44.auth.resetPasswordRequest(user?.email);
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch (err) {
      setPasswordError(err?.message || 'Failed to send reset email');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (twoFaEnabled) {
      // Disable 2FA
      setShowTwoFaSetup(true);
      setTwoFaCode('');
      setTwoFaError('');
    } else {
      // Enable 2FA - fetch setup
      setTwoFaLoading(true);
      setTwoFaError('');
      try {
        const res = await base44.functions.invoke('setup2FA', {});
        setTwoFaQR(res.data.qrCode);
        setTwoFaSecret(res.data.secret);
        setShowTwoFaSetup(true);
      } catch (err) {
        setTwoFaError(err?.message || 'Failed to start 2FA setup');
      } finally {
        setTwoFaLoading(false);
      }
    }
  };

  const handleSubmitTwoFA = async () => {
    if (!twoFaCode || twoFaCode.length !== 6) {
      setTwoFaError('Code must be 6 digits');
      return;
    }
    setTwoFaLoading(true);
    try {
      if (twoFaEnabled) {
        // Disabling
        await base44.functions.invoke('disable2FA', { code: twoFaCode });
        setTwoFaEnabled(false);
        setShowTwoFaSetup(false);
        setTwoFaCode('');
      } else {
        // Enabling
        await base44.functions.invoke('verify2FASetup', {
          secret: twoFaSecret,
          code: twoFaCode,
        });
        setTwoFaEnabled(true);
        setShowTwoFaSetup(false);
        setTwoFaCode('');
        setTwoFaSecret('');
        setTwoFaQR('');
      }
    } catch (err) {
      setTwoFaError(err?.message || 'Invalid code');
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await base44.auth.logout();
      onClose();
      window.location.href = '/landing';
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await base44.auth.logout();
      onClose();
      window.location.href = '/landing';
    } catch {
      // ignore
    }
  };

  const toggleSection = (section) => {
    setExpanded(expanded === section ? null : section);
  };



  const menuItems = [
    {
      id: 'settings',
      label: 'Account Settings',
      options: [
        { label: 'Notification preferences', toggle: true, value: notificationsEnabled, onChange: setNotificationsEnabled },
      ],
    },
    {
      id: 'security',
      label: 'Account Security',
      options: [
        { label: 'Change password', action: 'changePassword' },
        { label: 'Active sessions', action: 'sessions' },
        { label: 'Deactivate Account', action: 'deactivate' },
        { label: 'Delete Account', action: 'delete' },
      ],
    },
    {
      id: 'device',
      label: 'Device Settings',
      options: [
        { label: 'Dark mode', toggle: true, value: darkMode, onChange: handleToggleDarkMode },
      ],
    },
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
            className="fixed inset-0 bg-black/30 z-[90]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-[340px] bg-card z-[100] flex flex-col rounded-l-2xl shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-border">
              <h2 className="text-[16px] font-semibold text-foreground">Menu</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-foreground" />
              </button>
            </div>

            {/* Menu sections */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {menuItems.map((section) => (
                <div key={section.id} className="border-b border-border/20 last:border-b-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-[14px] font-medium text-foreground">{section.label}</span>
                    <motion.div
                        animate={{ rotate: expanded === section.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-foreground/60" />
                      </motion.div>
                  </button>

                  <AnimatePresence>
                    {expanded === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-primary/5 border-t border-primary/20"
                      >
                        <div className="px-5 py-2">
                          {/* Account Settings content */}
                          {section.id === 'settings' && (
                            <div className="space-y-3">
                              <div className="space-y-2 pb-3 border-b border-border/30">
                                <p className="text-[13px] text-foreground font-medium">Email address</p>
                                <p className="text-[11px] text-muted-foreground">{user?.email || 'Not set'}</p>
                                <button
                                  onClick={() => setShowEmailChange(!showEmailChange)}
                                  className="text-[11px] font-medium text-primary hover:underline transition-colors"
                                >
                                  {showEmailChange ? 'Cancel' : 'Change email'}
                                </button>
                                {showEmailChange && (
                                  <div className="mt-2 p-3 bg-primary/5 rounded-lg space-y-2 border border-primary/20">
                                    {!emailChangeSent ? (
                                      <>
                                        <input
                                          type="email"
                                          placeholder="New email address"
                                          value={emailForm.new}
                                          onChange={(e) => setEmailForm({ ...emailForm, new: e.target.value })}
                                          className="w-full h-[36px] border border-input rounded-lg px-2.5 text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                        <input
                                          type="email"
                                          placeholder="Confirm email address"
                                          value={emailForm.confirm}
                                          onChange={(e) => setEmailForm({ ...emailForm, confirm: e.target.value })}
                                          className="w-full h-[36px] border border-input rounded-lg px-2.5 text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                        {emailError && <p className="text-[11px] text-destructive">{emailError}</p>}
                                        <button
                                          onClick={handleChangeEmail}
                                          disabled={emailLoading}
                                          className="w-full h-[34px] bg-primary text-white text-[12px] font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                        >
                                          {emailLoading ? 'Sending...' : 'Send Verification Email'}
                                        </button>
                                      </>
                                    ) : (
                                      <p className="text-[12px] text-green-600">Verification email sent to {emailForm.new}. Check your inbox to confirm the change.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              {section.options.map((opt, i) => (
                                <div key={i}>
                                  {opt.toggle && (
                                    <div className="flex items-center justify-between py-2">
                                      <span className="text-[13px] text-foreground">{opt.label}</span>
                                      <button
                                        onClick={() => opt.onChange(!opt.value)}
                                        className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ${opt.value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                      >
                                        <motion.div
                                          layout
                                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white ${opt.value ? 'right-0.5' : 'left-0.5'}`}
                                        />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Account Security content */}
                          {section.id === 'security' && (
                            <div className="space-y-3">
                              <div className="space-y-2 pb-3 border-b border-border/30">
                                <div className="flex items-center justify-between">
                                  <span className="text-[13px] font-medium text-foreground">Two-factor authentication</span>
                                  <button
                                    onClick={handleToggle2FA}
                                    disabled={twoFaLoading}
                                    className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 disabled:opacity-50 ${twoFaEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                  >
                                    <motion.div
                                      layout
                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white ${twoFaEnabled ? 'right-0.5' : 'left-0.5'}`}
                                    />
                                  </button>
                                </div>
                                {showTwoFaSetup && (
                                  <div className="mt-2 p-3 bg-primary/5 rounded-lg space-y-2 border border-primary/20">
                                    {twoFaQR && (
                                      <>
                                        <p className="text-[12px] text-foreground font-medium">Scan with Google Authenticator:</p>
                                        <img src={twoFaQR} alt="2FA QR Code" className="w-full max-w-[120px] mx-auto border border-primary rounded-lg" />
                                        <p className="text-[11px] text-muted-foreground text-center">Or enter this key manually:</p>
                                        <p className="text-[11px] font-mono bg-card p-2 rounded text-center text-foreground break-all">{twoFaSecret}</p>
                                      </>
                                    )}
                                    <p className="text-[12px] text-foreground">Enter the 6-digit code:</p>
                                    <input
                                      type="text"
                                      placeholder="000000"
                                      value={twoFaCode}
                                      onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                      maxLength="6"
                                      className="w-full h-[36px] border border-input rounded-lg px-2.5 text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center tracking-widest"
                                    />
                                    {twoFaError && <p className="text-[11px] text-destructive">{twoFaError}</p>}
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setShowTwoFaSetup(false);
                                          setTwoFaCode('');
                                          setTwoFaError('');
                                        }}
                                        className="flex-1 h-[32px] text-[12px] font-medium border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleSubmitTwoFA}
                                        disabled={twoFaLoading || twoFaCode.length !== 6}
                                        className="flex-1 h-[32px] text-[12px] font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                      >
                                        {twoFaLoading ? 'Verifying...' : twoFaEnabled ? 'Disable' : 'Enable'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                                          {section.options.map((opt, i) => (
                                <div key={i}>
                                  {opt.action === 'changePassword' && (
                                    <>
                                      <button
                                        onClick={() => setShowChangePassword(!showChangePassword)}
                                        className="text-[13px] text-foreground py-2.5 hover:text-primary transition-colors text-left"
                                      >
                                        {opt.label}
                                      </button>
                                      <div className="mt-1 mb-3">
                                        {!passwordResetSent && (
                                          <button
                                            onClick={handleForgotPassword}
                                            disabled={passwordLoading}
                                            className="text-[11px] text-primary hover:underline transition-colors disabled:opacity-50"
                                          >
                                            {passwordLoading ? 'Sending...' : 'Forgot password?'}
                                          </button>
                                        )}
                                        {passwordResetSent && (
                                          <p className="text-[11px] text-green-600">Reset link sent to your email</p>
                                        )}
                                      </div>
                                      {showChangePassword && (
                                        <div className="mt-2 p-3 bg-primary/5 rounded-lg space-y-2 border border-primary/20">
                                          <input
                                            type="password"
                                            placeholder="Current password"
                                            value={passwordForm.current}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                            className="w-full h-[36px] border border-input rounded-lg px-2.5 text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                          />
                                          <input
                                            type="password"
                                            placeholder="New password"
                                            value={passwordForm.new}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                            className="w-full h-[36px] border border-input rounded-lg px-2.5 text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                          />
                                          <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            className="w-full h-[36px] border border-input rounded-lg px-2.5 text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                          />
                                          {passwordError && <p className="text-[11px] text-destructive">{passwordError}</p>}
                                          <button
                                            onClick={handleChangePassword}
                                            disabled={passwordLoading}
                                            className="w-full h-[34px] bg-primary text-white text-[12px] font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                          >
                                            {passwordLoading ? 'Updating...' : 'Update Password'}
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {opt.action === 'sessions' && (
                                    <div>
                                      <p className="text-[13px] text-foreground py-2">{opt.label}</p>
                                      <p className="text-[12px] text-muted-foreground">Current device</p>
                                    </div>
                                  )}
                                  {opt.action === 'deactivate' && (
                                    <>
                                      <button
                                        onClick={() => setDeactivateConfirm(true)}
                                        className="text-[13px] text-pass py-2 hover:text-pass/80 transition-colors text-left"
                                      >
                                        {opt.label}
                                      </button>
                                      {deactivateConfirm && (
                                        <div className="mt-2 p-3 bg-pass/5 rounded-lg border border-pass/20 space-y-2">
                                          <p className="text-[12px] text-foreground/80">Your account will be deactivated immediately. You can reactivate it by logging back in.</p>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => setDeactivateConfirm(false)}
                                              className="flex-1 h-[32px] text-[12px] font-medium border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={handleDeactivate}
                                              className="flex-1 h-[32px] text-[12px] font-medium bg-pass text-white rounded-lg hover:bg-pass/90 transition-colors"
                                            >
                                              Deactivate
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {opt.action === 'delete' && (
                                    <>
                                      <button
                                        onClick={() => setDeleteConfirm(true)}
                                        className="text-[13px] text-destructive py-2 hover:text-destructive/80 transition-colors text-left"
                                      >
                                        {opt.label}
                                      </button>
                                      {deleteConfirm && (
                                        <div className="mt-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20 space-y-2">
                                          <p className="text-[12px] text-foreground/80"><strong>Warning:</strong> This action is permanent. You have a 14-day grace period to log back in and cancel the deletion. After 14 days, your account and all data will be permanently removed.</p>
                                          <p className="text-[11px] text-muted-foreground">Type "DELETE" to confirm:</p>
                                          <input
                                            type="text"
                                            placeholder='Type "DELETE" to confirm'
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            className="w-full h-[32px] border border-input rounded-lg px-2.5 text-[12px] bg-card focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive"
                                          />
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => {
                                                setDeleteConfirm(false);
                                                setDeleteConfirmText('');
                                              }}
                                              className="flex-1 h-[32px] text-[12px] font-medium border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={handleDelete}
                                              disabled={deleteConfirmText !== 'DELETE'}
                                              className="flex-1 h-[32px] text-[12px] font-medium bg-destructive text-white rounded-lg hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                              Delete Forever
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {opt.toggle && (
                                    <div className="flex items-center justify-between py-2">
                                      <span className="text-[13px] text-foreground">{opt.label}</span>
                                      <button
                                        onClick={() => opt.onChange(!opt.value)}
                                        className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ${opt.value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                      >
                                        <motion.div
                                          layout
                                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white ${opt.value ? 'right-0.5' : 'left-0.5'}`}
                                        />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Device Settings content */}
                          {section.id === 'device' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2">
                                  {darkMode ? (
                                    <Moon size={14} className="text-foreground/60" />
                                  ) : (
                                    <Sun size={14} className="text-foreground/60" />
                                  )}
                                  <span className="text-[13px] text-foreground">Dark mode</span>
                                </div>
                                <button
                                  onClick={handleToggleDarkMode}
                                  className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ${darkMode ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                  <motion.div
                                    layout
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white ${darkMode ? 'right-0.5' : 'left-0.5'}`}
                                  />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}