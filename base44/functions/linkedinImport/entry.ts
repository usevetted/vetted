import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LINKEDIN_CONNECTOR_ID = '6a3a94d24fa3875df2b2acf3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getCurrentAppUserConnection(LINKEDIN_CONNECTOR_ID);
      accessToken = conn.accessToken;
    } catch {
      return Response.json({ error: 'not_connected' }, { status: 404 });
    }

    // Use OpenID Connect userinfo endpoint (only requires openid, profile, email scopes)
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      return Response.json({ error: `LinkedIn API error: ${userInfoResponse.status}` }, { status: 502 });
    }

    const userInfo = await userInfoResponse.json();

    const fullName = userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim();
    const email = userInfo.email || '';
    const profilePicture = userInfo.picture || '';

    return Response.json({
      full_name: fullName,
      current_role: '',
      current_company: '',
      headline: '',
      email,
      profile_picture: profilePicture,
      linkedin_url: '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});