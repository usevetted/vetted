import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

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
          {/* Header — always tappable, above the PDF */}
          <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-3 border-b border-border/50 flex-shrink-0 bg-white z-10">
            <span className="text-[15px] font-semibold text-foreground truncate">{title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={url}
                download
                className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Download size={17} className="text-foreground" />
              </a>
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors shadow-sm"
              >
                <X size={20} className="text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          {/* PDF rendered via object — avoids Adobe Acrobat prompt on iOS */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            <object
              data={`${url}#toolbar=0&navpanes=0&view=FitH`}
              type="application/pdf"
              className="w-full h-full"
              aria-label={title}
            >
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
                <p className="text-[13px] text-muted-foreground text-center">
                  Unable to display PDF inline.
                </p>
                <a
                  href={url}
                  download
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium"
                >
                  Download instead
                </a>
              </div>
            </object>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}