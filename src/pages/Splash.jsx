import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const init = async () => {
      let dest = '/landing';

      if (sessionStorage.getItem('just_logged_out') === 'true') {
        sessionStorage.removeItem('just_logged_out');
      } else if (isAuthenticated && user) {
        try {
          const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
          if (profiles.length > 0 && profiles[0].onboarding_complete) {
            dest = '/discover';
          } else {
            dest = '/onboarding/account-type';
          }
        } catch {
          // Authenticated but profile check failed — go to onboarding, not landing
          dest = '/onboarding/account-type';
        }
      }

      setTimeout(() => setFading(true), 2200);
      setTimeout(() => navigate(dest, { replace: true }), 2700);
    };
    init();
  }, [navigate, isAuthenticated, user]);

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: fading ? 0 : 1, scale: fading ? 0.95 : 1 }}
        transition={{ duration: fading ? 0.5 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <Logo size="xl" tagline taglineText="Smarter hiring. Mutual fit." showBar animate />
      </motion.div>
    </div>
  );
}