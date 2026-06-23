import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Heart, MessageCircle, User, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigation } from '@/lib/NavigationContext';
import Logo from '@/components/Logo';
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
  const { tabHistory, updateTabHistory, resetTabStack } = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadProfile = async (attempt = 0) => {
      if (!user) return;
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

  useEffect(() => {
    const rootPath = navItems.find(item => location.pathname.startsWith(item.path))?.path;
    if (rootPath) {
      updateTabHistory(rootPath, location.pathname);
    }
  }, [location.pathname, updateTabHistory]);

  // Determine if we're at a root tab screen
  const isRootScreen = navItems.some(item => location.pathname === item.path);
  const rootPath = navItems.find(item => location.pathname.startsWith(item.path))?.path;
  const activeTab = navItems.find(item => item.path === rootPath);

  const handleTabClick = (item) => {
    const isCurrentTab = location.pathname.startsWith(item.path);
    if (isCurrentTab && !isRootScreen) {
      // Reset to root if clicking active tab from non-root screen
      resetTabStack(item.path);
      navigate(item.path);
    } else if (!isCurrentTab) {
      // Navigate to saved history for this tab
      navigate(tabHistory[item.path]);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

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
        {/* Smart Header */}
        <header className="sticky top-0 z-40 bg-background/95 glass border-b border-border/50 px-4 py-3 flex items-center justify-between pt-[env(safe-area-inset-top)]" role="banner">
          <div className="flex items-center gap-3 flex-1">
            {!isRootScreen && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-muted/50 rounded-lg transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-primary" />
              </button>
            )}
            {isRootScreen && activeTab ? (
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-[14px] font-semibold text-foreground hidden sm:inline">{activeTab.label}</span>
              </div>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Outlet context={{ profile, setProfile }} />
        </main>

        {/* Bottom Navigation */}
        <nav
          className="sticky bottom-0 z-50 bg-background/90 glass border-t border-border/50 px-2 pb-[env(safe-area-inset-bottom)] flex-shrink-0"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-around max-w-[600px] mx-auto py-2">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleTabClick(item)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={`${item.label} tab`}
                  className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-3 py-2 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-colors ${active ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-muted-foreground'}`}
                  />
                  <span
                    className={`text-[12px] font-medium tracking-wide transition-colors ${
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