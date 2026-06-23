import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try {
      user = await base44.auth.me();
    } catch (err) {
      console.error('[verifyTwoFaLogin] Failed to get user:', err.message);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error('[verifyTwoFaLogin] Failed to parse request body:', err.message);
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { code } = body;

    if (!code) {
      return Response.json({ error: 'Verification code is required' }, { status: 400 });
    }

    if (!user.two_fa_enabled) {
      return Response.json({ error: '2FA not enabled' }, { status: 400 });
    }

    if (!user.two_fa_code) {
      return Response.json({ error: 'No verification code sent' }, { status: 400 });
    }

    // Check code expiry
    let expiry;
    try {
      expiry = new Date(user.two_fa_code_expiry);
    } catch (err) {
      console.error('[verifyTwoFaLogin] Invalid expiry date format:', err.message);
      return Response.json({ error: 'Invalid verification state' }, { status: 400 });
    }

    if (new Date() > expiry) {
      return Response.json({ error: 'Code expired' }, { status: 400 });
    }

    // Verify code matches
    if (user.two_fa_code !== code) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Clear the code (already verified)
    let clearResult;
    try {
      clearResult = await base44.asServiceRole.entities.User.update(user.id, {
        two_fa_code: null,
        two_fa_code_expiry: null,
      });
    } catch (err) {
      console.error('[verifyTwoFaLogin] Failed to clear verification code:', err.message);
      return Response.json({ error: 'Verification failed' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Login verified' });
  } catch (error) {
    console.error('[verifyTwoFaLogin] Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});