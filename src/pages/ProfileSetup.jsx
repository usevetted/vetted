import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Linkedin, ArrowRight, X, Plus, ArrowLeft, Check } from 'lucide-react';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleLinkedInImport = () => {
    const url = window.prompt('Enter your LinkedIn profile URL to import:');
    if (url) {
      setLinkedinUrl(url);
      // Simulate partial import
      if (!fullName) setFullName('Imported from LinkedIn');
      if (!bio) setBio('Profile imported from LinkedIn. Edit your details below.');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) return;
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

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen shadow-[0_0_60px_rgba(0,0,0,0.06)] flex flex-col">
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
            {isRecruiter ? 'This is how you\'ll appear to candidates' : 'This is how you\'ll appear to recruiters'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
          {/* LinkedIn import */}
          <button
            onClick={handleLinkedInImport}
            className="w-full bg-brand-green-bg border border-brand-green-light rounded-2xl p-3.5 flex items-center gap-3 mb-6 hover:bg-brand-green-light/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-linkedin flex items-center justify-center flex-shrink-0">
              <Linkedin size={18} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-[13px] font-medium text-primary">Import from LinkedIn</div>
              <div className="text-[11px] text-muted-foreground">Auto-fill your experience & skills</div>
            </div>
            <ArrowRight size={16} className="text-primary" />
          </button>

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
              <label className={labelClass}>Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className={inputClass}
              />
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
                  <label className={labelClass}>{isRecruiter ? 'Your Role' : 'Current Role'}</label>
                  <input
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder={isRecruiter ? 'Senior Recruiter' : 'Product Manager'}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{isRecruiter ? 'Company you recruit for' : 'Current Company'}</label>
                  <input
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder={isRecruiter ? 'Acme Corp' : 'Stripe'}
                    className={inputClass}
                  />
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
              <label className={labelClass}>Years of Experience</label>
              <input
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="5 years"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className={inputClass}
              />
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
              <label className={labelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your background and what you're looking for..."
                rows={3}
                className="w-full border border-input rounded-xl px-3.5 py-2.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className={labelClass}>Top Skills</label>
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
            disabled={saving || !fullName.trim()}
            className="w-full h-[52px] bg-primary text-white rounded-2xl text-[15px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
            {!saving && <ArrowRight size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}