import { BrevoClient } from '@getbrevo/brevo';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@tiphive.xyz';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'TipHive';

/**
 * Sends a transactional email using Brevo (v5+ SDK)
 */
export async function sendEmail({ to, name, subject, htmlContent }: { to: string; name?: string; subject: string; htmlContent: string }) {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY is not defined. Email will not be sent.');
    return null;
  }

  const client = new BrevoClient({ apiKey: BREVO_API_KEY });

  try {
    const data = await client.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to, name: name || to }],
    });
    
    console.log('Brevo Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Brevo Email error:', error);
    throw error;
  }
}
