import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center bg-white">
    <div className="w-7 h-7 border-2 border-secondary border-t-primary rounded-full animate-spin" />
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  // If auth check is complete, show content immediately (don't wait for isLoadingAuth)
  if (authChecked) {
    if (authError) {
      if (authError.type === 'user_not_registered') {
        return <UserNotRegisteredError />;
      }
      return unauthenticatedElement;
    }

    if (!isAuthenticated) {
      return unauthenticatedElement;
    }

    return <Outlet />;
  }

  // Only show loading if auth check is still pending
  if (isLoadingAuth) {
    return fallback;
  }

  return fallback;
}