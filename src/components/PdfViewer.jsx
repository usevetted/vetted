import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function PdfViewer({ url, open, onClose, title = 'Resume' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-3 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[15px] font-semibold text-foreground truncate">{title}</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 hover:bg-muted transition-colors"
            >
              <X size={18} className="text-foreground" />
            </button>
          </div>
          {/* PDF iframe — renders inline on iOS without leaving the app */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={url}
              title={title}
              className="w-full h-full border-0"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}