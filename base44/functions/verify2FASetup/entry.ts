import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { authenticator } from 'npm:otplib@12.0.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { secret, code } = body;

    if (!secret || !code) {
      return Response.json({ error: 'Secret and code are required' }, { status: 400 });
    }

    const isValid = authenticator.check(code, secret);
    if (!isValid) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    await base44.asServiceRole.entities.User.update(user.id, {
      totp_secret: secret,
      two_fa_enabled: true,
    });

    return Response.json({ success: true, message: '2FA has been enabled' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});