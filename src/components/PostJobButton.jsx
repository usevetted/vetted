import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PostJobButton({ isRecruiter, profile, onJobPosted }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    remote: false,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isRecruiter) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.company.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.Job.create({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        remote: formData.remote,
        description: formData.description,
        recruiter_profile_id: profile.id,
        recruiter_name: profile.full_name,
        recruiter_linkedin: profile.linkedin_url || '',
        profile_picture: profile.profile_picture || '',
      });

      toast.success('Job posted successfully', {
        duration: 3000,
        icon: <Check size={18} className="text-primary" />,
        style: {
          background: 'white',
          color: 'hsl(146, 48%, 19%)',
          border: '1px solid hsl(146, 48%, 19%, 0.2)',
        },
      });
      setFormData({ title: '', company: '', location: '', remote: false, description: '' });
      setModalOpen(false);
      onJobPosted();
    } catch (err) {
      setError(err?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const modalElement = (
    <AnimatePresence>
      {modalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/40 z-[95]"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[200] max-h-[90vh] rounded-t-2xl shadow-xl bg-card flex flex-col"
          >
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card z-20">
                  <h2 className="text-[16px] font-semibold text-foreground">Post a Job</h2>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4 pb-24">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <p className="text-[12px] text-destructive">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-[12px] font-medium text-foreground/70 mb-1.5 block">Job Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full h-[40px] border border-input rounded-lg px-3 text-[13px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-foreground/70 mb-1.5 block">Company *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full h-[40px] border border-input rounded-lg px-3 text-[13px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="e.g., Acme Corp"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-foreground/70 mb-1.5 block">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full h-[40px] border border-input rounded-lg px-3 text-[13px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <input
                      type="checkbox"
                      id="remote"
                      checked={formData.remote}
                      onChange={(e) => setFormData(prev => ({ ...prev, remote: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="remote" className="text-[13px] font-medium text-foreground cursor-pointer">
                      Remote position
                    </label>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium text-foreground/70 mb-1.5 block">Job Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-input rounded-lg px-3 py-2.5 text-[13px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none min-h-[100px]"
                      placeholder="Describe the role and responsibilities..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 py-3 border-t border-border sticky bottom-0 bg-card">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 h-[40px] border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-muted/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                    className="flex-1 h-[40px] bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Job'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setModalOpen(true)}
        className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <Plus size={20} />
      </motion.button>
      {createPortal(modalElement, document.body)}
    </>
  );
}