import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { match_id, content } = body;

    if (!match_id || !content?.trim()) {
      return Response.json({ error: 'Match ID and content are required' }, { status: 400 });
    }

    const trimmed = content.trim();
    if (trimmed.length > 2000) {
      return Response.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 });
    }

    // Get user's profile
    const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    // Verify the match exists and user is a participant
    const match = await base44.entities.Match.get(match_id);
    if (!match) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }

    const isP1 = match.profile1_id === profile.id;
    const isP2 = match.profile2_id === profile.id;
    if (!isP1 && !isP2) {
      return Response.json({ error: 'Not a participant in this match' }, { status: 403 });
    }

    // Don't allow messages in archived matches
    if (match.status === 'archived' || match.status === 'blocked') {
      return Response.json({ error: 'This match is no longer active' }, { status: 403 });
    }

    // Moderate content server-side (cannot be bypassed by client)
    try {
      const moderation = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderation system for a professional networking and job matching platform called Vetted.

Analyze the following message and determine if it should be BLOCKED or ALLOWED.

BLOCK the message if it contains any of the following:
- Severe harassment or targeted bullying
- Hate speech (slurs, dehumanizing language based on race, religion, ethnicity, gender, sexual orientation, disability, nationality)
- Threats of violence or harm to others
- Child exploitation or sexualization of minors
- Non-consensual sexual content or unsolicited sexual advances
- Instructions or encouragement for illegal activities
- Self-harm encouragement or suicide promotion
- Doxxing (sharing personal information like phone numbers, home addresses, Social Security numbers without consent)
- Spam or scam attempts (phishing links, fraudulent offers, impersonation scams)

ALLOW the message if it contains:
- Mild or moderate profanity used in casual conversation
- Normal professional communication
- Personal opinions or mild disagreements
- Everyday adult language and topics
- Job-related discussions

Message to analyze: "${trimmed.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
        response_json_schema: {
          type: 'object',
          properties: {
            allowed: { type: 'boolean' },
            reason: { type: 'string' }
          }
        }
      });

      if (moderation && moderation.allowed === false) {
        return Response.json({
          error: 'blocked',
          reason: moderation.reason || 'This message violates our community guidelines.'
        }, { status: 422 });
      }
    } catch {
      // If moderation service is down, allow the message (fail-open for usability)
    }

    // Create the message
    const recipientUserId = isP1 ? (match.profile2_user_id || '') : (match.profile1_user_id || '');
    const message = await base44.entities.Message.create({
      match_id,
      sender_profile_id: profile.id,
      sender_user_id: profile.created_by_id,
      recipient_user_id: recipientUserId,
      content: trimmed,
    });

    return Response.json({ message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});