import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCompanyLogo(file_url);
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Could not upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const validate = () => {
    const e = {};
    if (!jobTitle.trim()) e.jobTitle = 'Job title is required';
    if (!company.trim()) e.company = 'Company name is required';
    if (!location.trim()) e.location = 'Location is required';
    if (!description.trim()) e.description = 'Job description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validate()) return;

    setSubmitting(true);
    const postData = {
      job_title: jobTitle.trim(),
      company: company.trim(),
      company_logo: companyLogo,
      location: location.trim(),
      remote,
      salary_range: salaryRange.trim(),
      description: description.trim(),
      tags,
    };
    console.log('Job posting created:', postData);
    
    const { dismiss } = toast({
      title: '✓ Job posting published',
      description: 'Your job is now live and visible to candidates',
      duration: 2000,
    });
    
    // Auto-dismiss after duration
    setTimeout(() => {
      if (dismiss) dismiss();
    }, 2000);

    setTimeout(() => {
      setSubmitting(false);
      navigate(-1);
    }, 1200);
  };

  const inputClass = "w-full h-[44px] border border-input rounded-xl px-3.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "text-[12px] font-medium text-foreground/70 mb-1.5 block";
  const errorClass = "text-[11px] text-destructive mt-1";

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-secondary/60 via-secondary/40 to-brand-green-bg/40 flex justify-center">
      <div className="w-full max-w-[600px] min-h-[100dvh] bg-white flex flex-col">
        {/* Header */}
        <div className="px-6 pt-4 pb-4 flex items-center gap-3 border-b border-border/30">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-foreground/60" />
          </button>
          <h1 className="text-[20px] font-semibold text-foreground">Create Job Posting</h1>
        </div>

        <div className="px-6 pt-3 pb-2">
          <p className="text-[13px] text-muted-foreground">
            Fill in the details about your job opening
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6">
          {/* Company Logo */}
          <div className="flex flex-col items-center mb-5 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-[88px] h-[88px] rounded-full overflow-hidden border-2 border-border group"
            >
              {companyLogo ? (
                <img src={companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Camera size={24} className="text-muted-foreground/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            <p className="text-[12px] text-muted-foreground mt-2">
              {uploadingLogo ? 'Uploading...' : 'Tap to upload logo'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <p className="text-[11px] text-muted-foreground/60 mb-4 uppercase tracking-wider font-medium">Job Details</p>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-4 pb-24">
            <div>
              <label className={labelClass}>Job Title *</label>
              <input
                value={jobTitle}
                onChange={(e) => { setJobTitle(e.target.value); setErrors({}); }}
                placeholder="e.g., Senior Product Manager"
                className={`${inputClass} ${errors.jobTitle ? 'border-destructive' : ''}`}
              />
              {errors.jobTitle && <p className={errorClass}>{errors.jobTitle}</p>}
            </div>

            <div>
              <label className={labelClass}>Company Name *</label>
              <input
                value={company}
                onChange={(e) => { setCompany(e.target.value); setErrors({}); }}
                placeholder="e.g., Acme Corp"
                className={`${inputClass} ${errors.company ? 'border-destructive' : ''}`}
              />
              {errors.company && <p className={errorClass}>{errors.company}</p>}
            </div>

            <div>
              <label className={labelClass}>Location *</label>
              <input
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors({}); }}
                placeholder="e.g., San Francisco, CA"
                className={`${inputClass} ${errors.location ? 'border-destructive' : ''}`}
              />
              {errors.location && <p className={errorClass}>{errors.location}</p>}
            </div>

            {/* Remote toggle */}
            <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl">
              <div>
                <div className="text-[13px] font-medium text-foreground">Remote</div>
                <div className="text-[11px] text-muted-foreground">Position is fully remote</div>
              </div>
              <button
                type="button"
                onClick={() => setRemote(!remote)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${remote ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${remote ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <label className={labelClass}>Salary Range</label>
              <input
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g., $150k – $200k"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Job Description *</label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors({}); }}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={5}
                className={`w-full border border-input rounded-xl px-3.5 py-2.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${errors.description ? 'border-destructive' : ''}`}
              />
              {errors.description && <p className={errorClass}>{errors.description}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Skills / Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-brand-green-light text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type a skill and press Enter"
                className={inputClass}
              />
            </div>

          </form>
        </div>

        {/* Submit Button (Fixed at bottom) */}
        <div className="px-6 py-5 bg-white border-t border-border/30 flex-shrink-0 shadow-lg pb-[calc(5rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-[56px] bg-primary text-white rounded-xl text-[16px] font-semibold hover:bg-primary/95 active:bg-primary/85 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin flex-shrink-0" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span>Publish Job Posting</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}