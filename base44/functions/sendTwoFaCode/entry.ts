import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try {
      user = await base44.auth.me();
    } catch (err) {
      console.error('[sendTwoFaCode] Failed to get user:', err.message);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error('[sendTwoFaCode] Failed to parse request body:', err.message);
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Save code and expiry to user account
    let updateResult;
    try {
      updateResult = await base44.asServiceRole.entities.User.update(user.id, {
        two_fa_code: code,
        two_fa_code_expiry: expiryTime,
      });
    } catch (err) {
      console.error('[sendTwoFaCode] Failed to save code to user:', err.message);
      return Response.json({ error: 'Failed to save verification code' }, { status: 500 });
    }

    // Send SMS via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromPhone) {
      console.error('[sendTwoFaCode] Missing Twilio credentials');
      return Response.json({ error: 'SMS service not configured' }, { status: 500 });
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    let smsResult;
    try {
      smsResult = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromPhone,
          To: phoneNumber,
          Body: `Your verification code is: ${code}. Valid for 10 minutes.`,
        }).toString(),
      });
    } catch (err) {
      console.error('[sendTwoFaCode] Failed to send SMS:', err.message);
      return Response.json({ error: 'Failed to send SMS code' }, { status: 500 });
    }

    if (!smsResult.ok) {
      let errorDetail;
      try {
        const errorBody = await smsResult.json();
        errorDetail = errorBody.message || smsResult.statusText;
      } catch {
        errorDetail = smsResult.statusText;
      }
      console.error(`[sendTwoFaCode] Twilio error (${smsResult.status}):`, errorDetail);
      return Response.json({ error: 'Failed to send SMS code' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'SMS code sent to ' + phoneNumber });
  } catch (error) {
    console.error('[sendTwoFaCode] Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});