import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import speakeasy from 'npm:speakeasy@2.0.0';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Generate a unique TOTP secret
    const secret = speakeasy.generateSecret({
      name: `JobMatch (${user.email})`,
      issuer: 'JobMatch',
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Store the pending secret on the user's account (not yet activated)
    await base44.auth.updateMe({
      two_fa_pending_secret: secret.base32,
      two_fa_enabled: false, // Not enabled until verified
    });

    return Response.json({
      data: {
        qrCode: qrCode,
        secret: secret.base32,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});