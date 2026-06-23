import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';

export default function PostLogin() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const route = async () => {
      if (!isAuthenticated || !user) {
        navigate('/landing', { replace: true });
        return;
      }
      try {
        const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
        if (profiles.length > 0 && profiles[0].onboarding_complete) {
          navigate('/discover', { replace: true });
        } else {
          navigate('/onboarding/account-type', { replace: true });
        }
      } catch {
        navigate('/onboarding/account-type', { replace: true });
      }
    };
    route();
  }, [navigate, isAuthenticated, user]);

  return <LoadingScreen />;
}