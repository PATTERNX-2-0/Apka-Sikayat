"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhook = verifyWebhook;
exports.handleWebhookEvent = handleWebhookEvent;
const whatsappService_1 = require("../services/whatsappService");
const grievanceValidator_1 = require("../services/grievanceValidator");
const urlHelper_1 = require("../services/urlHelper");
const twilioService_1 = require("../services/twilioService");
const firebase_1 = require("../../firebase");
const firestore_1 = require("firebase/firestore");
const VERIFY_TOKEN = 'apka_sikayat_whatsapp_token';
// Local fallbacks if Firestore isn't available
const localSessions = new Map();
const localUsers = new Map();
/**
 * Webhook Verification
 */
function verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('[WhatsApp Webhook] Verification successful!');
            return res.status(200).send(challenge);
        }
        else {
            console.error('[WhatsApp Webhook] Verification token mismatch.');
            return res.sendStatus(403);
        }
    }
    return res.sendStatus(400);
}
/**
 * AI Text Validation using Gemini 2.5 Flash
 */
async function validateGrievanceText(description, district) {
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
async function transcribeVoiceNote(base64Audio, mimeType) {
    const apiKey = process.env.WHATSAPP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN;
    if (!apiKey)
        return 'Transcription API key not set.';
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
        if (!response.ok)
            return 'Voice transcription failed.';
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Audio message is empty.';
    }
    catch (err) {
        console.error('[WhatsApp Webhook] Transcription error:', err);
        return 'Voice transcription failed.';
    }
}
/**
 * incoming webhook handler
 */
async function handleWebhookEvent(req, res) {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') {
        return res.sendStatus(404);
    }
    res.status(200).send('EVENT_RECEIVED');
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    if (!message)
        return;
    const from = message.from;
    const textBody = message.text?.body?.trim() || '';
    // Get active session
    let session = null;
    try {
        const sessionDocRef = (0, firestore_1.doc)(firebase_1.db, 'whatsapp_sessions', from);
        const sessionDocSnap = await (0, firestore_1.getDoc)(sessionDocRef);
        if (sessionDocSnap.exists()) {
            session = sessionDocSnap.data();
        }
        else {
            session = localSessions.get(from);
        }
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] Firestore session fetch failed:', err.message);
        session = localSessions.get(from);
    }
    if (!session) {
        session = { state: 'START', phone: from };
    }
    // Log conversation step
    try {
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'whatsapp_conversations'), {
            phone: from,
            direction: 'inbound',
            messageType: message.type,
            text: textBody,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] Firestore inbound convo log failed:', err.message);
    }
    try {
        // START Greeting Check
        const isGreeting = ['hi', 'hello', 'complaint', 'help', 'hey'].includes(textBody.toLowerCase());
        if (isGreeting && session.state !== 'START') {
            session.state = 'START';
        }
        // Step 1: Greeting & Welcome
        if (session.state === 'START') {
            session.state = 'COLLECT_NAME';
            await saveSession(from, session);
            await sendReply(from, "Welcome to the CM Grievance Portal.\nI can help you register and track public grievances.\n\nLet's begin.\nWhat is your full name?");
            return;
        }
        // Step 2: Email Collection
        if (session.state === 'COLLECT_NAME') {
            if (!textBody) {
                await sendReply(from, "Please reply with your full name:");
                return;
            }
            session.fullName = textBody;
            session.state = 'COLLECT_EMAIL';
            await saveSession(from, session);
            await sendReply(from, `Thank you, ${textBody}.\n\nPlease enter your email address:`);
            return;
        }
        if (session.state === 'COLLECT_EMAIL') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!textBody || !emailRegex.test(textBody)) {
                await sendReply(from, "❌ Invalid email format. Please enter a valid email address (e.g. name@example.com):");
                return;
            }
            session.email = textBody;
            session.state = 'CONFIRM_PHONE';
            await saveSession(from, session);
            await sendReply(from, `We detected your WhatsApp number:\n*+${from}*\n\nWould you like to use this number for tracking updates?\nReply *YES* or *NO*:`);
            return;
        }
        // Step 3: Phone Collection
        if (session.state === 'CONFIRM_PHONE') {
            const ans = textBody.toLowerCase();
            if (ans === 'yes' || ans === 'y') {
                session.verifiedPhone = `+${from}`;
                await proceedToProfileCreation(from, session);
            }
            else if (ans === 'no' || ans === 'n') {
                session.state = 'COLLECT_ALT_PHONE';
                await saveSession(from, session);
                await sendReply(from, "Please reply with your alternative mobile number (including country code, e.g. +91XXXXXXXXXX):");
            }
            else {
                await sendReply(from, "Please reply with *YES* or *NO*:");
            }
            return;
        }
        if (session.state === 'COLLECT_ALT_PHONE') {
            if (!textBody || textBody.length < 8) {
                await sendReply(from, "Please enter a valid mobile number with country code:");
                return;
            }
            session.verifiedPhone = textBody;
            await proceedToProfileCreation(from, session);
            return;
        }
        // Step 5: Complaint Collection
        if (session.state === 'COLLECT_GRIEVANCE_DESC') {
            let description = '';
            if (message.type === 'audio' || message.type === 'voice') {
                const audioId = message.audio?.id || message.voice?.id;
                await sendReply(from, "🎙️ Processing voice note transcription...");
                const media = await (0, whatsappService_1.downloadWhatsAppMedia)(audioId);
                if (media) {
                    description = await transcribeVoiceNote(media.dataUrl, media.mimeType);
                    await sendReply(from, `Transcribed text: "${description}"`);
                }
                else {
                    await sendReply(from, "Failed to transcribe audio. Please enter your complaint description as text:");
                    return;
                }
            }
            else {
                description = textBody;
            }
            if (!description || description.length < 10) {
                await sendReply(from, "Please describe your complaint in detail (minimum 10 characters):");
                return;
            }
            session.description = description;
            session.state = 'MEDIA_PROMPT';
            await saveSession(from, session);
            await sendReply(from, "Would you like to upload a photo or video related to this complaint?\nReply *YES* or *NO*:");
            return;
        }
        // Step 6: Media upload check
        if (session.state === 'MEDIA_PROMPT') {
            const ans = textBody.toLowerCase();
            if (ans === 'yes' || ans === 'y') {
                session.state = 'COLLECT_MEDIA';
                await saveSession(from, session);
                await sendReply(from, "Please upload/send the photo or video now:");
            }
            else if (ans === 'no' || ans === 'n' || ans === 'skip') {
                session.mediaDataUrl = null;
                session.state = 'COLLECT_LOCATION';
                await saveSession(from, session);
                await sendReply(from, "Please share your Location (use WhatsApp's Location sharing feature, or reply with the address as text):");
            }
            else {
                await sendReply(from, "Please reply *YES* or *NO*:");
            }
            return;
        }
        if (session.state === 'COLLECT_MEDIA') {
            if (message.type === 'image') {
                const imageId = message.image?.id;
                await sendReply(from, "Analyzing media evidence with AI...");
                const media = await (0, whatsappService_1.downloadWhatsAppMedia)(imageId);
                if (media) {
                    session.mediaDataUrl = media.dataUrl;
                    session.state = 'COLLECT_LOCATION';
                    await saveSession(from, session);
                    await sendReply(from, "Evidence accepted! Please share your Location (use WhatsApp's Location sharing feature, or reply with the address as text):");
                }
                else {
                    await sendReply(from, "Failed to download media. Please upload the photo again, or reply *skip* to proceed without media:");
                }
            }
            else if (textBody.toLowerCase() === 'skip') {
                session.mediaDataUrl = null;
                session.state = 'COLLECT_LOCATION';
                await saveSession(from, session);
                await sendReply(from, "Proceeding without media. Please share your Location (use WhatsApp's Location sharing feature, or reply with the address as text):");
            }
            else {
                await sendReply(from, "Please send a photo attachment, or reply *skip*:");
            }
            return;
        }
        // Step 8: Location Collection & Complaint Creation
        if (session.state === 'COLLECT_LOCATION') {
            let locationObj = null;
            if (message.type === 'location') {
                locationObj = {
                    lat: message.location.latitude,
                    lng: message.location.longitude,
                    address: message.location.name || 'WhatsApp Shared Location'
                };
            }
            else {
                if (!textBody) {
                    await sendReply(from, "Please share a location pin, or reply with your address as text:");
                    return;
                }
                locationObj = {
                    lat: 28.6139,
                    lng: 77.2090,
                    address: textBody
                };
            }
            session.location = locationObj;
            await createComplaintFromSession(from, session);
        }
    }
    catch (error) {
        console.error('[WhatsApp Controller] Execution error:', error.message);
        await sendReply(from, "An error occurred while processing your request. Please try again.");
    }
}
/**
 * Step 4: Profile lookup and creation
 */
async function proceedToProfileCreation(from, session) {
    let userProfile = null;
    try {
        const usersQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_1.db, 'users'), (0, firestore_1.where)('phone', '==', session.verifiedPhone));
        const snap = await (0, firestore_1.getDocs)(usersQuery);
        if (!snap.empty) {
            userProfile = snap.docs[0].data();
        }
        else {
            userProfile = localUsers.get(from);
        }
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] Firestore user profile query failed:', err.message);
        userProfile = localUsers.get(from);
    }
    const defaultDistrict = 'South West Delhi';
    if (!userProfile) {
        const newUserUid = `wa_${from}`;
        userProfile = {
            uid: newUserUid,
            fullName: session.fullName,
            email: session.email,
            phone: session.verifiedPhone,
            district: defaultDistrict,
            address: 'WhatsApp Registered Address',
            role: 'Citizen',
            registrationSource: 'WhatsApp',
            joinedDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        };
        try {
            const userDocRef = (0, firestore_1.doc)(firebase_1.db, 'users', newUserUid);
            await (0, firestore_1.setDoc)(userDocRef, userProfile);
        }
        catch (err) {
            console.warn('[WhatsApp Webhook] Firestore user profile create failed:', err.message);
            localUsers.set(from, userProfile);
        }
        console.log(`[WhatsApp Webhook] Created new citizen profile for ${session.fullName}`);
    }
    session.district = userProfile.district;
    session.citizenUid = userProfile.uid;
    session.state = 'COLLECT_GRIEVANCE_DESC';
    await saveSession(from, session);
    await sendReply(from, `Profile registered!\n\nHello, *${userProfile.fullName}*. Please describe your complaint in detail. You may send text or voice notes:`);
}
/**
 * Step 9 & 10: AI Validation & Complaint Creation
 */
async function createComplaintFromSession(from, session) {
    await sendReply(from, "⏳ Finalizing your grievance registration...");
    let aiResult = null;
    const hasMedia = !!session.mediaDataUrl;
    try {
        if (hasMedia) {
            aiResult = await (0, grievanceValidator_1.validateGrievance)(session.mediaDataUrl, "WhatsApp Grievance", session.description, "General", session.district);
        }
        else {
            aiResult = await validateGrievanceText(session.description, session.district);
        }
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] AI analysis failed, applying defaults:', err.message);
        aiResult = {
            is_grievance: true,
            grievance_category: 'Civic Infrastructure',
            severity: 'MEDIUM',
            department: 'PWD',
            accepted: true
        };
    }
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CMP-WA-${datePart}-${randPart}`;
    const trackingToken = (0, urlHelper_1.generateTrackingToken)();
    const appUrl = (0, urlHelper_1.getAppUrl)();
    const trackingLink = `${appUrl}/track/${trackingToken}`;
    const complaintData = {
        id: complaintId,
        uid: session.citizenUid,
        title: session.description.slice(0, 60),
        description: session.description,
        category: aiResult?.grievance_category || 'Civic Infrastructure',
        priority: aiResult?.severity || 'MEDIUM',
        district: session.district,
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
    // Save to database
    try {
        const complaintDocRef = (0, firestore_1.doc)(firebase_1.db, 'complaints', complaintId);
        await (0, firestore_1.setDoc)(complaintDocRef, complaintData);
        // Step 9: Store ai_analysis
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'ai_analysis'), {
            complaintId,
            result: aiResult,
            timestamp: new Date().toISOString()
        });
        // Store complaint_events
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'complaint_events'), {
            complaintId,
            status: 'Submitted',
            message: 'Grievance submitted via WhatsApp.',
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] Firestore complaints save failed:', err.message);
    }
    // Delete session
    await deleteSession(from);
    // Step 11: Twilio SMS Confirmation
    const smsBody = `Dear Citizen, Your grievance has been successfully registered. Complaint ID: ${complaintId}. Track Your Complaint: ${trackingLink} - CM Grievance Portal`;
    try {
        await (0, twilioService_1.sendTwilioSMS)(session.verifiedPhone, smsBody);
        try {
            await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'sms_logs'), {
                phone: session.verifiedPhone,
                body: smsBody,
                timestamp: new Date().toISOString()
            });
        }
        catch (dbErr) {
            console.warn('[WhatsApp Webhook] Firestore sms log save failed:', dbErr.message);
        }
    }
    catch (smsErr) {
        console.error('[WhatsApp Webhook] Twilio SMS dispatch failed:', smsErr);
    }
    // Step 12: WhatsApp Confirmation message
    const waReply = `Your complaint has been successfully registered.\n\n*Complaint ID:* ${complaintId}\n*Category:* ${complaintData.category}\n*Assigned Department:* ${aiResult?.department || 'PWD'}\n\n*Track Here:* ${trackingLink}\n\nThank you for helping improve public services.`;
    await sendReply(from, waReply);
    // Step 10: Trigger dashboard push notifications
    try {
        const backendUrl = (0, urlHelper_1.getBackendUrl)();
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
    }
    catch (err) {
        console.error('[WhatsApp Webhook] Failed to trigger live dashboard push:', err.message);
    }
}
async function sendReply(to, text) {
    await (0, whatsappService_1.sendWhatsAppText)(to, text);
    try {
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'whatsapp_conversations'), {
            phone: to,
            direction: 'outbound',
            text: text,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] Firestore outbound convo log failed:', err.message);
    }
}
async function saveSession(phone, session) {
    try {
        const sessionDocRef = (0, firestore_1.doc)(firebase_1.db, 'whatsapp_sessions', phone);
        await (0, firestore_1.setDoc)(sessionDocRef, session);
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] Firestore save session failed:', err.message);
        localSessions.set(phone, session);
    }
}
async function deleteSession(phone) {
    try {
        const sessionDocRef = (0, firestore_1.doc)(firebase_1.db, 'whatsapp_sessions', phone);
        await (0, firestore_1.deleteDoc)(sessionDocRef);
    }
    catch (err) {
        console.warn('[WhatsApp Webhook] Firestore delete session failed:', err.message);
        localSessions.delete(phone);
    }
}
