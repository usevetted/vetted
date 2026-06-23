import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, MessageCircle, Bell } from 'lucide-react';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { profile, setProfile } = useOutletContext();
  const [saving, setSaving] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [allowMessages, setAllowMessages] = useState(true);
  const [notifyOnViews, setNotifyOnViews] = useState(true);
  const [notifyOnMatches, setNotifyOnMatches] = useState(true);
  const [notifyOnMessages, setNotifyOnMessages] = useState(true);

  useEffect(() => {
    if (profile) {
      setProfileVisibility(profile.profile_visibility || 'public');
      setAllowMessages(profile.allow_messages !== false);
      setNotifyOnViews(profile.notify_on_profile_views !== false);
      setNotifyOnMatches(profile.notify_on_matches !== false);
      setNotifyOnMessages(profile.notify_on_messages !== false);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Profile.update(profile.id, {
        profile_visibility: profileVisibility,
        allow_messages: allowMessages,
        notify_on_profile_views: notifyOnViews,
        notify_on_matches: notifyOnMatches,
        notify_on_messages: notifyOnMessages,
      });
      setProfile(updated);
      navigate('/profile');
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (setting) => {
    switch (setting) {
      case 'visibility':
        setProfileVisibility(profileVisibility === 'public' ? 'private' : 'public');
        break;
      case 'messages':
        setAllowMessages(!allowMessages);
        break;
      case 'views':
        setNotifyOnViews(!notifyOnViews);
        break;
      case 'matches':
        setNotifyOnMatches(!notifyOnMatches);
        break;
      case 'notifications':
        setNotifyOnMessages(!notifyOnMessages);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 relative z-10">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2">
          <ArrowLeft size={20} className="text-primary" />
        </button>
        <Logo size="sm" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[13px] font-medium text-primary px-4 py-2.5 rounded-xl hover:bg-brand-green-bg transition-colors disabled:opacity-40 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-8 space-y-6">
        <div>
          <h2 className="text-[18px] font-semibold text-foreground mb-1">Profile Settings</h2>
          <p className="text-[13px] text-muted-foreground">Manage your profile visibility and preferences</p>
        </div>

        {/* Privacy Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Privacy</h3>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              {profileVisibility === 'public' ? (
                <Eye size={18} className="text-primary" />
              ) : (
                <EyeOff size={18} className="text-muted-foreground" />
              )}
              <div>
                <div className="text-[13px] font-medium text-foreground">Profile Visibility</div>
                <div className="text-[12px] text-muted-foreground">
                  {profileVisibility === 'public' ? 'Visible to everyone' : 'Only visible to matches'}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('visibility')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${profileVisibility === 'public' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${profileVisibility === 'public' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-muted-foreground" />
              <div>
                <div className="text-[13px] font-medium text-foreground">Allow Messages</div>
                <div className="text-[12px] text-muted-foreground">
                  {allowMessages ? 'Anyone can message you' : 'Messages disabled'}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('messages')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${allowMessages ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${allowMessages ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Notification Section */}
        <div className="space-y-3">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h3>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-muted-foreground" />
              <div>
                <div className="text-[13px] font-medium text-foreground">Profile Views</div>
                <div className="text-[12px] text-muted-foreground">Get notified when someone views your profile</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('views')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifyOnViews ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifyOnViews ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-muted-foreground" />
              <div>
                <div className="text-[13px] font-medium text-foreground">Matches</div>
                <div className="text-[12px] text-muted-foreground">Get notified when you match with someone</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('matches')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifyOnMatches ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifyOnMatches ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-muted-foreground" />
              <div>
                <div className="text-[13px] font-medium text-foreground">Messages</div>
                <div className="text-[12px] text-muted-foreground">Get notified when you receive a message</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('notifications')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifyOnMessages ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifyOnMessages ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}