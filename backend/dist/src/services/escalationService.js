"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEscalationCycle = runEscalationCycle;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
/**
 * Iterates through active complaints and applies auto-escalation rules based on time elapsed since last update.
 */
async function runEscalationCycle() {
    console.log('[Escalation Service] Starting auto-escalation cycle check...');
    if (!firebaseAdmin_1.isFirebaseAdminInitialized || !firebaseAdmin_1.adminDb) {
        console.log('[Escalation Service] Firebase Admin not initialized. Skipping escalation cycle.');
        return { processedCount: 0, escalatedCount: 0 };
    }
    try {
        const complaintsRef = firebaseAdmin_1.adminDb.collection('complaints');
        // Fetch active complaints (not Closed, Citizen_Verified or Resolved)
        const snapshot = await complaintsRef
            .where('status', 'not-in', ['Resolved', 'Citizen_Verified', 'Closed'])
            .get();
        let processedCount = 0;
        let escalatedCount = 0;
        const now = new Date();
        for (const doc of snapshot.docs) {
            processedCount++;
            const data = doc.data();
            const complaintId = doc.id;
            const lastUpdateStr = data.updatedAt || data.createdAt || new Date().toISOString();
            const lastUpdate = new Date(lastUpdateStr);
            const diffMs = now.getTime() - lastUpdate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            let targetEscalation = null;
            let targetNotes = '';
            if (diffHours >= 168) { // 7 days
                if (data.escalatedTo !== 'State Administrator') {
                    targetEscalation = 'State Administrator';
                    targetNotes = `Auto-escalated to State Administrator: No action for 7 days.`;
                }
            }
            else if (diffHours >= 72) { // 72 hours
                if (data.escalatedTo !== 'District Manager' && data.escalatedTo !== 'State Administrator') {
                    targetEscalation = 'District Manager';
                    targetNotes = `Auto-escalated to District Manager: No action for 72 hours.`;
                }
            }
            else if (diffHours >= 24) { // 24 hours
                if (!data.escalatedTo) {
                    targetEscalation = 'Department Head';
                    targetNotes = `Auto-escalated to Department Head: No action for 24 hours.`;
                }
            }
            // Check for Critical severity unresolved issues -> Escalate to CM Dashboard
            if (data.severity === 'CRITICAL' && !data.escalatedToCM) {
                console.log(`[Escalation Service] Grievance ${complaintId} has CRITICAL severity. Flagging for CM War Room.`);
                await complaintsRef.doc(complaintId).update({
                    escalatedToCM: true,
                    updatedAt: new Date().toISOString()
                });
                escalatedCount++;
            }
            if (targetEscalation) {
                console.log(`[Escalation Service] Escalating grievance ${complaintId} to ${targetEscalation}`);
                await complaintsRef.doc(complaintId).update({
                    escalatedTo: targetEscalation,
                    lastEscalationTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                // Insert auditing event in grievance_events
                const eventRef = firebaseAdmin_1.adminDb.collection('grievance_events').doc();
                await eventRef.set({
                    id: eventRef.id,
                    grievance_id: complaintId,
                    status: data.status || 'Active',
                    message: targetNotes,
                    created_by: 'System Escalation Engine',
                    timestamp: new Date().toISOString()
                });
                escalatedCount++;
            }
        }
        console.log(`[Escalation Service] Cycle completed. Audited: ${processedCount}, Escalated: ${escalatedCount}`);
        return { processedCount, escalatedCount };
    }
    catch (error) {
        console.warn('[Escalation Service] Warning: Failed to execute escalation cycle:', error.message);
        if (error.message.includes('credentials') || error.message.includes('permission') || error.message.includes('default credentials')) {
            console.log('[Escalation Service] [Simulation Fallback] Local server or Render instance does not have GCP credentials configured.');
            return { processedCount: 0, escalatedCount: 0 };
        }
        throw error;
    }
}
