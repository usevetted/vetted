import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Linkedin, Briefcase, MapPin, DollarSign, X, Plus, LogOut, Pencil, Check, Building2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useOutletContext();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

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
  const [skillInput, setSkillInput] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const isRecruiter = profile?.account_type === 'recruiter';

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

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
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
        skills,
      });
      setProfile(updated);
      setEditing(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch {
      // ignore
    }
    window.location.href = '/landing';
  };

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const inputClass = "w-full h-[44px] border border-input rounded-xl px-3.5 text-[14px] text-foreground bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "text-[12px] font-medium text-foreground/70 mb-1.5 block";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3 relative z-10">
        <Logo size="sm" />
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
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center px-6 pb-6">
        <div className="relative">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-border">
            {profilePicture ? (
              <img src={profilePicture} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-green-light flex items-center justify-center text-[28px] font-semibold text-primary">
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
                <input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{isRecruiter ? 'Company you recruit for' : 'Current Company'}</label>
                <input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} className={inputClass} />
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>Years of Experience</label>
            <input value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
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
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-brand-green-light text-primary">
                  {skill}
                  <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>
                    <X size={12} className="text-primary/60" />
                  </button>
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                <Plus size={12} /> Add
              </span>
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              className={inputClass}
              placeholder="Type a skill and press Enter"
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn Profile URL</label>
            <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} placeholder="linkedin.com/in/username" />
          </div>
        </div>
      ) : (
        /* View mode */
        <div className="px-6 pb-8 space-y-5">
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

          <button
            onClick={handleLogout}
            className="w-full h-[48px] border border-border rounded-2xl text-[14px] font-medium text-muted-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}