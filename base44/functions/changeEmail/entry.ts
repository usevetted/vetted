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
    const verificationUrl = `${Deno.env.get('APP_URL') || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    // Store the pending email, token, and expiry on the user's account BEFORE sending the email
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await base44.asServiceRole.auth.updateUser(user.id, {
      pending_email: newEmail,
      email_change_token: verificationToken,
      email_change_token_expiry: tokenExpiry,
    });

    try {
      await base44.integrations.Core.SendEmail({
        to: newEmail,
        subject: 'Verify your new email address',
        body: `Hello,\n\nPlease confirm your new email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this change, please ignore this email.`,
      });
    } catch (emailError) {
      // Clear the pending email if email fails to send
      await base44.asServiceRole.auth.updateUser(user.id, {
        pending_email: null,
        email_change_token: null,
        email_change_token_expiry: null,
      });
      return Response.json({ error: `Failed to send verification email: ${emailError.message}` }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Verification email sent to ' + newEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});