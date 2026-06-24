import { motion } from 'framer-motion';

export default function LoadingScreen({ fullscreen = true, label }) {
  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-[300] bg-background' : 'flex-1'} flex flex-col items-center justify-center gap-5`}>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.18,
            }}
          />
        ))}
      </div>
      {label && <p className="text-[12px] text-muted-foreground">{label}</p>}
    </div>
  );
}