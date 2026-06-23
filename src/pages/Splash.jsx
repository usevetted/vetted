import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';

export default function Splash() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (sessionStorage.getItem('just_logged_out') === 'true') {
        sessionStorage.removeItem('just_logged_out');
        setTimeout(() => setFading(true), 2600);
        setTimeout(() => navigate('/landing'), 3100);
        return;
      }
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (isAuthed) {
          const user = await base44.auth.me();
          if (!user) throw new Error('No user');
          const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
          if (profiles.length > 0 && profiles[0].onboarding_complete) {
            navigate('/discover', { replace: true });
            return;
          }
          navigate('/onboarding/account-type', { replace: true });
          return;
        }
      } catch {
        // Not authenticated — fall through to landing
      }
      setTimeout(() => setFading(true), 2600);
      setTimeout(() => navigate('/landing'), 3100);
    };
    init();
  }, [navigate]);

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