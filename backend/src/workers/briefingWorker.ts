import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { generateBriefingPDF } from '../services/pdfService';

/**
 * Automates compiling district resolution data into CM briefings
 */
async function generateAndArchiveBriefing(type: 'daily' | 'weekly' | 'monthly') {
  console.log(`[Briefing Worker] Starting automated ${type} briefing generation...`);
  
  try {
    const querySnap = await getDocs(collection(db, 'complaints'));
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

    const pdfBuffer = await generateBriefingPDF(text, { type });
    const briefingId = `BR-${type.toUpperCase()}-${Date.now()}`;

    await setDoc(doc(db, 'copilot_briefings', briefingId), {
      type,
      name: `Automated ${type.charAt(0).toUpperCase() + type.slice(1)} Summary`,
      desc: `ML-compiled executive state performance log.`,
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    });

    console.log(`[Briefing Worker] Successfully generated and stored ${type} briefing: ${briefingId}`);
  } catch (error: any) {
    console.error(`[Briefing Worker] Failed to run ${type} briefing generator:`, error.message);
  }
}

/**
 * Start the background schedules (Daily: every 1 min in dev, Weekly: every 5 mins, Monthly: every 10 mins, or mapping 24h cron)
 */
export function startBriefingScheduler() {
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
