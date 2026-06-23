import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PRIVACY_POLICY_HTML } from '@/lib/privacyContent';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="sticky top-0 z-10 bg-white/90 glass border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-foreground/60" />
        </button>
        <span className="text-[15px] font-semibold text-foreground">Privacy Policy</span>
      </div>
      <div
        className="max-w-2xl mx-auto px-6 py-8 legal-content"
        dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_HTML }}
      />
    </div>
  );
}