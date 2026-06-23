import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { authenticator } from 'npm:otplib@12.0.1';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Generate a TOTP secret (otplib returns a plain string)
    const secret = authenticator.generateSecret();

    // Build otpauth URL manually
    const otpauthUrl = `otpauth://totp/Vetted:${user.email}?secret=${secret}&issuer=Vetted`;

    // Generate QR code from the otpauth URL
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Store the pending secret on the user's account (not yet activated)
    await base44.auth.updateMe({
      two_fa_pending_secret: secret,
      two_fa_enabled: false, // Not enabled until verified
    });

    return Response.json({
      data: {
        qrCode: qrCode,
        secret: secret,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});