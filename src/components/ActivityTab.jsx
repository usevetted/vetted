import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LoadingScreen from '@/components/LoadingScreen';

export default function ActivityTab({ profile, isRecruiter }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      try {
        if (isRecruiter) {
          const jobs = await base44.entities.Job.filter({ recruiter_profile_id: profile.id });
          const withCounts = await Promise.all(jobs.map(async (job) => {
            const swipes = await base44.entities.Swipe.filter({ context_job_id: job.id }).catch(() => []);
            const likeCount = swipes.filter(s => s.action === 'like' || s.action === 'super').length;
            return { job, likeCount };
          }));
          setItems(withCounts.sort((a, b) => new Date(b.job.created_date) - new Date(a.job.created_date)));
        } else {
          const swipes = await base44.entities.Swipe.filter({ swiper_profile_id: profile.id });
          const likedJobSwipes = swipes.filter(s => (s.action === 'like' || s.action === 'super') && s.context_job_id);
          if (likedJobSwipes.length === 0) { setItems([]); return; }
          const jobs = await Promise.all(likedJobSwipes.map(s => base44.entities.Job.get(s.context_job_id).catch(() => null)));
          setItems(likedJobSwipes.map((swipe, i) => ({ swipe, job: jobs[i] })).filter(c => c.job));
        }
      } catch (err) {
        console.error('ActivityTab error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile, isRecruiter]);

  if (loading) return <LoadingScreen fullscreen={false} />;

  const interestColor = (level) => {
    if (level === 'high') return 'text-green-600 bg-green-50 border-green-200';
    if (level === 'low') return 'text-orange-500 bg-orange-50 border-orange-200';
    return 'text-blue-500 bg-blue-50 border-blue-200';
  };
  const interestLabel = (level) => {
    if (level === 'high') return 'High';
    if (level === 'low') return 'Low';
    return 'Medium';
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-full bg-brand-green-bg flex items-center justify-center mb-4">
          <Briefcase size={28} className="text-muted-foreground/40" />
        </div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">
          {isRecruiter ? 'No jobs posted yet' : 'No jobs liked yet'}
        </h3>
        <p className="text-[13px] text-muted-foreground">
          {isRecruiter ? 'Post your first job to start finding candidates' : 'Start swiping to find jobs you like'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 pt-3 min-h-0">
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const job = item.job;
          if (!job) return null;
          return (
            <motion.div
              key={job.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="rounded-2xl bg-card border border-border/60 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-foreground truncate">{job.title}</div>
                  <div className="text-[12px] text-muted-foreground truncate">{job.company}{job.location ? ` · ${job.location}` : ''}</div>
                  {job.salary_range && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">{job.salary_range}</div>
                  )}
                </div>
                {isRecruiter && (
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[18px] font-bold text-primary">{item.likeCount}</div>
                    <div className="text-[10px] text-muted-foreground">{item.likeCount === 1 ? 'applicant' : 'applicants'}</div>
                  </div>
                )}
                {!isRecruiter && item.swipe?.interest_level && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${interestColor(item.swipe.interest_level)}`}>
                    {interestLabel(item.swipe.interest_level)} Interest
                  </span>
                )}
              </div>
              {job.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {job.tags.slice(0, 4).map((tag, ti) => (
                    <span key={ti} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}