import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import speakeasy from 'npm:speakeasy@2.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { secret, code } = body;

    if (!secret || !code) {
      return Response.json({ error: 'Missing secret or code' }, { status: 400 });
    }

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow ±2 time steps for clock skew
    });

    if (!verified) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Permanently save the secret and enable 2FA
    await base44.auth.updateMe({
      two_fa_secret: secret,
      two_fa_pending_secret: null, // Clear pending
      two_fa_enabled: true,
    });

    return Response.json({
      data: {
        message: '2FA enabled successfully',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});