import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LINKEDIN_CONNECTOR_ID = '6a3a8d0e8bb5cd3a913bcb30';

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

    // Fetch basic profile from LinkedIn
    const meResponse = await fetch(
      'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,localizedHeadline,vanityName,profilePicture(displayImage~:playableStreams))',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!meResponse.ok) {
      return Response.json({ error: `LinkedIn API error: ${meResponse.status}` }, { status: 502 });
    }

    const meData = await meResponse.json();

    // Fetch email and name from userinfo endpoint
    let email = '';
    let profilePicture = '';
    try {
      const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        email = userInfo.email || '';
        if (userInfo.picture) profilePicture = userInfo.picture;
      }
    } catch {
      // userinfo might not be available
    }

    // Get profile picture from /v2/me if not from userinfo
    if (!profilePicture && meData.profilePicture) {
      const elements = meData.profilePicture['displayImage~']?.elements;
      if (elements && elements.length > 0) {
        const lastElement = elements[elements.length - 1];
        if (lastElement?.identifiers?.[0]?.identifier) {
          profilePicture = lastElement.identifiers[0].identifier;
        }
      }
    }

    const fullName = `${meData.localizedFirstName || ''} ${meData.localizedLastName || ''}`.trim();
    const headline = meData.localizedHeadline || '';
    const vanityName = meData.vanityName || '';

    // Use LLM to parse headline into role and company
    let currentRole = '';
    let currentCompany = '';
    if (headline) {
      try {
        const llmResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Parse this LinkedIn headline into a job title and company name. Return JSON with "current_role" and "current_company" fields. If either can't be determined, return an empty string for that field.\n\nHeadline: "${headline}"`,
          response_json_schema: {
            type: 'object',
            properties: {
              current_role: { type: 'string' },
              current_company: { type: 'string' },
            },
          },
        });

        let parsed = llmResult?.data || llmResult;
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
        }
        currentRole = parsed?.current_role || '';
        currentCompany = parsed?.current_company || '';
      } catch {
        // LLM parsing failed — leave role/company empty
      }
    }

    return Response.json({
      full_name: fullName,
      current_role: currentRole,
      current_company: currentCompany,
      headline,
      email,
      profile_picture: profilePicture,
      linkedin_url: vanityName ? `https://www.linkedin.com/in/${vanityName}` : '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});