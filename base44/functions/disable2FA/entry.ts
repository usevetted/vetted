import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { authenticator } from 'npm:otplib@12.0.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    const userRecord = await base44.asServiceRole.entities.User.get(user.id);
    if (!userRecord?.totp_secret) {
      return Response.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    const isValid = authenticator.check(code, userRecord.totp_secret);
    if (!isValid) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    await base44.asServiceRole.entities.User.update(user.id, {
      totp_secret: null,
      two_fa_enabled: false,
    });

    return Response.json({ success: true, message: '2FA has been disabled' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});