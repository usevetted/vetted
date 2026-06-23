import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, company, location, remote, salary_range, description, tags, company_size, recruiter_profile_id, recruiter_name, recruiter_linkedin } = body;

    if (!title || !company || !location || !description) {
      return Response.json({ error: 'Missing required fields: title, company, location, description' }, { status: 400 });
    }

    const job = await base44.entities.Job.create({
      title,
      company,
      location,
      remote: remote || false,
      salary_range: salary_range || '',
      description,
      tags: tags || [],
      company_size: company_size || '',
      recruiter_profile_id: recruiter_profile_id || '',
      recruiter_name: recruiter_name || '',
      recruiter_linkedin: recruiter_linkedin || '',
    });

    return Response.json({ success: true, job });
  } catch (error) {
    console.error('Create job error:', error);
    return Response.json({ error: error.message || 'Failed to create job' }, { status: 500 });
  }
});