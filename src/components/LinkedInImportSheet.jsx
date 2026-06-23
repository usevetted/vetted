import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LINKEDIN_CONNECTOR_ID = '6a3a94d24fa3875df2b2acf3';

export default function LinkedInImportSheet({ open, onClose, onImport }) {
  const [status, setStatus] = useState('checking'); // checking | connected | disconnected | connecting | fetching | error
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStatus('checking');
    setError('');
    checkConnection();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

  const checkConnection = async () => {
    try {
      const response = await base44.functions.invoke('linkedinImport', {});
      const data = response.data || response;
      if (data.error === 'not_connected') {
        setStatus('disconnected');
      } else if (data.error) {
        setStatus('disconnected');
      } else {
        setStatus('connected');
      }
    } catch {
      setStatus('disconnected');
    }
  };

  const fetchProfile = async () => {
    setStatus('fetching');
    try {
      const response = await base44.functions.invoke('linkedinImport', {});
      const data = response.data || response;
      if (data.error) {
        setError(data.error === 'not_connected' ? 'LinkedIn not connected. Please sign in.' : data.error);
        setStatus('error');
        return;
      }
      onImport(data);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to fetch LinkedIn profile');
      setStatus('error');
    }
  };

  const handleConnect = async () => {
    setStatus('connecting');
    setError('');
    try {
      const url = await base44.connectors.connectAppUser(LINKEDIN_CONNECTOR_ID);
      const popup = window.open(url, '_blank');

      pollRef.current = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          fetchProfile();
        }
      }, 500);
    } catch (err) {
      setError(err?.message || 'Failed to connect to LinkedIn');
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={28} className="text-primary animate-spin mb-3" />
            <p className="text-[13px] text-muted-foreground">Checking LinkedIn connection...</p>
          </div>
        );

      case 'connected':
        return (
          <div className="flex flex-col items-center py-6">
            <div className="w-14 h-14 rounded-full bg-brand-green-light flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <p className="text-[14px] font-medium text-foreground mb-1">LinkedIn connected</p>
            <p className="text-[12px] text-muted-foreground mb-5 text-center px-4">
              Your LinkedIn account is linked. Import your verified profile data.
            </p>
            <button
              onClick={fetchProfile}
              className="w-full h-[50px] bg-primary text-white rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={16} />
              Import Profile
            </button>
          </div>
        );

      case 'disconnected':
        return (
          <div className="flex flex-col items-center py-6">
            <div className="w-14 h-14 rounded-full bg-linkedin/10 flex items-center justify-center mb-4">
              <Linkedin size={28} className="text-linkedin" />
            </div>
            <p className="text-[14px] font-medium text-foreground mb-1">Sign in with LinkedIn</p>
            <p className="text-[12px] text-muted-foreground mb-5 text-center px-4">
              Verify your LinkedIn account and we'll import your name, role, company, and photo. This proves you own the account.
            </p>
            <button
              onClick={handleConnect}
              className="w-full h-[50px] bg-linkedin text-white rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Linkedin size={18} />
              Continue with LinkedIn
            </button>
          </div>
        );

      case 'connecting':
        return (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={28} className="text-linkedin animate-spin mb-3" />
            <p className="text-[13px] text-muted-foreground">Complete sign-in in the popup...</p>
          </div>
        );

      case 'fetching':
        return (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={28} className="text-primary animate-spin mb-3" />
            <p className="text-[13px] text-muted-foreground">Importing your profile...</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center py-6">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-destructive" />
            </div>
            <p className="text-[14px] font-medium text-foreground mb-1">Something went wrong</p>
            <p className="text-[12px] text-muted-foreground mb-5 text-center px-4">{error}</p>
            <button
              onClick={handleConnect}
              className="w-full h-[50px] bg-primary text-white rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        );

      default:
        return null;
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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-linkedin flex items-center justify-center flex-shrink-0">
                <Linkedin size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-foreground">LinkedIn Import</h3>
                <p className="text-[12px] text-muted-foreground">Verified profile import</p>
              </div>
            </div>
            {renderContent()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}