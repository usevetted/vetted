import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Heart, MessageCircle, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

const navItems = [
  { icon: LayoutGrid, label: 'Discover', path: '/discover' },
  { icon: Heart, label: 'Matches', path: '/matches' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadProfile = async (attempt = 0) => {
      // If user is null (signed out), exit immediately and let ProtectedRoute handle redirect
      if (!user) {
        setLoading(false);
        return;
      }
      if (attempt === 0) {
        setLoading(true);
        setError(false);
      }
      try {
        const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
        if (profiles.length === 0 || !profiles[0].onboarding_complete) {
          navigate('/onboarding/account-type', { replace: true });
          return;
        }
        setProfile(profiles[0]);
        try {
          await base44.auth.updateMe({ profile_id: profiles[0].id });
        } catch {
          // ignore
        }
      } catch (err) {
        if (attempt < 2) {
          setTimeout(() => loadProfile(attempt + 1), 800);
        } else {
          setError(true);
        }
        return;
      }
      setLoading(false);
    };
    loadProfile();
  }, [user, navigate, retryCount]);

  if (loading || (!profile && !error)) {
    return <LoadingScreen />;
  }

  if (error) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4 px-8">
        <p className="text-[14px] text-muted-foreground text-center">Couldn't load your profile. Please check your connection.</p>
        <button
          onClick={() => setRetryCount(c => c + 1)}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background overflow-hidden">
      <div className="w-full h-[100dvh] relative flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden flex flex-col pt-[env(safe-area-inset-top)] min-h-0">
          <Outlet context={{ profile, setProfile }} />
        </main>
        <nav className="sticky bottom-0 z-50 bg-background/90 glass border-t border-border/50 px-2 pb-[env(safe-area-inset-bottom)] flex-shrink-0">
          <div className="flex items-center justify-around max-w-[600px] mx-auto py-2">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 px-5 py-1.5 transition-colors group"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-colors ${active ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-muted-foreground'}`}
                  />
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-colors ${
                      active ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}