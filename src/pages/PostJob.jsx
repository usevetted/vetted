import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, X, Plus, Building2, Loader2, Trash2 } from 'lucide-react';
import Logo from '@/components/Logo';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { base44 } from '@/api/base44Client';

const colorPalettes = [
  { bg: '#e8f0fc', color: '#2a55a0' },
  { bg: '#fce8f0', color: '#a02a55' },
  { bg: '#e8fce8', color: '#2a7a3a' },
  { bg: '#fcf0e8', color: '#a06b2a' },
  { bg: '#f0e8fc', color: '#6b3fa0' },
  { bg: '#e8fcfc', color: '#2a7a7a' },
];

const getCompanyColors = (name) => {
  const charCode = (name || 'C').toUpperCase().charCodeAt(0);
  return colorPalettes[charCode % colorPalettes.length];
};

export default function PostJob() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();
  const [saving, setSaving] = useState(false);
  const [existingJobs, setExistingJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      if (profile.account_type !== 'recruiter') {
        navigate('/discover', { replace: true });
        return;
      }
      setCompany(profile.current_company || '');
      loadJobs();
    }
  }, [profile, navigate]);

  const loadJobs = async () => {
    if (!profile) return;
    try {
      const jobs = await base44.entities.Job.filter({ recruiter_profile_id: profile.id }, '-created_date', 50);
      setExistingJobs(jobs);
    } catch {
      // ignore
    } finally {
      setLoadingJobs(false);
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
    if (!title.trim()) e.title = 'Job title is required';
    if (!company.trim()) e.company = 'Company is required';
    if (!location) e.location = 'Location is required';
    if (!description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const colors = getCompanyColors(company);
      const created = await base44.entities.Job.create({
        title: title.trim(),
        company: company.trim(),
        company_initial: (company.trim()[0] || 'C').toUpperCase(),
        company_initial_bg: colors.bg,
        company_initial_color: colors.color,
        location,
        remote,
        salary_range: salaryRange.trim(),
        description: description.trim(),
        tags,
        company_size: companySize.trim(),
        recruiter_profile_id: profile.id,
        recruiter_name: profile.full_name,
        recruiter_linkedin: profile.linkedin_url || '',
      });
      setExistingJobs(prev => [created, ...prev]);
      setTitle('');
      setLocation('');
      setRemote(false);
      setSalaryRange('');
      setDescription('');
      setTags([]);
      setCompanySize('');
      setErrors({});
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await base44.entities.Job.delete(jobId);
      setExistingJobs(prev => prev.filter(j => j.id !== jobId));
    } catch {
      // ignore
    }
  };

  const inputClass = "w-full h-[44px] border border-input rounded-xl px-3.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "text-[12px] font-medium text-foreground/70 mb-1.5 block";
  const errorClass = "text-[12px] text-destructive mt-1";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar min-h-0">
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <Logo size="sm" />
      </div>

      <div className="px-5 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/discover')} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-foreground/60" />
          </button>
          <h1 className="text-[20px] font-semibold text-foreground">Post a Role</h1>
        </div>
        <p className="text-[13px] text-muted-foreground ml-7">Create a job listing for candidates to discover</p>
      </div>

      <div className="px-5 pb-6 space-y-4">
        <div>
          <label className={labelClass}>Job Title *</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({ ...errors, title: '' }); }}
            placeholder="Senior Product Manager"
            className={`${inputClass} ${errors.title ? 'border-destructive' : ''}`}
          />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </div>

        <div>
          <label className={labelClass}>Company *</label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              value={company}
              onChange={(e) => { setCompany(e.target.value); if (errors.company) setErrors({ ...errors, company: '' }); }}
              placeholder="Acme Corp"
              className={`${inputClass} pl-10 ${errors.company ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.company && <p className={errorClass}>{errors.company}</p>}
        </div>

        <div>
          <label className={labelClass}>Location *</label>
          <LocationAutocomplete
            value={location}
            onChange={(v) => { setLocation(v); if (errors.location) setErrors({ ...errors, location: '' }); }}
            error={!!errors.location}
          />
          {errors.location && <p className={errorClass}>{errors.location}</p>}
        </div>

        <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl">
          <div>
            <div className="text-[13px] font-medium text-foreground">Remote eligible</div>
            <div className="text-[12px] text-muted-foreground">Candidates can work from anywhere</div>
          </div>
          <button
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
            placeholder="$120k – $160k"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Job Description *</label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors({ ...errors, description: '' }); }}
            placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
            rows={4}
            className={`w-full border border-input rounded-xl px-3.5 py-2.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${errors.description ? 'border-destructive' : ''}`}
          />
          {errors.description && <p className={errorClass}>{errors.description}</p>}
        </div>

        <div>
          <label className={labelClass}>Required Skills / Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-brand-green-light text-primary">
                {tag}
                <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>
                  <X size={12} className="text-primary/60 hover:text-primary" />
                </button>
              </span>
            ))}
            <span className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
              <Plus size={12} /> Add
            </span>
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

        <div>
          <label className={labelClass}>Company Size</label>
          <input
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            placeholder="50-200 employees"
            className={inputClass}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full h-[52px] bg-primary text-white rounded-2xl text-[15px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
          {saving ? 'Posting...' : 'Post Job'}
        </button>
      </div>

      {existingJobs.length > 0 && (
        <div className="px-5 pb-8">
          <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Active Listings</h3>
          <div className="space-y-2">
            {existingJobs.map(job => (
              <div key={job.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border/60">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: job.company_initial_bg || '#e8f0fc',
                    color: job.company_initial_color || '#2a55a0'
                  }}
                >
                  {job.company_initial || job.company?.[0] || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-foreground truncate">{job.title}</div>
                  <div className="text-[12px] text-muted-foreground truncate">
                    {job.company} · {job.location}{job.remote ? ' · Remote' : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingJobs && existingJobs.length === 0 && (
        <div className="px-5 pb-8">
          <div className="flex items-center justify-center py-4">
            <Loader2 size={20} className="text-muted-foreground/40 animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}