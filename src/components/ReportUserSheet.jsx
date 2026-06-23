import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const reportReasons = [
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'threats', label: 'Threats or Violence' },
  { value: 'sexual_content', label: 'Sexual Content' },
  { value: 'spam', label: 'Spam or Scam' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'sharing_pii', label: 'Sharing Personal Information' },
  { value: 'illegal_activity', label: 'Illegal Activity' },
  { value: 'self_harm', label: 'Self-Harm Concerns' },
  { value: 'other', label: 'Other' },
];

export default function ReportUserSheet({ open, onClose, reportedProfileId, reportedProfileName, matchId, reporterProfileId }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setDescription('');
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!reason || !reporterProfileId || !reportedProfileId) return;
    setSubmitting(true);
    try {
      await base44.entities.Report.create({
        reporter_profile_id: reporterProfileId,
        reported_profile_id: reportedProfileId,
        reported_profile_name: reportedProfileName || '',
        match_id: matchId || '',
        reason,
        description: description.trim(),
        status: 'pending',
      });
      setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-[90]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[28px] px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3 max-h-[80vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-brand-green-light flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-primary" />
                </div>
                <h3 className="text-[16px] font-semibold text-foreground mb-1">Report Submitted</h3>
                <p className="text-[13px] text-muted-foreground mb-6">Our moderation team will review this report and take appropriate action.</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <Flag size={18} className="text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-foreground">Report {reportedProfileName}</h3>
                    <p className="text-[12px] text-muted-foreground">Help us keep Vetted safe</p>
                  </div>
                </div>
                <p className="text-[12px] font-medium text-foreground/70 mb-2">Reason</p>
                <div className="space-y-2 mb-4">
                  {reportReasons.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setReason(r.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-[1.5px] text-left transition-all ${
                        reason === r.value ? 'border-primary bg-brand-green-bg' : 'border-border'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${reason === r.value ? 'border-primary' : 'border-border'}`}>
                        {reason === r.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-[13px] text-foreground">{r.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details (optional)"
                  rows={2}
                  className="w-full border border-input rounded-xl px-3.5 py-2.5 text-[13px] bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-4"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className="w-full h-[50px] bg-destructive text-white rounded-2xl text-[14px] font-medium disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}