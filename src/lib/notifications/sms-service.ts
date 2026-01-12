/**
 * SMS Service
 * Integration with Africa's Talking API for SMS delivery
 */

const AFRICAS_TALKING_API_KEY = process.env.AFRICAS_TALKING_API_KEY || '';
const AFRICAS_TALKING_USERNAME = process.env.AFRICAS_TALKING_USERNAME || '';
const AFRICAS_TALKING_SENDER_ID = process.env.AFRICAS_TALKING_SENDER_ID || 'EMERGENCY';

/**
 * Format phone number to +233 format (Ghana)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('233')) {
    // Already in international format
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    // Local format (e.g., 0244123456)
    return `+233${cleaned.substring(1)}`;
  } else if (cleaned.length === 9) {
    // Format without leading 0 (e.g., 244123456)
    return `+233${cleaned}`;
  } else if (cleaned.length === 10) {
    // Format with leading 0 (e.g., 0244123456)
    return `+233${cleaned.substring(1)}`;
  }

  // If already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  // Default: assume it's a local number
  return `+233${cleaned}`;
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  
  // Ghana phone numbers should be +233 followed by 9 digits
  const ghanaRegex = /^\+233[0-9]{9}$/;
  
  return ghanaRegex.test(formatted);
}

/**
 * Send SMS via Africa's Talking API
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  if (!AFRICAS_TALKING_API_KEY || !AFRICAS_TALKING_USERNAME) {
    console.warn('Africa\'s Talking credentials not configured. SMS not sent.');
    return;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);

  if (!validatePhoneNumber(formattedPhone)) {
    throw new Error(`Invalid phone number: ${phoneNumber}`);
  }

  // Ensure message is not too long (SMS limit is 160 characters for single SMS)
  const maxLength = 160;
  const truncatedMessage = message.length > maxLength 
    ? `${message.substring(0, maxLength - 3)}...`
    : message;

  try {
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'ApiKey': AFRICAS_TALKING_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: AFRICAS_TALKING_USERNAME,
        to: formattedPhone,
        message: truncatedMessage,
        from: AFRICAS_TALKING_SENDER_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Africa's Talking API error: ${errorText}`);
    }

    const result: any = await response.json();
    
    if (result.SMSMessageData?.Recipients?.[0]?.status !== 'Success') {
      throw new Error(`SMS delivery failed: ${result.SMSMessageData?.Recipients?.[0]?.statusCode}`);
    }

    // Log success (result is used in the condition above)
    console.log(`SMS sent successfully to ${formattedPhone}`);
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

/**
 * Send bulk SMS
 */
export async function sendBulkSMS(phoneNumbers: string[], message: string): Promise<void> {
  if (!AFRICAS_TALKING_API_KEY || !AFRICAS_TALKING_USERNAME) {
    console.warn('Africa\'s Talking credentials not configured. SMS not sent.');
    return;
  }

  const formattedPhones = phoneNumbers
    .map(formatPhoneNumber)
    .filter(validatePhoneNumber);

  if (formattedPhones.length === 0) {
    throw new Error('No valid phone numbers provided');
  }

  // Ensure message is not too long
  const maxLength = 160;
  const truncatedMessage = message.length > maxLength 
    ? `${message.substring(0, maxLength - 3)}...`
    : message;

  try {
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'ApiKey': AFRICAS_TALKING_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: AFRICAS_TALKING_USERNAME,
        to: formattedPhones.join(','),
        message: truncatedMessage,
        from: AFRICAS_TALKING_SENDER_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Africa's Talking API error: ${errorText}`);
    }

    await response.json(); // Result not needed
    console.log(`Bulk SMS sent to ${formattedPhones.length} recipients`);
    
    return;
  } catch (error) {
    console.error('Failed to send bulk SMS:', error);
    throw error;
  }
}

/**
 * SMS Templates
 */
export const smsTemplates = {
  criticalIncident: (location: string, incidentId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://emergency.ghana.gov.gh';
    return `[EMERGENCY] Critical incident reported at ${location}. View: ${baseUrl}/dashboard/incidents/${incidentId}`;
  },

  dispatchAssignment: (incidentId: string, location: string) => {
    return `You've been assigned to incident #${incidentId.slice(0, 8)} at ${location}. Accept in app.`;
  },

  statusUpdate: (incidentId: string, status: string) => {
    return `Incident #${incidentId.slice(0, 8)} status changed to ${status}`;
  },

  messageReceived: (incidentId: string, senderName: string) => {
    return `New message on incident #${incidentId.slice(0, 8)} from ${senderName}`;
  },
};

