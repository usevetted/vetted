import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import ScrollPicker from './ScrollPicker';

export default function PickerSheet({ open, onClose, title, items, value, onChange }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-[90]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[28px] px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-brand-green-light flex items-center justify-center"
              >
                <Check size={16} className="text-primary" />
              </button>
            </div>
            <ScrollPicker items={items} value={value} onChange={onChange} height={200} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}