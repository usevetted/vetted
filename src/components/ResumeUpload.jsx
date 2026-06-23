import { useState, useRef } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ResumeUpload({ value, onChange, label = 'Resume (Optional)' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-[12px] font-medium text-foreground/70 mb-1.5 block">{label}</label>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" />
      {value ? (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-muted/30">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-primary" />
          </div>
          <span className="flex-1 text-[13px] text-foreground truncate">Resume uploaded</span>
          <button onClick={() => onChange('')} className="text-muted-foreground hover:text-destructive flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-[44px] border border-dashed border-input rounded-xl flex items-center justify-center gap-2 text-[13px] text-muted-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={16} />}
          {uploading ? 'Uploading...' : 'Upload resume (PDF)'}
        </button>
      )}
      <p className="text-[11px] text-muted-foreground/60 mt-1.5">
        Recruiters you match with can view your resume
      </p>
    </div>
  );
}