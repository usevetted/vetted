import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartCrack, Ban, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function MatchActionsSheet({ open, onClose, onUnmatch, onBlock, otherName }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const firstName = otherName?.split(' ')[0] || 'this user';

  useEffect(() => {
    if (open) setConfirmAction(null);
  }, [open]);

  const handleConfirm = () => {
    if (confirmAction === 'unmatch') onUnmatch();
    if (confirmAction === 'block') onBlock();
  };

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

            {confirmAction ? (
              <div className="pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setConfirmAction(null)} className="p-1 -ml-1">
                    <ArrowLeft size={18} className="text-muted-foreground" />
                  </button>
                  <h3 className="text-[16px] font-semibold text-foreground">
                    {confirmAction === 'block' ? 'Block user' : 'Unmatch'}
                  </h3>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 mb-5">
                  <AlertTriangle size={18} className="text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-foreground/80 leading-relaxed">
                    {confirmAction === 'block'
                      ? `Blocking ${firstName} will permanently end this match and prevent future matching. This action cannot be undone.`
                      : `Unmatching ${firstName} will archive this conversation. You may match again in the future if both parties show interest again.`}
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  className={`w-full h-[50px] rounded-2xl text-[14px] font-medium text-white flex items-center justify-center gap-2 transition-colors ${
                    confirmAction === 'block' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {confirmAction === 'block' ? <Ban size={16} /> : <HeartCrack size={16} />}
                  {confirmAction === 'block' ? 'Block permanently' : 'Unmatch'}
                </button>
              </div>
            ) : (
              <div className="pb-2">
                <h3 className="text-[16px] font-semibold text-foreground mb-1">Match options</h3>
                <p className="text-[12px] text-muted-foreground mb-5">Manage your connection with {firstName}</p>

                <button
                  onClick={() => setConfirmAction('unmatch')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/40 transition-colors text-left mb-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <HeartCrack size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-foreground">Unmatch</div>
                    <div className="text-[12px] text-muted-foreground">Archive this conversation. You may match again later.</div>
                  </div>
                </button>

                <button
                  onClick={() => setConfirmAction('block')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-destructive/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <Ban size={18} className="text-destructive" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-destructive">Block</div>
                    <div className="text-[12px] text-muted-foreground">Permanently end this match and prevent future matching.</div>
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}