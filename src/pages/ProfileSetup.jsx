import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Linkedin, ArrowRight, X, Plus, ArrowLeft, Check, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo';
import LinkedInImportSheet from '@/components/LinkedInImportSheet';
import PickerSheet from '@/components/PickerSheet';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { base44 } from '@/api/base44Client';
import { yearsOptions } from '@/lib/profileConstants';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [linkedInImportOpen, setLinkedInImportOpen] = useState(false);
  const [yearsPickerOpen, setYearsPickerOpen] = useState(false);


  const [fullName, setFullName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [currentRole, setCurrentRole] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [isEmployed, setIsEmployed] = useState(true);
  const [yearsExperience, setYearsExperience] = useState('');
  const [location, setLocation] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const isRecruiter = profile?.account_type === 'recruiter';

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
        if (profiles.length > 0) {
          const p = profiles[0];
          setProfile(p);
          setFullName(p.full_name || user.full_name || '');
          setProfilePicture(p.profile_picture || '');
          setCurrentRole(p.current_role || '');
          setCurrentCompany(p.current_company || '');
          setIsEmployed(p.is_currently_employed !== false);
          setYearsExperience(p.years_experience || '');
          setLocation(p.location || '');
          setTargetSalary(p.target_salary || '');
          setBio(p.bio || '');
          setLinkedinUrl(p.linkedin_url || '');
          setSkills(p.skills || []);
        } else {
          navigate('/onboarding/account-type', { replace: true });
        }
      } catch {
        navigate('/landing', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfilePicture(file_url);
    } catch {
      // ignore
    } finally {
      setUploadingPic(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleLinkedInImportComplete = (data) => {
    if (data.full_name) setFullName(data.full_name);
    if (data.current_role) setCurrentRole(data.current_role);
    if (data.current_company) setCurrentCompany(data.current_company);
    if (data.location) setLocation(data.location);
    if (data.bio) setBio(data.bio);
    if (data.skills && data.skills.length > 0) setSkills(data.skills);
    if (data.linkedin_url) setLinkedinUrl(data.linkedin_url);
  };

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!yearsExperience) e.yearsExperience = 'Years of experience is required';
    if (!location) e.location = 'Location is required';
    if (!bio.trim()) e.bio = 'Bio is required';
    if (skills.length === 0) e.skills = 'Add at least one skill';
    if (isEmployed) {
      if (!currentRole.trim()) e.currentRole = 'Current role is required';
      if (!currentCompany.trim()) e.currentCompany = 'Current company is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await base44.entities.Profile.update(profile.id, {
        full_name: fullName,
        profile_picture: profilePicture,
        current_role: isEmployed ? currentRole : '',
        current_company: isEmployed ? currentCompany : '',
        is_currently_employed: isEmployed,
        years_experience: yearsExperience,
        location,
        target_salary: isRecruiter ? '' : targetSalary,
        bio,
        linkedin_url: linkedinUrl,
        skills,
        open_to_work: isRecruiter ? false : true,
        onboarding_complete: true,
      });
      navigate('/discover', { replace: true });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-7 h-7 border-2 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClass = "w-full h-[44px] border border-input rounded-xl px-3.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "text-[12px] font-medium text-foreground/70 mb-1.5 block";
  const errorClass = "text-[11px] text-destructive mt-1";

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-secondary/60 via-secondary/40 to-brand-green-bg/40 flex justify-center overflow-y-auto no-scrollbar">
      <div className="w-full max-w-[600px] min-h-[100dvh] bg-white flex flex-col">
        {/* Header */}
        <div className="px-6 pt-14 pb-4 flex items-center justify-between">
          <button onClick={() => navigate('/onboarding/account-type')} className="p-1 -ml-1">
            <ArrowLeft size={20} className="text-foreground/60" />
          </button>
          <Logo size="sm" />
          <div className="w-7" />
        </div>

        <div className="px-6 pb-6">
          <h1 className="text-[20px] font-semibold text-foreground">Set up your profile</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {isRecruiter ? "This is how you'll appear to candidates" : "This is how you'll appear to recruiters"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
          {/* LinkedIn connect — prominent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl p-[1.5px] bg-gradient-to-br from-linkedin via-primary to-linkedin mb-5"
          >
            <button
              onClick={() => setLinkedInImportOpen(true)}
              className="w-full bg-white rounded-3xl p-5 flex items-center gap-4 hover:bg-brand-green-bg/30 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-linkedin flex items-center justify-center flex-shrink-0 shadow-sm">
                <Linkedin size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-foreground">Connect LinkedIn</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  Auto-fill your profile in seconds — experience, skills, and more
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-linkedin/10 flex items-center justify-center flex-shrink-0">
                <ArrowRight size={14} className="text-linkedin" />
              </div>
            </button>
          </motion.div>

          {/* Profile picture */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-[88px] h-[88px] rounded-full overflow-hidden border-2 border-border group"
            >
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
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
              {uploadingPic ? 'Uploading...' : 'Tap to upload photo'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <p className="text-[11px] text-muted-foreground/60 mb-4 uppercase tracking-wider font-medium">Or fill manually</p>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: '' }); }}
                placeholder="Alex Rivera"
                className={`${inputClass} ${errors.fullName ? 'border-destructive' : ''}`}
              />
              {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
            </div>

            {/* Employment status toggle */}
            <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl">
              <div>
                <div className="text-[13px] font-medium text-foreground">
                  {isRecruiter ? 'Currently recruiting' : 'Currently employed'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isRecruiter ? 'Active recruiter at a company' : 'I have a current role'}
                </div>
              </div>
              <button
                onClick={() => setIsEmployed(!isEmployed)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isEmployed ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isEmployed ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {isEmployed && (
              <>
                <div>
                  <label className={labelClass}>{isRecruiter ? 'Your Role *' : 'Current Role *'}</label>
                  <input
                    value={currentRole}
                    onChange={(e) => { setCurrentRole(e.target.value); if (errors.currentRole) setErrors({ ...errors, currentRole: '' }); }}
                    placeholder={isRecruiter ? 'Senior Recruiter' : 'Product Manager'}
                    className={`${inputClass} ${errors.currentRole ? 'border-destructive' : ''}`}
                  />
                  {errors.currentRole && <p className={errorClass}>{errors.currentRole}</p>}
                </div>
                <div>
                  <label className={labelClass}>{isRecruiter ? 'Company you recruit for *' : 'Current Company *'}</label>
                  <input
                    value={currentCompany}
                    onChange={(e) => { setCurrentCompany(e.target.value); if (errors.currentCompany) setErrors({ ...errors, currentCompany: '' }); }}
                    placeholder={isRecruiter ? 'Acme Corp' : 'Stripe'}
                    className={`${inputClass} ${errors.currentCompany ? 'border-destructive' : ''}`}
                  />
                  {errors.currentCompany && <p className={errorClass}>{errors.currentCompany}</p>}
                </div>
              </>
            )}

            {!isEmployed && !isRecruiter && (
              <div className="p-3.5 bg-brand-green-bg rounded-xl">
                <div className="text-[12px] text-primary font-medium">Open to new opportunities</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Your profile will show as "Open" to recruiters
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Years of Experience *</label>
              <button
                onClick={() => setYearsPickerOpen(true)}
                className={`${inputClass} flex items-center justify-between ${errors.yearsExperience ? 'border-destructive' : ''}`}
              >
                <span className={yearsExperience ? 'text-foreground' : 'text-muted-foreground/50'}>
                  {yearsExperience || 'Select years of experience'}
                </span>
                <ChevronDown size={16} className="text-muted-foreground/50" />
              </button>
              {errors.yearsExperience && <p className={errorClass}>{errors.yearsExperience}</p>}
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

            {!isRecruiter && (
              <div>
                <label className={labelClass}>Target Salary</label>
                <input
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(e.target.value)}
                  placeholder="$160k – $200k"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Bio *</label>
              <textarea
                value={bio}
                onChange={(e) => { setBio(e.target.value); if (errors.bio) setErrors({ ...errors, bio: '' }); }}
                placeholder="Brief summary of your background and what you're looking for..."
                rows={3}
                className={`w-full border border-input rounded-xl px-3.5 py-2.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${errors.bio ? 'border-destructive' : ''}`}
              />
              {errors.bio && <p className={errorClass}>{errors.bio}</p>}
            </div>

            {/* Skills */}
            <div>
              <label className={labelClass}>Top Skills *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-brand-green-light text-primary"
                  >
                    {skill}
                    <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>
                      <X size={12} className="text-primary/60 hover:text-primary" />
                    </button>
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                  <Plus size={12} />
                  Add
                </span>
              </div>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type a skill and press Enter"
                className={inputClass}
              />
              {errors.skills && <p className={errorClass}>{errors.skills}</p>}
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className={labelClass}>LinkedIn Profile URL</label>
              <div className="relative">
                <Linkedin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                {isRecruiter
                  ? 'Candidates can view your LinkedIn for more context'
                  : 'Recruiters can view your LinkedIn for more context'}
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="px-6 pb-8 pt-3 bg-white border-t border-border/30">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-[52px] bg-primary text-white rounded-2xl text-[15px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
            {!saving && <ArrowRight size={17} />}
          </button>
        </div>
      </div>

      {/* Sheets */}
      <LinkedInImportSheet
        open={linkedInImportOpen}
        onClose={() => setLinkedInImportOpen(false)}
        onImport={handleLinkedInImportComplete}
      />
      <PickerSheet
        open={yearsPickerOpen}
        onClose={() => setYearsPickerOpen(false)}
        title="Years of Experience"
        items={yearsOptions}
        value={yearsExperience}
        onChange={setYearsExperience}
      />
    </div>
  );
}