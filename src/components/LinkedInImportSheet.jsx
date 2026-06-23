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

  const isValid = (v) => v && typeof v === 'string' && !['null', 'None', 'N/A', 'undefined', ''].includes(v.trim());

  const handleImport = async () => {
    if (!url.trim()) return;
    setImporting(true);
    setError('');

    try {
      const result = await Promise.race([
        base44.integrations.Core.InvokeLLM({
          prompt: `Search for the LinkedIn profile at this URL and extract the person's professional information. URL: ${url.trim()}`,
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
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 45000)
        )
      ]);

      let data = result;
      if (typeof result === 'string') {
        try { data = JSON.parse(result); } catch { data = {}; }
      }
      data = data?.data || data;

      const imported = {};
      if (isValid(data?.full_name)) imported.full_name = data.full_name;
      if (isValid(data?.current_role)) imported.current_role = data.current_role;
      if (isValid(data?.current_company)) imported.current_company = data.current_company;
      if (isValid(data?.location)) imported.location = data.location;
      if (isValid(data?.bio)) imported.bio = data.bio;
      if (Array.isArray(data?.skills) && data.skills.length > 0) {
        const validSkills = data.skills.filter(s => isValid(s));
        if (validSkills.length > 0) imported.skills = validSkills;
      }

      if (Object.keys(imported).length === 0) {
        setError('Could not extract profile data from this URL. Please fill in manually.');
        return;
      }

      onImport({ ...imported, linkedin_url: url.trim() });
      onClose();
    } catch (err) {
      setError(
        err?.message === 'timeout'
          ? 'Import timed out. Please try again or fill in manually.'
          : 'Could not import from this URL. Please fill in manually.'
      );
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
              We'll search for your public profile. This can take up to 30 seconds.
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