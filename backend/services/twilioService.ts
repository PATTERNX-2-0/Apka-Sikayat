import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../frontend/.env') });

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const CALLBACK_URL = process.env.TWILIO_STATUS_CALLBACK_URL;

let twilioClient: twilio.Twilio | null = null;

try {
  if (ACCOUNT_SID && AUTH_TOKEN) {
    twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN);
    console.log('[Twilio Service] Twilio Client initialized successfully.');
  } else {
    console.warn('[Twilio Service] Warning: Missing Twilio credentials. SMS will run in simulator mode.');
  }
} catch (error: any) {
  console.error('[Twilio Service] Error initializing Twilio client:', error.message);
}

export interface TwilioSendResult {
  sid: string;
  status: 'queued' | 'sent' | 'failed';
  errorMessage?: string;
}

/**
 * Sends an SMS using the Twilio REST API.
 * Throws an error on API failure so BullMQ can trigger the retry policy.
 */
export async function sendTwilioSMS(to: string, body: string): Promise<TwilioSendResult> {
  console.log(`[Twilio Service] Sending SMS to ${to} (Body length: ${body.length})...`);

  if (!twilioClient) {
    // Simulator Mode
    console.log('[Twilio Service] [Simulator] Credentials missing. Logging SMS mock dispatch.');
    const mockSid = `SM${crypto.randomUUID().replace(/-/g, '')}`;
    return {
      sid: mockSid,
      status: 'queued'
    };
  }

  try {
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    const formattedFrom = PHONE_NUMBER.startsWith('+') ? PHONE_NUMBER : `+${PHONE_NUMBER}`;

    const response = await twilioClient.messages.create({
      body: body,
      from: formattedFrom,
      to: formattedTo,
      statusCallback: CALLBACK_URL
    });

    console.log(`[Twilio Service] Twilio API success. Message SID: ${response.sid}, Status: ${response.status}`);

    // Status can be queued, sending, sent, failed, etc.
    return {
      sid: response.sid,
      status: response.status === 'failed' ? 'failed' : 'queued',
      errorMessage: response.errorMessage || undefined
    };
  } catch (error: any) {
    console.error(`[Twilio Service] Twilio API call failed:`, error.message);
    throw new Error(`Twilio delivery failed: ${error.message}`);
  }
}
