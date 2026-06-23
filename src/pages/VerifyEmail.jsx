import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AuthLayout from '@/components/AuthLayout';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Invalid verification link. Token is missing.');
          return;
        }

        await base44.functions.invoke('verifyEmailChange', { token });
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to profile...');
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error?.message || 'Failed to verify email. The link may have expired.');
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <AuthLayout
      icon={Mail}
      title="Verify Email"
      subtitle="Confirming your new email address"
    >
      <div className="flex flex-col items-center text-center space-y-4 py-8">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
            <p className="text-[14px] text-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <p className="text-[14px] text-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle size={32} className="text-destructive" />
            </div>
            <p className="text-[14px] text-foreground mb-4">{message}</p>
            <button
              onClick={() => navigate('/profile')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Profile
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}