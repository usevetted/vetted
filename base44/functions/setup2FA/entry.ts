import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { default as QRCode } from 'npm:qrcode@1.5.3';
import { authenticator } from 'npm:otplib@12.0.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = authenticator.generateSecret({
      name: `Vetted (${user.email})`,
      issuer: 'Vetted',
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return Response.json({
      secret: secret.secret,
      qrCode,
      otpauth_url: secret.otpauth_url,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});