import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-secondary/60 via-secondary/40 to-brand-green-bg/40 flex justify-center overflow-y-auto no-scrollbar">
      <div className="w-full max-w-[440px] flex flex-col items-center px-8 pt-[16vh] pb-12 h-[100dvh] shadow-[0_0_60px_rgba(0,0,0,0.06)]">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <Logo size="xl" tagline taglineText="Your next role. One swipe away." />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center mt-[10vh]"
        >
          <button
            onClick={() => navigate('/login')}
            className="w-full max-w-[260px] h-[52px] bg-primary text-white rounded-2xl text-[15px] font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full max-w-[260px] h-[52px] bg-transparent border-[1.5px] border-primary text-primary rounded-2xl text-[15px] font-medium hover:bg-brand-green-bg transition-colors mt-3"
          >
            Sign Up
          </button>
          <p className="text-[11px] text-muted-foreground/50 mt-6">
            By continuing you agree to our <Link to="/privacy-policy" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}