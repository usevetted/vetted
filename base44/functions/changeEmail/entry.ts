import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { v4 as uuidv4 } from 'npm:uuid@9.0.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { newEmail } = body;

    if (!newEmail) {
      return Response.json({ error: 'New email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (newEmail === user.email) {
      return Response.json({ error: 'New email must be different from current email' }, { status: 400 });
    }

    const verificationToken = uuidv4();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await base44.asServiceRole.entities.User.update(user.id, {
      email_change_token: verificationToken,
      email_change_token_expiry: tokenExpiry,
      pending_email: newEmail,
    });

    const verificationUrl = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    await base44.integrations.Core.SendEmail({
      to: newEmail,
      subject: 'Verify your new email address',
      body: `Click the link below to verify your new email address:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
    });

    return Response.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});