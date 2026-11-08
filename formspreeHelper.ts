import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONTACT_FORM_URL = process.env.FORMSPREE_CONTACT_URL;
const NEWSLETTER_FORM_URL = process.env.FORMSPREE_NEWSLETTER_URL;

export const sendContactForm = async (data: {
  name: string;
  organization?: string;
  email: string;
  subject: string;
  message: string;
}) => {
  if (!CONTACT_FORM_URL) {
    console.error('FORMSPREE_CONTACT_URL not configured');
    return { success: false, error: 'Server configuration error' };
  }

  try {
    const response = await fetch(CONTACT_FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        organization: data.organization || 'N/A',
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
    });

    if (!response.ok) {
      console.error('Formspree error:', response.statusText);
      return { success: false, error: 'Failed to submit form' };
    }

    console.log(`✅ Contact form submitted to Formspree from: ${data.name} <${data.email}>`);
    return { success: true };
  } catch (error) {
    console.error('Formspree submission error:', error);
    return { success: false, error };
  }
};

export const sendNewsletterForm = async (email: string) => {
  if (!NEWSLETTER_FORM_URL) {
    console.error('FORMSPREE_NEWSLETTER_URL not configured');
    return { success: false, error: 'Server configuration error' };
  }

  try {
    const response = await fetch(NEWSLETTER_FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.error('Formspree error:', response.statusText);
      return { success: false, error: 'Failed to subscribe' };
    }

    console.log(`✅ Newsletter subscription submitted to Formspree: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Formspree subscription error:', error);
    return { success: false, error };
  }
};
