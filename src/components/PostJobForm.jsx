import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function PostJobForm({ onClose, onSuccess, recruiterProfile }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    remote: false,
    employmentType: 'Full Time',
    salaryMin: '',
    salaryMax: '',
    description: '',
    skills: [],
    experienceLevel: 'Mid Level',
    deadline: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    return newErrors;
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitError('');
    setLoading(true);

    try {
      const salaryRange = formData.salaryMin && formData.salaryMax
        ? `$${parseInt(formData.salaryMin).toLocaleString()}-$${parseInt(formData.salaryMax).toLocaleString()}`
        : '';

      await base44.entities.Job.create({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        remote: formData.remote,
        salary_range: salaryRange,
        description: formData.description,
        tags: formData.skills,
        company_size: formData.employmentType,
        recruiter_profile_id: recruiterProfile.id,
        recruiter_name: recruiterProfile.full_name,
        recruiter_linkedin: recruiterProfile.linkedin_url || '',
      });

      setFormData({
        title: '',
        company: '',
        location: '',
        remote: false,
        employmentType: 'Full Time',
        salaryMin: '',
        salaryMax: '',
        description: '',
        skills: [],
        experienceLevel: 'Mid Level',
        deadline: '',
      });
      setErrors({});
      setSubmitError('');
      onSuccess();
    } catch (err) {
      console.error('Job submission error:', err);
      setSubmitError(err?.message || err?.toString() || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full h-[40px] border border-input rounded-lg px-3 text-[13px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
  const labelClass = 'text-[12px] font-medium text-foreground/70 mb-1.5 block';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card z-20">
        <h2 className="text-[16px] font-semibold text-foreground">Post a Job</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
        {submitError && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-[12px] text-destructive">{submitError}</p>
          </div>
        )}

        {/* Job Title */}
        <div>
          <label className={labelClass}>Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
            }}
            className={`${inputClass} ${errors.title ? 'border-destructive focus:ring-destructive/20' : ''}`}
            placeholder="e.g., Senior Software Engineer"
          />
          {errors.title && <p className="text-[11px] text-destructive mt-1">{errors.title}</p>}
        </div>

        {/* Company Name */}
        <div>
          <label className={labelClass}>Company Name</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, company: e.target.value }));
              if (errors.company) setErrors(prev => ({ ...prev, company: '' }));
            }}
            className={`${inputClass} ${errors.company ? 'border-destructive focus:ring-destructive/20' : ''}`}
            placeholder="e.g., Acme Corp"
          />
          {errors.company && <p className="text-[11px] text-destructive mt-1">{errors.company}</p>}
        </div>

        {/* Location & Remote */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, location: e.target.value }));
                if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
              }}
              className={`${inputClass} ${errors.location ? 'border-destructive focus:ring-destructive/20' : ''}`}
              placeholder="e.g., San Francisco, CA"
            />
            {errors.location && <p className="text-[11px] text-destructive mt-1">{errors.location}</p>}
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <input
              type="checkbox"
              id="remote"
              checked={formData.remote}
              onChange={(e) => setFormData(prev => ({ ...prev, remote: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="remote" className="text-[13px] font-medium text-foreground cursor-pointer">
              Remote position
            </label>
          </div>
        </div>

        {/* Employment Type */}
        <div>
          <label className={labelClass}>Employment Type</label>
          <select
            value={formData.employmentType}
            onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
            className={inputClass}
          >
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Contract</option>
            <option>Internship</option>
            <option>Freelance</option>
          </select>
        </div>

        {/* Salary Range */}
        <div>
          <label className={labelClass}>Salary Range (Optional)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.salaryMin}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
              className={inputClass}
              placeholder="Min"
            />
            <input
              type="number"
              value={formData.salaryMax}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
              className={inputClass}
              placeholder="Max"
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className={labelClass}>Job Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }));
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
            }}
            className={`w-full border border-input rounded-lg px-3 py-2.5 text-[13px] bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none min-h-[100px] ${errors.description ? 'border-destructive focus:ring-destructive/20' : ''}`}
            placeholder="Describe the role, responsibilities, and requirements..."
          />
          {errors.description && <p className="text-[11px] text-destructive mt-1">{errors.description}</p>}
        </div>

        {/* Skills */}
        <div>
          <label className={labelClass}>Required Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-brand-green-light text-primary"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className={inputClass}
              placeholder="Add a skill and press Enter"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 h-[40px] bg-primary text-white text-[12px] font-medium rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className={labelClass}>Experience Level</label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
            className={inputClass}
          >
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
            <option>Executive</option>
          </select>
        </div>

        {/* Application Deadline */}
        <div>
          <label className={labelClass}>Application Deadline (Optional)</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 px-5 py-3 border-t border-border sticky bottom-0 bg-card">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-[40px] border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-muted/30 transition-colors"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          className="flex-1 h-[40px] bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Posting...
            </>
          ) : (
            'Post Job'
          )}
        </motion.button>
      </div>
    </form>
  );
}