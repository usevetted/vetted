import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NavigationProvider } from '@/lib/NavigationContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public pages (eager load)
import Splash from './pages/Splash';
import Landing from './pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import PostLogin from './pages/PostLogin';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Onboarding pages (eager load)
import AccountType from './pages/AccountType';
import ProfileSetup from './pages/ProfileSetup';

// Layouts (eager load)
import AppLayout from './components/AppLayout';

// Lazy-loaded app pages for code splitting
const Discover = lazy(() => import('./pages/Discover'));
const Matches = lazy(() => import('./pages/Matches'));
const Messages = lazy(() => import('./pages/Messages'));
const Chat = lazy(() => import('./pages/Chat'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const AccountSecurity = lazy(() => import('./pages/AccountSecurity'));
const PostJob = lazy(() => import('./pages/PostJob'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Handle auth_required via useEffect — calling a redirect during render
  // is a React anti-pattern that causes double-fires in StrictMode
  useEffect(() => {
    if (authError?.type === 'auth_required') {
      navigateToLogin();
    }
  }, [authError, navigateToLogin]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <LoadingScreen />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return null; // useEffect handles the redirect
    }
  }

  const isPublicRoute = ['/', '/landing', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <AnimatePresence mode="wait">
    <motion.div
      key={isPublicRoute ? location.pathname : 'app'}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
    <Routes location={location}>
      {/* Public routes */}
      <Route path="/" element={<Splash />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/post-login" element={<PostLogin />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* Protected routes - onboarding (no layout) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding/account-type" element={<AccountType />} />
        <Route path="/onboarding/profile-setup" element={<ProfileSetup />} />

        {/* Protected routes - main app (with layout) */}
        <Route element={<AppLayout />}>
          <Route path="/discover" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><Discover /></Suspense>} />
          <Route path="/matches" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><Matches /></Suspense>} />
          <Route path="/messages" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><Messages /></Suspense>} />
          <Route path="/messages/:matchId" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><Chat /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><ProfilePage /></Suspense>} />
          <Route path="/profile-settings" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><ProfileSettings /></Suspense>} />
          <Route path="/account-security" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><AccountSecurity /></Suspense>} />
          <Route path="/post-job" element={<Suspense fallback={<LoadingScreen fullscreen={false} />}><PostJob /></Suspense>} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </motion.div>
    </AnimatePresence>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <NavigationProvider>
              <AuthenticatedApp />
            </NavigationProvider>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App