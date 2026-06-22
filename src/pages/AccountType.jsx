import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, Check, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { base44 } from '@/api/base44Client';

export default function AccountType() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('job_seeker');
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
        if (profiles.length > 0) {
          setExistingProfile(profiles[0]);
          setSelected(profiles[0].account_type);
        }
      } catch {
        navigate('/landing', { replace: true });
      }
    };
    check();
  }, [navigate]);

  const handleContinue = async () => {
    if (existingProfile) {
      if (existingProfile.account_type !== selected) {
        await base44.entities.Profile.update(existingProfile.id, { account_type: selected });
      }
      navigate('/onboarding/profile-setup', { replace: true });
    } else {
      try {
        const user = await base44.auth.me();
        await base44.entities.Profile.create({
          account_type: selected,
          full_name: user.full_name || '',
          onboarding_complete: false,
          is_currently_employed: true,
          open_to_work: true,
        });
        navigate('/onboarding/profile-setup', { replace: true });
      } catch (e) {
        // fallback navigation
        navigate('/onboarding/profile-setup', { replace: true });
      }
    }
  };

  const cards = [
    {
      id: 'job_seeker',
      title: 'Job Seeker',
      desc: 'Browse and match with roles',
      icon: Search,
      iconBg: 'bg-brand-green-light',
      iconColor: 'text-primary',
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      desc: 'Source and match candidates',
      icon: Users,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[440px] px-6 pt-14 pb-12 min-h-screen shadow-[0_0_60px_rgba(0,0,0,0.06)] flex flex-col">
        <div className="flex flex-col items-center mb-1">
          <Logo size="sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col"
        >
          <h1 className="text-[20px] font-semibold text-foreground mt-8 mb-1">I am a</h1>
          <p className="text-[13px] text-muted-foreground mb-7">Choose how you'll use Vetted</p>

          <div className="flex flex-col gap-3">
            {cards.map((card) => {
              const isSelected = selected === card.id;
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => setSelected(card.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-[1.5px] transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-brand-green-bg'
                      : 'border-border bg-white hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    <Icon size={18} className={card.iconColor} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-[14px] font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {card.title}
                    </div>
                    <div className="text-[12px] text-muted-foreground">{card.desc}</div>
                  </div>
                  <div
                    className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-primary' : 'border-[1.5px] border-border'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={handleContinue}
              className="w-full h-[52px] bg-primary text-white rounded-2xl text-[15px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={17} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}