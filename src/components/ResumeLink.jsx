import { useState } from 'react';
import { FileText } from 'lucide-react';
import PdfViewer from '@/components/PdfViewer';

export default function ResumeLink({ url, compact = false }) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors mt-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12px] font-medium text-foreground">View Resume</div>
            <div className="text-[12px] text-muted-foreground">PDF</div>
          </div>
        </button>
        <PdfViewer url={url} open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resume</h3>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 w-full p-3.5 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12px] font-medium text-foreground">View Resume</div>
            <div className="text-[12px] text-muted-foreground">PDF</div>
          </div>
        </button>
      </div>
      <PdfViewer url={url} open={open} onClose={() => setOpen(false)} />
    </>
  );
}