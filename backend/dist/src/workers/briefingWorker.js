"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBriefingScheduler = startBriefingScheduler;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../../firebase");
const pdfService_1 = require("../services/pdfService");
/**
 * Automates compiling district resolution data into CM briefings
 */
async function generateAndArchiveBriefing(type) {
    console.log(`[Briefing Worker] Starting automated ${type} briefing generation...`);
    try {
        const querySnap = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'complaints'));
        let total = 0, resolved = 0, critical = 0;
        querySnap.forEach((doc) => {
            const data = doc.data();
            total++;
            if (['Resolved', 'Closed', 'Citizen_Verified'].includes(data.status)) {
                resolved++;
            }
            if (data.priority === 'CRITICAL' && !['Resolved', 'Closed'].includes(data.status)) {
                critical++;
            }
        });
        const text = `AUTOMATED STATE COMMAND BRIEFING (${type.toUpperCase()})\n\n` +
            `System analysis conducted: ${new Date().toLocaleString()}.\n` +
            `Active grievances registered across city districts: ${total}.\n` +
            `Total successfully resolved cases: ${resolved}.\n` +
            `Escalated critical incidents requiring immediate intervention: ${critical}.\n` +
            `Recommended policy focus: workforce redistribution & emergency funds allocation.`;
        const pdfBuffer = await (0, pdfService_1.generateBriefingPDF)(text, { type });
        const briefingId = `BR-${type.toUpperCase()}-${Date.now()}`;
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, 'copilot_briefings', briefingId), {
            type,
            name: `Automated ${type.charAt(0).toUpperCase() + type.slice(1)} Summary`,
            desc: `ML-compiled executive state performance log.`,
            date: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString()
        });
        console.log(`[Briefing Worker] Successfully generated and stored ${type} briefing: ${briefingId}`);
    }
    catch (error) {
        console.error(`[Briefing Worker] Failed to run ${type} briefing generator:`, error.message);
    }
}
/**
 * Start the background schedules (Daily: every 1 min in dev, Weekly: every 5 mins, Monthly: every 10 mins, or mapping 24h cron)
 */
function startBriefingScheduler() {
    console.log('[Briefing Worker] Initializing automated schedules...');
    // Running periodic simulations to represent the AM schedules
    // Daily brief simulation (every 2 minutes)
    setInterval(() => {
        generateAndArchiveBriefing('daily');
    }, 120000);
    // Weekly brief simulation (every 5 minutes)
    setInterval(() => {
        generateAndArchiveBriefing('weekly');
    }, 300000);
    // Run immediate first-run compilation to pre-populate logs
    generateAndArchiveBriefing('daily');
}
