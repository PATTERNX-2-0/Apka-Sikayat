import { Request, Response } from 'express';
import { isFirebaseAdminInitialized, adminDb } from '../config/firebaseAdmin';
import { sendWhatsAppText, downloadWhatsAppMedia } from '../services/whatsappService';
import { validateGrievance } from '../services/grievanceValidator';
import { generateTrackingToken, getAppUrl, getBackendUrl } from '../services/urlHelper';

const VERIFY_TOKEN = 'apka_sikayat_whatsapp_token';

// In-memory fallbacks if Firestore isn't available
const localSessions = new Map<string, any>();
const localUsers = new Map<string, any>();

/**
 * Webhook Verification for Meta Messenger Platform
 */
export function verifyWebhook(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook] Verification successful!');
      return res.status(200).send(challenge);
    } else {
      console.error('[WhatsApp Webhook] Verification token mismatch.');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
}

/**
 * Helper to call Gemini for audio transcription
 */
async function transcribeVoiceNote(base64Audio: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  // Extract raw base64 data if it has prefix
  const match = base64Audio.match(/^data:(.+);base64,(.+)$/);
  const rawBase64 = match ? match[2] : base64Audio;
  const rawMime = match ? match[1] : mimeType;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [
          { text: "You are an AI assistant. Transcribe the following audio message exactly as spoken. Output ONLY the transcription text, nothing else." },
          { inlineData: { mimeType: rawMime, data: rawBase64 } }
        ]
      }
    ]
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) return 'Speech transcription failed.';
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  } catch (err) {
    console.error('[WhatsApp Webhook] Transcription error:', err);
    return 'Voice message transcription failed.';
  }
}

/**
 * Webhook Post Endpoint: Processes incoming messages, media, locations, and state sessions.
 */
export async function handleWebhookEvent(req: Request, res: Response) {
  const body = req.body;

  if (body.object !== 'whatsapp_business_account') {
    return res.sendStatus(404);
  }

  // Respond to Meta instantly to avoid retries
  res.status(200).send('EVENT_RECEIVED');

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) return;

  const from = message.from; // Sender's phone number
  const messageId = message.id;

  console.log(`[WhatsApp Webhook] Incoming message from ${from}. ID: ${messageId}. Type: ${message.type}`);

  try {
    // 1. Resolve User profile
    let userProfile: any = null;
    if (isFirebaseAdminInitialized && adminDb) {
      const usersSnap = await adminDb.collection('users').where('phone', '==', `+${from}`).limit(1).get();
      if (!usersSnap.empty) {
        userProfile = usersSnap.docs[0].data();
      }
    } else {
      userProfile = localUsers.get(from);
    }

    // 2. Fetch Session State
    let session: any = null;
    if (isFirebaseAdminInitialized && adminDb) {
      const doc = await adminDb.collection('whatsapp_sessions').doc(from).get();
      if (doc.exists) session = doc.data();
    } else {
      session = localSessions.get(from);
    }

    if (!session) {
      session = { state: 'START', phone: from };
    }

    // 3. User Registration Wizard
    if (!userProfile) {
      if (session.state === 'START') {
        session.state = 'NEW_USER_NAME';
        await saveSession(from, session);
        await sendWhatsAppText(from, "Welcome to the Chief Minister's Public Grievance Portal.\n\nIt looks like you are not registered yet. Please reply with your **Full Name** to begin registration:");
        return;
      }

      if (session.state === 'NEW_USER_NAME') {
        const fullName = message.text?.body?.trim();
        if (!fullName) {
          await sendWhatsAppText(from, "Please reply with a valid Full Name string:");
          return;
        }
        session.fullName = fullName;
        session.state = 'NEW_USER_DISTRICT';
        await saveSession(from, session);
        await sendWhatsAppText(from, `Thank you, ${fullName}.\n\nPlease enter your **District** (e.g. South West Delhi, New Delhi, West Delhi):`);
        return;
      }

      if (session.state === 'NEW_USER_DISTRICT') {
        const district = message.text?.body?.trim();
        if (!district) {
          await sendWhatsAppText(from, "Please reply with a valid District name:");
          return;
        }
        session.district = district;
        session.state = 'NEW_USER_ADDRESS';
        await saveSession(from, session);
        await sendWhatsAppText(from, `Got it. Lastly, please reply with your **Full Address**:`);
        return;
      }

      if (session.state === 'NEW_USER_ADDRESS') {
        const address = message.text?.body?.trim();
        if (!address) {
          await sendWhatsAppText(from, "Please reply with a valid Address string:");
          return;
        }
        
        // Register user in DB
        const newUserUid = `wa_${from}`;
        userProfile = {
          uid: newUserUid,
          fullName: session.fullName,
          email: `${from}@whatsapp.com`,
          phone: `+${from}`,
          district: session.district,
          address: address,
          role: 'Citizen',
          joinedDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        };

        if (isFirebaseAdminInitialized && adminDb) {
          await adminDb.collection('users').doc(newUserUid).set(userProfile);
        } else {
          localUsers.set(from, userProfile);
        }

        session.state = 'COLLECT_GRIEVANCE_DESC';
        await saveSession(from, session);
        await sendWhatsAppText(from, `Registration successful! Welcome, *${session.fullName}*.\n\nPlease describe the public grievance or issue you want to report:`);
        return;
      }
    }

    // 4. Grievance Filing Wizard
    if (session.state === 'START' || session.state === 'NEW_USER_ADDRESS') {
      session.state = 'COLLECT_GRIEVANCE_DESC';
      await saveSession(from, session);
      await sendWhatsAppText(from, `Hello, *${userProfile.fullName}*.\n\nPlease describe the public grievance or issue you want to report (e.g., severe waterlogging, broken streetlights):`);
      return;
    }

    if (session.state === 'COLLECT_GRIEVANCE_DESC') {
      let description = '';

      if (message.type === 'audio' || message.type === 'voice') {
        const audioId = message.audio?.id || message.voice?.id;
        await sendWhatsAppText(from, "Transcribing voice message...");
        const media = await downloadWhatsAppMedia(audioId);
        if (media) {
          description = await transcribeVoiceNote(media.dataUrl, media.mimeType);
          await sendWhatsAppText(from, `Transcribed text: "${description}"`);
        } else {
          await sendWhatsAppText(from, "Failed to download voice note. Please describe your issue in text format:");
          return;
        }
      } else {
        description = message.text?.body?.trim();
      }

      if (!description) {
        await sendWhatsAppText(from, "Please provide a description text or voice message:");
        return;
      }

      session.description = description;
      session.state = 'COLLECT_GRIEVANCE_LOCATION';
      await saveSession(from, session);
      await sendWhatsAppText(from, "Please share the **Location** of the issue (use WhatsApp Location sharing feature, or reply with the address/details as text):");
      return;
    }

    if (session.state === 'COLLECT_GRIEVANCE_LOCATION') {
      let locationObj: any = null;

      if (message.type === 'location') {
        locationObj = {
          lat: message.location.latitude,
          lng: message.location.longitude,
          address: message.location.name || `${userProfile.district}, Delhi`
        };
      } else {
        const textLoc = message.text?.body?.trim();
        if (!textLoc) {
          await sendWhatsAppText(from, "Please send a location pin or text address:");
          return;
        }
        locationObj = {
          lat: 28.6139, // Default Delhi Center
          lng: 77.2090,
          address: textLoc
        };
      }

      session.location = locationObj;
      session.state = 'COLLECT_GRIEVANCE_MEDIA';
      await saveSession(from, session);
      await sendWhatsAppText(from, "Great! Now please send a **Photo or Video** of the issue to validate the grievance (or reply 'skip' to register without media):");
      return;
    }

    if (session.state === 'COLLECT_GRIEVANCE_MEDIA') {
      let mediaDataUrl: string | null = null;
      let hasImage = false;

      const bodyText = message.text?.body?.trim()?.toLowerCase();
      
      if (bodyText === 'skip') {
        // Register without media validation
        console.log('[WhatsApp Webhook] User skipped media attachment');
      } else if (message.type === 'image') {
        const imageId = message.image?.id;
        await sendWhatsAppText(from, "Analyzing media evidence with AI...");
        const media = await downloadWhatsAppMedia(imageId);
        if (media) {
          mediaDataUrl = media.dataUrl;
          hasImage = true;
        }
      } else {
        await sendWhatsAppText(from, "Please send an image attachment or reply 'skip':");
        return;
      }

      // Perform AI validation if image exists
      let aiResult: any = null;
      if (hasImage && mediaDataUrl) {
        try {
          aiResult = await validateGrievance(
            mediaDataUrl,
            "WhatsApp Grievance Submission",
            session.description,
            "General",
            userProfile.district
          );

          if (!aiResult.accepted || !aiResult.is_grievance) {
            await sendWhatsAppText(from, `❌ AI Validation Rejected: ${aiResult.reason || "Invalid evidence"}.\n\nPlease start again by describing your issue:`);
            session.state = 'COLLECT_GRIEVANCE_DESC';
            await saveSession(from, session);
            return;
          }
        } catch (aiErr: any) {
          console.error('[WhatsApp Webhook] AI validation service crashed:', aiErr.message);
        }
      }

      // Generate IDs and paths
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const complaintId = `CMP-WA-${datePart}-${randPart}`;
      
      const trackingToken = generateTrackingToken();
      const appUrl = getAppUrl();
      const trackingLink = `${appUrl}/track/${trackingToken}`;

      const complaintData = {
        id: complaintId,
        uid: userProfile.uid,
        title: session.description.slice(0, 60),
        description: session.description,
        category: aiResult?.grievance_category || 'Civic Infrastructure',
        priority: aiResult?.severity || 'MEDIUM',
        district: userProfile.district,
        location: session.location,
        isAnonymous: false,
        status: "Submitted",
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        assignedOfficer: "Pending Assignment",
        currentStep: 1,
        aiValidation: aiResult,
        trackingToken,
        trackingLink
      };

      if (isFirebaseAdminInitialized && adminDb) {
        await adminDb.collection('complaints').doc(complaintId).set(complaintData);
      }

      // Clear Session
      await deleteSession(from);

      // Send confirmation reply
      const confirmationMsg = `✅ *Complaint Registered Successfully!*\n\n*Complaint ID:* ${complaintId}\n*Category:* ${complaintData.category}\n*Severity:* ${complaintData.priority}\n\n*Track Here:* ${trackingLink}`;
      await sendWhatsAppText(from, confirmationMsg);

      // Trigger background status notifier (SMS, real-time broadcasts)
      try {
        const backendUrl = getBackendUrl();
        await fetch(`${backendUrl}/api/complaints/${complaintId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Submitted',
            notes: 'Dear Citizen, Your grievance has been registered via WhatsApp and is active.',
            updatedBy: 'WhatsApp System Gateway',
            phoneNumber: userProfile.phone,
            citizenId: userProfile.uid,
            trackingToken,
            trackingLink
          })
        });
      } catch (broadcastErr: any) {
        console.error('[WhatsApp Webhook] Failed to trigger live dashboard updates:', broadcastErr.message);
      }
    }
  } catch (error: any) {
    console.error(`[WhatsApp Webhook] Handler error:`, error.message);
    await sendWhatsAppText(from, "An unexpected error occurred while processing your request. Please try again later.");
  }
}

async function saveSession(phone: string, session: any) {
  if (isFirebaseAdminInitialized && adminDb) {
    await adminDb.collection('whatsapp_sessions').doc(phone).set(session);
  } else {
    localSessions.set(phone, session);
  }
}

async function deleteSession(phone: string) {
  if (isFirebaseAdminInitialized && adminDb) {
    await adminDb.collection('whatsapp_sessions').doc(phone).delete();
  } else {
    localSessions.delete(phone);
  }
}
