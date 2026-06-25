import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Camera, Linkedin, Briefcase, MapPin, DollarSign, X, Plus, Pencil, Check, Building2, ChevronDown, Menu } from 'lucide-react';
import ResumeLink from '@/components/ResumeLink';
import Logo from '@/components/Logo';
import PickerSheet from '@/components/PickerSheet';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import ResumeUpload from '@/components/ResumeUpload';
import MenuDrawer from '@/components/MenuDrawer';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { yearsOptions } from '@/lib/profileConstants';
import SkillsPicker from '@/components/SkillsPicker';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useOutletContext();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [yearsPickerOpen, setYearsPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  const [fullName, setFullName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [isEmployed, setIsEmployed] = useState(true);
  const [yearsExperience, setYearsExperience] = useState('');
  const [location, setLocation] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [skills, setSkills] = useState([]);
  const [profilePicture, setProfilePicture] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [saveError, setSaveError] = useState('');

  const isRecruiter = profile?.account_type === 'recruiter';

  const completeness = useMemo(() => {
    if (!profile) return 0;
    const fields = isRecruiter
      ? ['full_name', 'current_role', 'current_company', 'location', 'bio', 'profile_picture']
      : ['full_name', 'current_role', 'location', 'bio', 'profile_picture', 'resume_url', 'years_experience'];
    const total = isRecruiter ? 6 : 8;
    let filled = 0;
    fields.forEach(f => {
      if (profile[f] && String(profile[f]).trim()) filled++;
    });
    if (!isRecruiter && profile.skills && profile.skills.length > 0) filled++;
    return Math.round((filled / total) * 100);
  }, [profile, isRecruiter]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCurrentRole(profile.current_role || '');
      setCurrentCompany(profile.current_company || '');
      setIsEmployed(profile.is_currently_employed !== false);
      setYearsExperience(profile.years_experience || '');
      setLocation(profile.location || '');
      setTargetSalary(profile.target_salary || '');
      setBio(profile.bio || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setSkills(profile.skills || []);
      setProfilePicture(profile.profile_picture || '');
      setResumeUrl(profile.resume_url || '');
    }
  }, [profile]);

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

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const updated = await base44.entities.Profile.update(profile.id, {
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
        resume_url: isRecruiter ? '' : resumeUrl,
        skills,
      });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear all local session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    
    // Hard redirect to login
    window.location.href = '/login';
  };

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const inputClass = "w-full h-[44px] border border-input rounded-xl px-3.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "text-[12px] font-medium text-foreground/70 mb-1.5 block";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 relative z-10">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-primary px-4 py-2.5 rounded-xl hover:bg-brand-green-bg transition-colors cursor-pointer relative z-30 min-h-[44px]"
            >
              <Pencil size={15} />
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-[13px] font-medium text-primary px-4 py-2.5 rounded-xl hover:bg-brand-green-bg transition-colors disabled:opacity-40 cursor-pointer relative z-30 min-h-[44px]"
            >
              <Check size={14} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center text-[13px] font-medium text-primary px-3 py-2.5 rounded-xl hover:bg-brand-green-bg transition-colors cursor-pointer relative z-30 min-h-[44px]"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mx-5 mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-[13px]">
          {saveError}
        </div>
      )}

      {/* Profile header */}
      <div className="flex flex-col items-center px-6 pb-6">
        <div className="relative">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-border">
            {profilePicture ? (
              <img src={profilePicture} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-[28px] font-semibold text-primary">
                {initials}
              </div>
            )}
          </div>
          {editing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md"
            >
              <Camera size={15} className="text-white" />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        <h2 className="text-[18px] font-semibold text-foreground mt-3">{fullName}</h2>
        {isEmployed ? (
          <p className="text-[13px] text-muted-foreground">
            {currentRole}{currentCompany ? ` at ${currentCompany}` : ''}
          </p>
        ) : (
          <p className="text-[13px] text-primary font-medium">
            {isRecruiter ? 'Available' : 'Open to opportunities'}
          </p>
        )}
        {profile?.location && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} className="text-muted-foreground/50" />
            <span className="text-[12px] text-muted-foreground">{profile.location}</span>
          </div>
        )}
      </div>

      {editing ? (
        /* Edit mode */
        <div className="px-6 pb-8 space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl">
            <div>
              <div className="text-[13px] font-medium text-foreground">
                {isRecruiter ? 'Currently recruiting' : 'Currently employed'}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {isRecruiter ? 'I recruit on behalf of a company' : 'I have a current role'}
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
                <input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{isRecruiter ? 'Company you recruit for' : 'Current Company'}</label>
                <input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} className={inputClass} />
              </div>
            </>
          )}

          {!isEmployed && isRecruiter && (
            <p className="text-[12px] text-muted-foreground mt-1 px-1">
              You'll appear as an independent recruiter / headhunter.
            </p>
          )}

          <div>
            <label className={labelClass}>Years of Experience</label>
            <button
              onClick={() => setYearsPickerOpen(true)}
              className={`${inputClass} flex items-center justify-between`}
            >
              <span className={yearsExperience ? 'text-foreground' : 'text-muted-foreground/50'}>
                {yearsExperience || 'Select years of experience'}
              </span>
              <ChevronDown size={16} className="text-muted-foreground/50" />
            </button>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
            />
          </div>
          {!isRecruiter && (
            <div>
              <label className={labelClass}>Target Salary</label>
              <input value={targetSalary} onChange={(e) => setTargetSalary(e.target.value)} className={inputClass} />
            </div>
          )}
          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full border border-input rounded-xl px-3.5 py-2.5 text-[14px] bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className={labelClass}>Skills</label>
            <div className="p-3 rounded-xl bg-muted/20 border border-border/40">
              <SkillsPicker selected={skills} onChange={setSkills} maxHeight="180px" />
            </div>
          </div>
          <div>
            <label className={labelClass}>LinkedIn Profile URL</label>
            <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} placeholder="linkedin.com/in/username" />
          </div>
          {!isRecruiter && (
            <ResumeUpload value={resumeUrl} onChange={setResumeUrl} />
          )}
        </div>
      ) : (
        /* View mode */
        <div className="px-6 pb-8 space-y-5">
          {completeness < 100 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-muted-foreground">
                  Profile {completeness}% complete
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          )}

          {/* Account type badge */}
          <div className="flex items-center gap-2 p-3 bg-brand-green-bg rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-brand-green-light flex items-center justify-center">
              <Briefcase size={15} className="text-primary" />
            </div>
            <div>
              <div className="text-[12px] font-medium text-primary capitalize">
                {isRecruiter ? 'Recruiter Account' : 'Job Seeker Account'}
              </div>
              <div className="text-[11px] text-muted-foreground">{profile?.years_experience || 'Experience not specified'}</div>
            </div>
          </div>

          {bio && (
            <div>
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h3>
              <p className="text-[13px] text-foreground/80 leading-relaxed">{bio}</p>
            </div>
          )}

          {skills && skills.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-brand-green-light text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h3>
            <div className="space-y-2">
              {isEmployed && currentCompany && (
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-muted-foreground/50" />
                  <span className="text-[13px] text-foreground/80">{currentCompany}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-muted-foreground/50" />
                  <span className="text-[13px] text-foreground/80">{location}</span>
                </div>
              )}
              {!isRecruiter && targetSalary && (
                <div className="flex items-center gap-3">
                  <DollarSign size={16} className="text-muted-foreground/50" />
                  <span className="text-[13px] text-foreground/80">{targetSalary}</span>
                </div>
              )}
            </div>
          </div>

          {linkedinUrl && (
            <div>
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">LinkedIn</h3>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-linkedin flex items-center justify-center flex-shrink-0">
                  <Linkedin size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-foreground">View LinkedIn Profile</div>
                  <div className="text-[11px] text-muted-foreground truncate">{linkedinUrl}</div>
                </div>
              </a>
            </div>
          )}

          {!isRecruiter && resumeUrl && (
            <ResumeLink url={resumeUrl} />
          )}


        </div>
      )}

      <PickerSheet
        open={yearsPickerOpen}
        onClose={() => setYearsPickerOpen(false)}
        title="Years of Experience"
        items={yearsOptions}
        value={yearsExperience}
        onChange={setYearsExperience}
      />

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        profile={profile}
      />
    </div>
  );
}