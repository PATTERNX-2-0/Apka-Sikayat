import { Request, Response } from 'express';
import { isFirebaseAdminInitialized, adminDb } from '../config/firebaseAdmin';
import { sendWhatsAppText, downloadWhatsAppMedia } from '../services/whatsappService';
import { validateGrievance } from '../services/grievanceValidator';
import { generateTrackingToken, getAppUrl, getBackendUrl, generateNextComplaintId } from '../services/urlHelper';
import { sendTwilioSMS } from '../services/twilioService';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const VERIFY_TOKEN = 'apka_sikayat_whatsapp_token';

// Local fallbacks if Firestore isn't available
const localSessions = new Map<string, any>();
const localUsers = new Map<string, any>();

/**
 * Webhook Verification
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
 * AI Text Validation using Gemini 2.5 Flash
 */
async function validateGrievanceText(description: string, district: string): Promise<any> {
  const apiKey = process.env.WHATSAPP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const systemPrompt = `
You are the Advanced AI Grievance Intelligence & Validation Engine for a Chief Minister's Public Grievance Portal.
Your task is to analyze the text context and determine if it represents a genuine public grievance.

### Decision Rules:
Reject ONLY when clearly unrelated to public interest (e.g., personal complaints, spam, greetings, unrelated chit-chat).

### Output JSON Format:
You must respond with a JSON object containing precisely the following keys:
{
  "is_grievance": boolean,
  "grievance_category": string,
  "sub_category": string,
  "department": string,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "IMMEDIATE",
  "confidence": number,
  "spam": boolean,
  "accepted": boolean,
  "reason": string,
  "recommended_action": string
}
Output raw JSON only.
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [
          { text: `${systemPrompt}\n\nUser Grievance Text:\nDescription: ${description}\nDistrict: ${district}` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Gemini text validation failed: ${response.status}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('Empty response from Gemini API');
  }

  return JSON.parse(textResponse.trim());
}

/**
 * Audio voice note transcription
 */
async function transcribeVoiceNote(base64Audio: string, mimeType: string): Promise<string> {
  const apiKey = process.env.WHATSAPP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN;
  if (!apiKey) return 'Transcription API key not set.';

  const rawBase64 = base64Audio.includes('base64,') ? base64Audio.split('base64,')[1] : base64Audio;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: "Transcribe the following audio message exactly as spoken. Output ONLY the transcription, nothing else." },
          { inlineData: { mimeType, data: rawBase64 } }
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
    if (!response.ok) return 'Voice transcription failed.';
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Audio message is empty.';
  } catch (err) {
    console.error('[WhatsApp Webhook] Transcription error:', err);
    return 'Voice transcription failed.';
  }
}

/**
 * Extract clean person name using Gemini entity extraction
 */
async function extractCleanName(text: string): Promise<string | null> {
  const apiKey = process.env.WHATSAPP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN;
  if (!apiKey) return null;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const systemPrompt = `You are a precise entity extraction engine. Your task is to extract ONLY the clean full name of a person from the user input.
Remove all conversational prefixes (like "My name is", "I am", "Amer nam", "Amer name", "Mera naam", "I'm", "myself", "This is", "bolchhi").
Examples:
Input: "My name is Ramesh Mallik" -> Output: "Ramesh Mallik"
Input: "Amer nam Ramesh Mallik" -> Output: "Ramesh Mallik"
Input: "I am Ramesh Mallik" -> Output: "Ramesh Mallik"
Input: "Amer name ratul saha" -> Output: "Ratul Saha"
Input: "Hi my name is Amit" -> Output: "Amit"

If no name is present in the input, return "null". Output ONLY the clean name or "null" - do not include any other words or punctuation.`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: `${systemPrompt}\n\nInput: "${text}"` }]
      }
    ],
    generationConfig: {
      temperature: 0.0
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) return null;
    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (result && result.toLowerCase() !== 'null') {
      return result;
    }
    return null;
  } catch (err) {
    console.error('Error in extractCleanName:', err);
    return null;
  }
}

/**
 * Analyze uploaded media (image, video, document, etc.) using Gemini
 */
async function analyzeUploadedMedia(base64Data: string, mimeType: string): Promise<string> {
  const apiKey = process.env.WHATSAPP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN;
  if (!apiKey) return 'No API key configured for media analysis.';

  const rawBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: "Analyze the uploaded media (image, video, document) and describe the public grievance or issue shown or described in it. Be specific but keep it to one or two short sentences." },
          { inlineData: { mimeType, data: rawBase64 } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) return 'Media analysis failed.';
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No description could be generated from the evidence.';
  } catch (err) {
    console.error('[WhatsApp Webhook] Media analysis error:', err);
    return 'Error analyzing media evidence.';
  }
}

/**
 * incoming webhook handler
 */
async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
  const GEMINI_API_KEY = process.env.WHATSAPP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const requestBody = {
      contents: [
        {
          parts: [{ text: `${systemPrompt}\n\nUser Query: ${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini response failed: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Unable to generate response.';
  } catch (err: any) {
    console.error('[Gemini API Helper] Error calling Gemini Flash:', err.message);
    return 'Systems are currently busy. Please try asking again in a moment.';
  }
}

export async function handleWebhookEvent(req: Request, res: Response) {
  const body = req.body;
  if (body.object !== 'whatsapp_business_account') {
    return res.sendStatus(404);
  }

  res.status(200).send('EVENT_RECEIVED');

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) return;

  const from = message.from;
  const textBody = message.text?.body?.trim() || '';

  // Get active session strictly isolated by phoneNumber
  let session: any = null;
  try {
    const sessionDocRef = doc(db, 'whatsapp_sessions', from);
    const sessionDocSnap = await getDoc(sessionDocRef);
    if (sessionDocSnap.exists()) {
      session = sessionDocSnap.data();
    } else {
      session = localSessions.get(from);
    }
  } catch (err: any) {
    console.warn('[WhatsApp Webhook] Firestore session fetch failed:', err.message);
    session = localSessions.get(from);
  }

  // Log conversation step
  try {
    await addDoc(collection(db, 'whatsapp_conversations'), {
      phone: from,
      direction: 'inbound',
      messageType: message.type,
      text: textBody,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.warn('[WhatsApp Webhook] Firestore inbound convo log failed:', err.message);
  }

  try {
    const queryLower = textBody.toLowerCase();
    const isThankYou = queryLower.includes('thank') || queryLower.includes('thx') || queryLower === 'thanks';

    if (isThankYou) {
      await sendReply(from, "🇮🇳 You're welcome! Glad to assist you. Apka Shikayat is always here to support transparent governance. Have a wonderful day ahead!");
      await deleteSession(from);
      return;
    }

    const isGreeting = ['hi', 'hello', 'complaint', 'help', 'hey', 'start'].includes(queryLower);

    // Initialize or reset session
    if (!session || isGreeting) {
      // Check if user is already registered under this phone number to load their profile (Memory)
      let existingUser: any = null;
      try {
        const userDocRef = doc(db, 'users', `wa_${from}`);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          existingUser = userDocSnap.data();
        }
      } catch (err: any) {
        console.warn('[WhatsApp Webhook] Firestore fetch user failed:', err.message);
      }

      if (existingUser && existingUser.fullName) {
        session = {
          state: 'COLLECTING_INFO',
          phone: from,
          fullName: existingUser.fullName,
          email: existingUser.email || '',
          profileConfirmed: true,
          conversationLog: []
        };
        await saveSession(from, session);
        await sendReply(
          from,
          `🇮🇳 Welcome back to Apka Shikayat, *${existingUser.fullName}*!\n\nYour voice has the power to create change.\nReport issues, track resolutions, and help build a better tomorrow with transparent governance.\n\nI can help you register & track public grievances.\n\nPlease describe the issue or grievance you want to report today. (You can also send voice notes or upload photo/video evidence)`
        );
      } else {
        session = {
          state: 'COLLECTING_INFO',
          phone: from,
          conversationLog: []
        };
        await saveSession(from, session);
        await sendReply(
          from,
          "🇮🇳 Welcome to Apka Shikayat\n\nYour voice has the power to create change.\nReport issues, track resolutions, and help build a better tomorrow with transparent governance.\n\nI can help you register & track public grievances.\n\nLet's begin.\nWhat is your full name ?"
        );
      }
      return;
    }

    // Process Voice Notes, Media, and Location
    let userText = textBody;

    if (message.type === 'audio' || message.type === 'voice') {
      const audioId = message.audio?.id || message.voice?.id;
      await sendReply(from, "🎙️ Processing voice note transcription...");
      const media = await downloadWhatsAppMedia(audioId);
      if (media) {
        userText = await transcribeVoiceNote(media.dataUrl, media.mimeType);
        await sendReply(from, `Transcribed: "${userText}"`);
      } else {
        await sendReply(from, "Failed to transcribe audio. Please enter your message as text:");
        return;
      }
    } else if (message.type === 'image' || message.type === 'video' || message.type === 'document') {
      const mediaId = message.image?.id || message.video?.id || message.document?.id;
      await sendReply(from, "📷 Analyzing uploaded evidence...");
      const media = await downloadWhatsAppMedia(mediaId);
      if (media) {
        session.mediaDataUrl = media.dataUrl;
        const analysis = await analyzeUploadedMedia(media.dataUrl, media.mimeType);
        userText = `[Uploaded evidence attachment: ${analysis}]`;
        await sendReply(from, `Evidence analyzed: "${analysis}"`);
      }
    } else if (message.type === 'location') {
      session.location = {
        lat: message.location.latitude,
        lng: message.location.longitude,
        address: message.location.name || 'WhatsApp Shared Location'
      };
      userText = `[Shared Location Address: ${session.location.address}]`;
    }

    // Pre-extract clean full name if it's not yet collected (Issue 1)
    if (!session.fullName && userText) {
      const cleanedName = await extractCleanName(userText);
      if (cleanedName) {
        session.fullName = cleanedName;
        console.log(`[Name Extraction] Extracted and stored clean name: ${cleanedName}`);
      }
    }

    // Append to conversation log (conversational memory)
    session.conversationLog = session.conversationLog || [];
    session.conversationLog.push({ sender: 'user', text: userText });

    // Handle PROFILE CONFIRMATION state
    if (session.state === 'CONFIRMING_PROFILE') {
      const ans = queryLower.trim();
      if (ans === 'yes' || ans === 'y') {
        session.profileConfirmed = true;
        session.state = 'COLLECTING_INFO';
        await saveSession(from, session);

        // Profile is saved ONLY after confirmation
        const userProfile = {
          uid: `wa_${from}`,
          fullName: session.fullName,
          email: session.email,
          phone: `+${from}`,
          district: session.district || 'South West Delhi',
          role: 'Citizen',
          registrationSource: 'WhatsApp',
          joinedDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        };
        try {
          await setDoc(doc(db, 'users', `wa_${from}`), userProfile);
        } catch (err: any) {
          console.warn('[WhatsApp Webhook] Profile save failed:', err.message);
        }

        const nextPrompt = `Thank you for confirming your profile, *${session.fullName}*.\n\nPlease describe the issue or grievance you want to report today. (You can also send voice notes or upload photo/video evidence)`;
        session.conversationLog.push({ sender: 'assistant', text: nextPrompt });
        await saveSession(from, session);
        await sendReply(from, nextPrompt);
      } else if (ans === 'edit' || ans === 'no' || ans === 'n') {
        session.fullName = undefined;
        session.email = undefined;
        session.state = 'COLLECTING_INFO';
        session.profileConfirmed = false;
        await saveSession(from, session);
        await sendReply(from, "Let's correct your details. What is your full name?");
      } else {
        await sendReply(from, "Please reply YES to confirm or EDIT to change your details.");
      }
      return;
    }

    // Handle COMPLAINT REVIEW state
    if (session.state === 'CONFIRMING_COMPLAINT') {
      const ans = queryLower.trim();
      if (ans === 'yes' || ans === 'y') {
        const userProfile = {
          uid: `wa_${from}`,
          fullName: session.fullName,
          email: session.email,
          phone: `+${from}`,
          district: session.district || 'South West Delhi',
          role: 'Citizen',
          registrationSource: 'WhatsApp',
          joinedDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        };
        session.citizenUid = userProfile.uid;
        session.verifiedPhone = userProfile.phone;
        await createComplaintFromSession(from, session);
      } else if (ans === 'edit' || ans === 'no' || ans === 'n') {
        session.state = 'COLLECTING_INFO';
        session.description = undefined; // reset description to collect again
        await saveSession(from, session);
        await sendReply(from, "No problem. Let's update the complaint details. Please describe the grievance again in detail:");
      } else {
        await sendReply(from, "Please reply YES to submit the complaint or EDIT to modify it.");
      }
      return;
    }

    // Handle COLLECTING_INFO (Conversational Dialog Loop)
    if (session.state === 'COLLECTING_INFO') {
      const systemPrompt = `
You are the AI Grievance Assistant for NCT Delhi.
The user is conversing with you on WhatsApp to register a public grievance (e.g. road damage, waterlogging, streetlights, harassment, theft).
Act like a polite, empathetic, and professional citizen support officer. Avoid robotic or template-style replies.

### Rules:
1. Extract the following entities from the conversation history (specifically focusing on user inputs):
   - "fullName": The citizen's full name. Extract ONLY the actual name itself (e.g., "Ramesh Mallik" from "My name is Ramesh Mallik", "Amer nam Ramesh Mallik", or "I am Ramesh Mallik"). Never store greetings or conversational sentences or prefixes. If the name is not yet provided, set to null.
   - "email": The citizen's email address. If not yet provided, set to null.
   - "description": The details of the complaint. Deduce this from their messages or media description. If not yet provided, set to null.
   - "category": The category ("Water Supply", "Road Maintenance", "Electricity", "Sanitation", "Safety", "Other"). If not yet provided, set to null.
   - "district": The Delhi district (must be one of: "South West Delhi", "New Delhi", "Central Delhi", "East Delhi", "Shahdara", "North West Delhi"). If not yet provided, set to null.
2. Ask follow-up questions naturally if information is missing (fullName, email, description, district). Do not ask for all missing details in a single query. Focus on one or two details first.
3. If the user provides details out of order (e.g. describes their issue first, then gives name), handle it gracefully. Do not force a rigid form.
4. Output your response ONLY as a JSON object matching this schema:
{
  "extracted": {
    "fullName": "extracted name or null",
    "email": "extracted email or null",
    "description": "extracted description or null",
    "category": "extracted category or null",
    "district": "extracted district or null"
  },
  "reply": "your next conversational response to the user"
}
`;

      const currentContext = `
Conversation History:
${session.conversationLog.map((l: any) => `${l.sender === 'user' ? 'Citizen' : 'Officer'}: ${l.text}`).join('\n')}

Previously Extracted Details:
Name: ${session.fullName || 'null'}
Email: ${session.email || 'null'}
Description: ${session.description || 'null'}
Category: ${session.category || 'null'}
District: ${session.district || 'null'}
`;

      const geminiReplyRaw = await callGemini(systemPrompt, currentContext);
      let geminiData: any = {};
      try {
        const jsonMatch = geminiReplyRaw.match(/\{[\s\S]*\}/);
        geminiData = JSON.parse(jsonMatch ? jsonMatch[0] : geminiReplyRaw);
      } catch (err) {
        console.error("Failed to parse Gemini dialog JSON:", geminiReplyRaw);
        geminiData = { reply: "I understand. Could you please provide your details to proceed?" };
      }

      // Merge newly extracted values
      if (geminiData.extracted) {
        const ext = geminiData.extracted;
        if (ext.fullName && ext.fullName !== 'null') session.fullName = ext.fullName;
        if (ext.email && ext.email !== 'null') session.email = ext.email;
        if (ext.description && ext.description !== 'null') session.description = ext.description;
        if (ext.category && ext.category !== 'null') session.category = ext.category;
        if (ext.district && ext.district !== 'null') session.district = ext.district;
      }

      // Transition to PROFILE CONFIRMATION if name and email are gathered
      if (session.fullName && session.email && !session.profileConfirmed) {
        session.state = 'CONFIRMING_PROFILE';
        await saveSession(from, session);
        await sendReply(
          from,
          `Name:\n${session.fullName}\n\nEmail:\n${session.email}\n\nPhone:\n+${from}\n\nIs this correct?\n\nReply YES or EDIT.`
        );
        return;
      }

      // Transition to COMPLAINT REVIEW if profile is confirmed and complaint info is complete
      if (session.profileConfirmed && session.description && session.district) {
        session.state = 'CONFIRMING_COMPLAINT';
        await saveSession(from, session);

        const summaryMsg = `📋 *Grievance Submission Summary*:\n\n*Name*: ${session.fullName}\n*Phone*: +${from}\n*Description*: ${session.description}\n*Category*: ${session.category || 'Other'}\n*District*: ${session.district}\n\nWould you like to submit this complaint?\n\nYES / EDIT`;
        await sendReply(from, summaryMsg);
        return;
      }

      // Standard conversational reply
      session.conversationLog.push({ sender: 'assistant', text: geminiData.reply });
      await saveSession(from, session);
      await sendReply(from, geminiData.reply);
      return;
    }
  } catch (error: any) {
    console.error('[WhatsApp Controller] Execution error:', error.message);
    await sendReply(from, "An error occurred while processing your request. Please try again.");
  }
}

/**
 * Step 9 & 10: AI Validation & Complaint Creation
 */
async function createComplaintFromSession(from: string, session: any) {
  await sendReply(from, "⏳ Finalizing your grievance registration...");

  let aiResult: any = null;
  const hasMedia = !!session.mediaDataUrl;

  try {
    if (hasMedia) {
      aiResult = await validateGrievance(
        session.mediaDataUrl,
        "WhatsApp Grievance",
        session.description,
        "General",
        session.district
      );
    } else {
      aiResult = await validateGrievanceText(session.description, session.district);
    }
  } catch (err: any) {
    console.warn('[WhatsApp Webhook] AI analysis failed, applying defaults:', err.message);
    aiResult = {
      is_grievance: true,
      grievance_category: 'Civic Infrastructure',
      severity: 'MEDIUM',
      department: 'PWD',
      accepted: true
    };
  }

  const complaintId = await generateNextComplaintId();

  const trackingToken = generateTrackingToken();
  const shortToken = trackingToken.slice(0, 10);
  const appUrl = getAppUrl();
  const trackingLink = `${appUrl}/track/${complaintId}?token=${shortToken}`;

  const complaintData = {
    id: complaintId,
    complaintId: complaintId,
    uid: session.citizenUid,
    citizenName: session.fullName || "Anonymous Citizen",
    phoneNumber: session.verifiedPhone || "",
    email: session.email || "",
    title: session.description.slice(0, 60),
    description: session.description,
    category: aiResult?.grievance_category || 'Civic Infrastructure',
    priority: aiResult?.severity || 'MEDIUM',
    district: session.district,
    location: session.location,
    isAnonymous: false,
    status: "Submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    assignedOfficer: "Pending Assignment",
    department: aiResult?.department || "PWD",
    resolutionNotes: "",
    trackingUrl: trackingLink,
    currentStep: 1,
    aiValidation: aiResult,
    trackingToken,
    trackingLink
  };

  // Save to database
  try {
    const complaintDocRef = doc(db, 'complaints', complaintId);
    await setDoc(complaintDocRef, complaintData);

    // Step 9: Store ai_analysis
    await addDoc(collection(db, 'ai_analysis'), {
      complaintId,
      result: aiResult,
      timestamp: new Date().toISOString()
    });

    // Store complaint_events
    await addDoc(collection(db, 'complaint_events'), {
      complaintId,
      status: 'Submitted',
      message: 'Grievance submitted via WhatsApp.',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.warn('[WhatsApp Webhook] Firestore complaints save failed:', err.message);
  }

  // Delete session
  await deleteSession(from);

  // Step 11: Twilio SMS Confirmation
  const smsBody = `Dear Citizen, Your grievance has been successfully registered. Complaint ID: ${complaintId}. Track Your Complaint: ${trackingLink} - CM Grievance Portal`;
  try {
    await sendTwilioSMS(session.verifiedPhone, smsBody);
    try {
      await addDoc(collection(db, 'sms_logs'), {
        phone: session.verifiedPhone,
        body: smsBody,
        timestamp: new Date().toISOString()
      });
    } catch (dbErr: any) {
      console.warn('[WhatsApp Webhook] Firestore sms log save failed:', dbErr.message);
    }
  } catch (smsErr) {
    console.error('[WhatsApp Webhook] Twilio SMS dispatch failed:', smsErr);
  }

  // Step 12: WhatsApp Confirmation message (using custom template)
  const waReply = `🇮🇳 *Grievance Registered Successfully*

Hello ${complaintData.citizenName},

Your complaint has been successfully submitted to the CM Grievance Portal.

*Complaint ID*:
${complaintId}

*Current Status*:
Submitted

*Tracking Link*:
${trackingLink}

*Expected Resolution Timeline*:
7 Working Days

Thank you for reporting this issue. We will keep you updated on the progress.

Chief Minister Governance Platform`;
  await sendReply(from, waReply);

  // Step 10: Trigger dashboard push notifications
  try {
    const backendUrl = getBackendUrl();
    await fetch(`${backendUrl}/api/complaints/${complaintId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Submitted',
        notes: 'Grievance submitted via WhatsApp Gateway.',
        updatedBy: 'WhatsApp Agent',
        phoneNumber: session.verifiedPhone,
        citizenId: session.citizenUid,
        trackingToken,
        trackingLink
      })
    });
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Failed to trigger live dashboard push:', err.message);
  }
}

async function sendReply(to: string, text: string) {
  await sendWhatsAppText(to, text);
  try {
    await addDoc(collection(db, 'whatsapp_conversations'), {
      phone: to,
      direction: 'outbound',
      text: text,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.warn('[WhatsApp Webhook] Firestore outbound convo log failed:', err.message);
  }
}

async function saveSession(phone: string, session: any) {
  try {
    const sessionDocRef = doc(db, 'whatsapp_sessions', phone);
    await setDoc(sessionDocRef, session);
  } catch (err: any) {
    console.warn('[WhatsApp Webhook] Firestore save session failed:', err.message);
    localSessions.set(phone, session);
  }
}

async function deleteSession(phone: string) {
  try {
    const sessionDocRef = doc(db, 'whatsapp_sessions', phone);
    await deleteDoc(sessionDocRef);
  } catch (err: any) {
    console.warn('[WhatsApp Webhook] Firestore delete session failed:', err.message);
    localSessions.delete(phone);
  }
}
