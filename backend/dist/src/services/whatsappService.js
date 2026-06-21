"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppText = sendWhatsAppText;
exports.downloadWhatsAppMedia = downloadWhatsAppMedia;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../frontend/.env') });
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
/**
 * Sends a WhatsApp text message to the specified recipient phone number.
 */
async function sendWhatsAppText(to, text) {
    console.log(`[WhatsApp Service] Sending message to ${to}: "${text.slice(0, 60)}..."`);
    // Clean phone number (remove +, spaces, ensure country code)
    const cleanedPhone = to.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
    const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanedPhone,
        type: 'text',
        text: { body: text }
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errText = await response.text();
            console.error(`[WhatsApp Service] Meta API error sending text: ${response.status} - ${errText}`);
            return false;
        }
        const data = await response.json();
        console.log(`[WhatsApp Service] Message successfully sent to ${to}. Message ID:`, data.messages?.[0]?.id);
        return true;
    }
    catch (error) {
        console.error(`[WhatsApp Service] Connection error sending text:`, error.message);
        return false;
    }
}
/**
 * Downloads a media file from WhatsApp servers and returns it as a data URL.
 */
async function downloadWhatsAppMedia(mediaId) {
    console.log(`[WhatsApp Service] Fetching media metadata for ID: ${mediaId}`);
    try {
        // Step 1: Retrieve media URL
        const metaUrl = `https://graph.facebook.com/v18.0/${mediaId}`;
        const metaResponse = await fetch(metaUrl, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        if (!metaResponse.ok) {
            console.error(`[WhatsApp Service] Failed to retrieve media URL from Meta: ${metaResponse.status}`);
            return null;
        }
        const mediaMetadata = await metaResponse.json();
        const downloadUrl = mediaMetadata.url;
        const mimeType = mediaMetadata.mime_type;
        if (!downloadUrl) {
            console.error('[WhatsApp Service] No media URL found in metadata');
            return null;
        }
        console.log(`[WhatsApp Service] Downloading media payload from: ${downloadUrl}`);
        // Step 2: Download the binary file payload
        const downloadResponse = await fetch(downloadUrl, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        if (!downloadResponse.ok) {
            console.error(`[WhatsApp Service] Binary download failed: ${downloadResponse.status}`);
            return null;
        }
        const arrayBuffer = await downloadResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        console.log(`[WhatsApp Service] Media download complete. Type: ${mimeType}`);
        return { mimeType, dataUrl };
    }
    catch (error) {
        console.error(`[WhatsApp Service] Error downloading media:`, error.message);
        return null;
    }
}
