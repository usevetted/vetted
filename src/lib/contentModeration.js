import { base44 } from '@/api/base44Client';

export async function moderateContent(content) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
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

Message to analyze: "${content.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
      response_json_schema: {
        type: 'object',
        properties: {
          allowed: { type: 'boolean' },
          reason: { type: 'string' }
        }
      }
    });

    if (result && result.allowed === true) {
      return { blocked: false, reason: '' };
    }
    if (result && result.allowed === false) {
      return {
        blocked: true,
        reason: result.reason || 'This message violates our community guidelines.'
      };
    }
    return { blocked: false, reason: '' };
  } catch {
    return { blocked: false, reason: '' };
  }
}