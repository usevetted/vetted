import { motion } from 'framer-motion';

export default function Logo({ size = 'md', tagline, taglineText, showBar = false, animate = false }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl'
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.9 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : {}}
        transition={animate ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] } : {}}
        className={`font-script font-bold text-primary leading-none ${sizes[size]}`}
      >
        Vetted
      </motion.div>
      {tagline && (
        <motion.p
          initial={animate ? { opacity: 0, y: 8 } : false}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={animate ? { duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] } : {}}
          className="text-[12px] text-muted-foreground tracking-[0.08em] mt-1.5"
        >
          {taglineText || 'Smarter hiring. Mutual fit.'}
        </motion.p>
      )}
      {showBar && (
        <motion.div
          initial={animate ? { width: 0, opacity: 0 } : false}
          animate={animate ? { width: 36, opacity: 1 } : {}}
          transition={animate ? { duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] } : {}}
          className="h-[3px] bg-primary rounded-full mt-5"
        />
      )}
    </div>
  );
}