import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { target_profile_id, action, context_job_id, target_type } = body;

    if (!target_profile_id || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['pass', 'like', 'super'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (target_type && !['job', 'candidate'].includes(target_type)) {
      return Response.json({ error: 'Invalid target type' }, { status: 400 });
    }

    // Get user's profile
    const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    // Prevent swiping on self
    if (target_profile_id === profile.id) {
      return Response.json({ error: 'Cannot swipe on yourself' }, { status: 400 });
    }

    // Prevent duplicate swipes — check if already swiped on this target
    const existingSwipes = await base44.entities.Swipe.filter({
      swiper_profile_id: profile.id,
      target_profile_id,
    });
    if (existingSwipes.length > 0) {
      return Response.json({ error: 'Already swiped on this profile' }, { status: 409 });
    }

    // Create the swipe record (user-scoped so created_by_id is set correctly)
    await base44.entities.Swipe.create({
      swiper_profile_id: profile.id,
      target_profile_id,
      target_type: target_type || 'candidate',
      action,
      context_job_id: context_job_id || null,
    });

    // Only check for match on like or super
    if (action !== 'like' && action !== 'super') {
      return Response.json({ matched: false });
    }

    // Use service role for cross-user queries (RLS restricts user-scoped reads)
    const serviceBase = base44.asServiceRole;

    // Check if the target has already swiped like/super on the current user
    const reverseSwipes = await serviceBase.entities.Swipe.filter({
      swiper_profile_id: target_profile_id,
      target_profile_id: profile.id,
    });

    const hasMutualInterest = reverseSwipes.some(s => s.action === 'like' || s.action === 'super');
    if (!hasMutualInterest) {
      return Response.json({ matched: false });
    }

    // Check if a match already exists (either direction)
    const existingAs1 = await serviceBase.entities.Match.filter({
      profile1_id: profile.id,
      profile2_id: target_profile_id,
    });
    const existingAs2 = await serviceBase.entities.Match.filter({
      profile1_id: target_profile_id,
      profile2_id: profile.id,
    });

    const hasBlockingMatch = [...existingAs1, ...existingAs2].some(
      m => m.status === 'active' || m.status === 'blocked'
    );
    if (hasBlockingMatch) {
      return Response.json({ matched: false });
    }

    // Get the target profile for match data
    const targetProfile = await serviceBase.entities.Profile.get(target_profile_id);
    if (!targetProfile) {
      return Response.json({ matched: false });
    }

    // Build match data based on who is swiping
    const isRecruiter = profile.account_type === 'recruiter';

    let jobId = null;
    let jobTitle = targetProfile.current_role || 'New Role';
    let companyName = targetProfile.current_company || '';

    if (!isRecruiter && context_job_id) {
      // Job seeker swiped on a job — fetch job details
      try {
        const job = await serviceBase.entities.Job.get(context_job_id);
        if (job) {
          jobId = context_job_id;
          jobTitle = job.title || jobTitle;
          companyName = job.company || companyName;
        }
      } catch {
        // fall back to profile data
      }
    }

    // Create the match (user-scoped so created_by_id = current user)
    const match = await base44.entities.Match.create({
      profile1_id: profile.id,
      profile2_id: target_profile_id,
      profile1_user_id: profile.created_by_id,
      profile2_user_id: targetProfile.created_by_id,
      job_id: jobId,
      job_title: jobTitle,
      company_name: companyName,
      profile1_name: profile.full_name,
      profile2_name: targetProfile.full_name,
      profile1_picture: profile.profile_picture || '',
      profile2_picture: targetProfile.profile_picture || '',
      profile1_role: profile.current_role || '',
      profile2_role: targetProfile.current_role || '',
      profile1_linkedin: profile.linkedin_url || '',
      profile2_linkedin: targetProfile.linkedin_url || '',
      status: 'active',
    });

    return Response.json({ matched: true, match });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});