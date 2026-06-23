import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Smartphone, LogOut, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';

export default function AccountSecurity() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangePhone, setShowChangePhone] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUser = useCallback(async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useState(() => {
    loadUser();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await base44.auth.changePassword({ currentPassword, newPassword });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      setError('Please enter a new email');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await base44.auth.changeEmail({ newEmail });
      setSuccess('Verification email sent to your new email address');
      setNewEmail('');
      setShowChangeEmail(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change email');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setSaving(true);
    try {
      await base44.auth.signOutAllDevices();
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || 'Failed to sign out all devices');
      setSaving(false);
    }
  };

  const inputClass = "w-full h-[44px] border border-input rounded-xl px-3.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "text-[12px] font-medium text-foreground/70 mb-1.5 block";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 relative z-10">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2">
          <ArrowLeft size={20} className="text-primary" />
        </button>
        <Logo size="sm" />
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="px-6 pb-8 space-y-6">
        <div>
          <h2 className="text-[18px] font-semibold text-foreground mb-1">Account Security</h2>
          <p className="text-[13px] text-muted-foreground">Manage your email, phone, and password</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
            <AlertCircle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <p className="text-[13px] text-primary font-medium">{success}</p>
          </div>
        )}

        {/* Email Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Email</h3>
          <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail size={16} className="text-primary" />
              </div>
              <div>
                <div className="text-[13px] font-medium text-foreground">{user?.email}</div>
                <div className="text-[12px] text-muted-foreground">Verified</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowChangeEmail(!showChangeEmail)}
            className="w-full text-[13px] font-medium text-primary px-4 py-3 rounded-xl hover:bg-brand-green-bg transition-colors"
          >
            Change Email
          </button>

          {showChangeEmail && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
              <div>
                <label className={labelClass}>New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={inputClass}
                  placeholder="new.email@example.com"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleChangeEmail}
                  disabled={saving}
                  className="flex-1 text-[13px] font-medium text-white px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  {saving ? 'Sending...' : 'Send Verification Link'}
                </button>
                <button
                  onClick={() => setShowChangeEmail(false)}
                  className="flex-1 text-[13px] font-medium text-foreground px-4 py-2.5 rounded-xl hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Password</h3>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="w-full text-[13px] font-medium text-primary px-4 py-3 rounded-xl hover:bg-brand-green-bg transition-colors flex items-center justify-between"
          >
            <span>Change Password</span>
            <Lock size={16} />
          </button>

          {showChangePassword && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Enter a new password"
                />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Confirm your new password"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1 text-[13px] font-medium text-white px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 text-[13px] font-medium text-foreground px-4 py-2.5 rounded-xl hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Phone Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</h3>
          <button
            onClick={() => setShowChangePhone(!showChangePhone)}
            className="w-full text-[13px] font-medium text-primary px-4 py-3 rounded-xl hover:bg-brand-green-bg transition-colors flex items-center justify-between"
          >
            <span>Add or Change Phone Number</span>
            <Smartphone size={16} />
          </button>

          {showChangePhone && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={inputClass}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 text-[13px] font-medium text-white px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40"
                  disabled={saving}
                >
                  {saving ? 'Verifying...' : 'Verify Phone'}
                </button>
                <button
                  onClick={() => setShowChangePhone(false)}
                  className="flex-1 text-[13px] font-medium text-foreground px-4 py-2.5 rounded-xl hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sessions Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Active Sessions</h3>
          <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-foreground">Current Device</div>
              <div className="text-[12px] text-muted-foreground">This browser</div>
            </div>
          </div>
          <button
            onClick={handleSignOutAllDevices}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-destructive px-4 py-3 rounded-xl hover:bg-destructive/5 transition-colors disabled:opacity-40"
          >
            <LogOut size={16} />
            Sign Out All Devices
          </button>
        </div>
      </div>
    </div>
  );
}