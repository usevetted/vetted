import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LinkedInImportSheet({ open, onClose, onImport }) {
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setUrl('');
      setError('');
    }
  }, [open]);

  const handleImport = async () => {
    if (!url.trim()) return;
    setImporting(true);
    setError('');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract professional profile information from this LinkedIn URL: ${url.trim()}

Return the person's full name, current job title, current company, location (city and state), a brief professional summary/bio, and top skills. If any field is not publicly available, return null for that field.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            current_role: { type: 'string' },
            current_company: { type: 'string' },
            location: { type: 'string' },
            bio: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      const imported = {};
      if (result.full_name && result.full_name !== 'null') imported.full_name = result.full_name;
      if (result.current_role && result.current_role !== 'null') imported.current_role = result.current_role;
      if (result.current_company && result.current_company !== 'null') imported.current_company = result.current_company;
      if (result.location && result.location !== 'null') imported.location = result.location;
      if (result.bio && result.bio !== 'null') imported.bio = result.bio;
      if (result.skills && Array.isArray(result.skills) && result.skills.length > 0) imported.skills = result.skills.filter(s => s && s !== 'null');

      onImport({ ...imported, linkedin_url: url.trim() });
      onClose();
    } catch {
      setError('Could not import from this URL. Please check the link or fill in manually.');
    } finally {
      setImporting(false);
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
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[28px] px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-linkedin flex items-center justify-center flex-shrink-0">
                <Linkedin size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">Import from LinkedIn</h3>
                <p className="text-[12px] text-muted-foreground">Enter your LinkedIn profile URL</p>
              </div>
            </div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleImport(); } }}
              placeholder="linkedin.com/in/username"
              className="w-full h-[48px] border border-input rounded-xl px-4 text-[14px] bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
            {error && <p className="text-[12px] text-destructive mt-2">{error}</p>}
            <p className="text-[11px] text-muted-foreground/60 mt-2">
              We'll try to fetch your name, role, company, bio, and skills from your public profile.
            </p>
            <button
              onClick={handleImport}
              disabled={importing || !url.trim()}
              className="w-full h-[50px] bg-primary text-white rounded-2xl text-[14px] font-medium mt-4 flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import Profile
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}