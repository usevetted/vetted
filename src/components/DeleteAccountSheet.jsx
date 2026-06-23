import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';

export default function DeleteAccountSheet({ open, onClose, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      setConfirming(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!deleting) { setConfirming(false); onClose(); } }}
            className="fixed inset-0 bg-black/40 z-[90]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[28px] px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

            {!deleting && (
              <button
                onClick={() => { setConfirming(false); onClose(); }}
                className="absolute top-3 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            )}

            {!confirming ? (
              <div className="pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <Trash2 size={22} className="text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-foreground">Delete Account</h3>
                    <p className="text-[12px] text-muted-foreground">Permanently remove your account and data</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <p className="text-[13px] text-foreground/70 leading-relaxed">
                    This will permanently delete your profile, matches, messages, and job postings. This action <strong>cannot be undone</strong>.
                  </p>
                  <ul className="text-[12px] text-muted-foreground space-y-1.5 mt-3">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      Your profile and bio will be removed
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      All matches and conversations will be deleted
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      Your posted jobs will be removed
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setConfirming(true)}
                  className="w-full h-[50px] rounded-2xl bg-destructive text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 size={16} />
                  Continue
                </button>
                <button
                  onClick={onClose}
                  className="w-full h-[44px] mt-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="pb-2">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 mb-5">
                  <AlertTriangle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-destructive mb-1">Are you absolutely sure?</p>
                    <p className="text-[12px] text-foreground/70 leading-relaxed">
                      This action is irreversible. Your account and all associated data will be permanently deleted.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full h-[50px] rounded-2xl bg-destructive text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Yes, delete my account
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setConfirming(false); onClose(); }}
                  disabled={deleting}
                  className="w-full h-[44px] mt-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}