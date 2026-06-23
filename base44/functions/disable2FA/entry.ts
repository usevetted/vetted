import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import speakeasy from 'npm:speakeasy@2.0.0';

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

    if (!user.two_fa_secret) {
      return Response.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    // Verify the TOTP code using the stored secret
    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow ±2 time steps for clock skew
    });

    if (!verified) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Remove the secret and disable 2FA
    await base44.auth.updateMe({
      two_fa_secret: null,
      two_fa_pending_secret: null,
      two_fa_enabled: false,
    });

    return Response.json({
      data: {
        message: '2FA disabled successfully',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});