import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';

export default function MatchOverlay({ match, onMessage, onKeepSwiping }) {
  if (!match) return null;

  const leftInitial = (match.profile1_name || 'Y').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const rightInitial = (match.profile2_name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/30 glass" />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white rounded-[28px] mx-6 px-8 py-10 flex flex-col items-center text-center max-w-[340px] w-full shadow-[0_20px_80px_rgba(0,0,0,0.15)]"
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-script text-4xl text-primary font-bold mb-1"
        >
          It's a Match
        </motion.h2>
        <p className="text-[12px] text-muted-foreground mb-7">Both sides showed interest</p>

        <div className="flex items-center justify-center mb-7">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-16 h-16 rounded-full bg-blue-50 border-[3px] border-white flex items-center justify-center text-lg font-bold text-blue-700 shadow-md z-10"
          >
            {match.profile1_picture ? (
              <img src={match.profile1_picture} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              leftInitial
            )}
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
            className="w-10 h-10 rounded-full bg-brand-green-light border-2 border-white flex items-center justify-center mx-[-10px] z-20 shadow-md"
          >
            <Heart size={16} className="text-primary fill-primary" />
          </motion.div>
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-16 h-16 rounded-full bg-pink-50 border-[3px] border-white flex items-center justify-center text-lg font-bold text-pink-600 shadow-md z-10"
          >
            {match.profile2_picture ? (
              <img src={match.profile2_picture} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              rightInitial
            )}
          </motion.div>
        </div>

        {match.job_title && (
          <p className="text-[13px] text-foreground mb-1 max-w-[220px] leading-relaxed">
            You and <strong>{match.company_name || 'the team'}</strong> want to connect for <strong>{match.job_title}</strong>
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/70 mb-7">Reach out before this opportunity passes</p>

        <button
          onClick={onMessage}
          className="w-full h-12 bg-primary text-white rounded-2xl text-[14px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <MessageCircle size={16} />
          Send a Message
        </button>
        <button
          onClick={onKeepSwiping}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/30"
        >
          Keep Swiping
        </button>
      </motion.div>
    </motion.div>
  );
}