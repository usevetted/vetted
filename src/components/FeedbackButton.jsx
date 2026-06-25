import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const SENTIMENTS = [
  { emoji: '😊', value: 'positive' },
  { emoji: '😐', value: 'neutral' },
  { emoji: '😞', value: 'negative' },
];

export default function FeedbackSheet({ open, onClose, profile }) {
  const [message, setMessage] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.Feedback.create({
        message: message.trim(),
        sentiment,
        submitted_by: profile?.id || '',
      });
      toast.success('Thanks for your feedback!');
      setMessage('');
      setSentiment(null);
      onClose();
    } catch {
      toast.error('Failed to send — try again');
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
            className="fixed inset-0 bg-black/30 z-[110]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 pb-8 z-[120] shadow-2xl"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-foreground">Send Feedback</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's working? What's broken? Any ideas?"
              className="w-full min-h-[100px] border border-input rounded-xl p-3 text-[14px] bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <div className="flex gap-2 mt-4">
              {SENTIMENTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSentiment(sentiment === s.value ? null : s.value)}
                  className={`flex-1 h-11 rounded-xl border text-[20px] flex items-center justify-center transition-colors ${
                    sentiment === s.value ? 'bg-primary/10 border-primary' : 'bg-muted/50 border-border hover:bg-muted'
                  }`}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || submitting}
              className="w-full h-12 bg-primary text-white rounded-2xl text-[14px] font-medium mt-5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Submit'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}