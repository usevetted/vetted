import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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

  const isValid = (v) => v && typeof v === 'string' && !['null', 'None', 'N/A', 'undefined', 'unknown', ''].includes(v.trim());

  const extractNameFromUrl = (urlStr) => {
    const match = urlStr.match(/linkedin\.com\/in\/([^/?]+)/i);
    if (match) {
      return match[1]
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
    }
    return '';
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    setImporting(true);
    setError('');

    const linkedinUrl = url.trim();
    const nameHint = extractNameFromUrl(linkedinUrl);

    try {
      const response = await Promise.race([
        base44.integrations.Core.InvokeLLM({
          prompt: `You are a professional profile extractor. A user wants to import their LinkedIn profile data.

LinkedIn URL: ${linkedinUrl}
Extracted name hint from URL: ${nameHint || 'unknown'}

Use web search to find information about this person. Search for their name along with "LinkedIn" to find their professional details. Look for their current job title, company, location, and skills from any public sources available (company websites, conference bios, news articles, GitHub, etc).

Extract the following fields. If you cannot find a field, return an empty string for it. Do NOT make up data — only return what you find from real search results.

Return a JSON object with these exact fields:
- full_name: The person's full name (use the name hint if found in search results)
- current_role: Their current job title
- current_company: Their current employer
- location: Their city and state/country
- bio: A 1-2 sentence professional summary based on what you found
- skills: An array of their top skills (max 8)`,
          add_context_from_internet: true,
          model: 'gemini_3_1_pro',
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
          setTimeout(() => reject(new Error('timeout')), 60000)
        )
      ]);

      // The SDK returns an Axios response — the actual data is in response.data
      let data = response?.data ?? response;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { data = {}; }
      }
      // Handle potential double-wrapping
      if (data?.data && typeof data.data === 'object') {
        data = data.data;
      }

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

      // If we at least got a name, consider it a success
      if (Object.keys(imported).length === 0) {
        setError('Could not find profile data for this URL. Please fill in your details manually below.');
        return;
      }

      onImport({ ...imported, linkedin_url: linkedinUrl });
      onClose();
    } catch (err) {
      setError(
        err?.message === 'timeout'
          ? 'Import timed out after 60 seconds. Please try again or fill in manually.'
          : 'Could not import from this URL. Please fill in your details manually.'
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
              onKeyDown={(e) => { if (e.key === 'Enter' && !importing) { e.preventDefault(); handleImport(); } }}
              placeholder="linkedin.com/in/your-name"
              className="w-full h-[48px] border border-input rounded-xl px-4 text-[14px] bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />

            {error && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-destructive/10">
                <AlertCircle size={15} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-destructive">{error}</p>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground/60 mt-3">
              We'll search the web for your public profile info. This can take up to 60 seconds.
            </p>

            <button
              onClick={handleImport}
              disabled={importing || !url.trim()}
              className="w-full h-[50px] bg-primary text-white rounded-2xl text-[14px] font-medium mt-4 flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Searching...
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