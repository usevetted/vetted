import { AnimatePresence, motion } from 'framer-motion';
import PostJobForm from '@/components/PostJobForm';

export default function PostJobModal({ open, onClose, onSuccess, recruiterProfile }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[95]"
          />
          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] max-h-[90vh] rounded-t-2xl shadow-xl bg-card flex flex-col"
          >
            <PostJobForm
              onClose={onClose}
              onSuccess={onSuccess}
              recruiterProfile={recruiterProfile}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}