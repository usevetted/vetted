import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({
      email_change_token: token,
    });

    if (!users || users.length === 0) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const user = users[0];
    const now = new Date();
    const expiry = new Date(user.email_change_token_expiry);

    if (now > expiry) {
      return Response.json({ error: 'Verification link has expired' }, { status: 400 });
    }

    const newEmail = user.pending_email;

    await base44.asServiceRole.entities.User.update(user.id, {
      email: newEmail,
      pending_email: null,
      email_change_token: null,
      email_change_token_expiry: null,
    });

    return Response.json({ success: true, message: 'Email has been updated' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});