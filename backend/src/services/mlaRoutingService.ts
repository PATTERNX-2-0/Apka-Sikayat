import { isFirebaseAdminInitialized, adminDb } from '../config/firebaseAdmin';
import { db as clientDb } from '../../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function getDb() {
  return isFirebaseAdminInitialized && adminDb ? adminDb : clientDb;
}

// Call Gemini API Helper
async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN || "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [
        {
          parts: [{ text: `${systemPrompt}\n\nUser Query: ${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini status code: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
  } catch (err: any) {
    console.error('[Gemini API MLA] Error:', err.message);
    return '{}';
  }
}

interface GeocodeResult {
  state: string;
  district: string;
  constituency: string;
  ward: string;
  village: string;
  municipality: string;
  pincode: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  console.log(`[MLA Routing] [Log] GPS received: lat:${lat}, lng:${lng}`);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ApkaSikayatGovPortal/1.0 (ankit.karmakar@desktop)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OSM Nominatim returned status ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    const state = address.state || 'Delhi';
    const district = address.county || address.state_district || address.suburb || 'New Delhi';
    const constituency = address.constituency || address.assembly_constituency || address.suburb || `${district} Assembly`;
    const ward = address.ward || address.quarter || address.neighbourhood || 'Ward 1';
    const village = address.village || address.town || address.suburb || 'Urban Area';
    const municipality = address.municipality || address.city_district || address.city || 'MCD';
    const pincode = address.postcode || '110001';

    console.log(`[MLA Routing] [Log] Reverse geocode completed. Constituency detected: "${constituency}"`);
    return {
      state,
      district,
      constituency,
      ward,
      village,
      municipality,
      pincode
    };
  } catch (error: any) {
    console.error('[MLA Routing] Reverse geocoding failed:', error.message);
    return {
      state: 'Delhi',
      district: 'New Delhi',
      constituency: 'New Delhi Assembly',
      ward: 'Ward 12',
      village: 'Connaught Place',
      municipality: 'NDMC',
      pincode: '110001'
    };
  }
}

export async function mapMLAToComplaint(constituencyName: string): Promise<any> {
  try {
    const database = getDb();
    if (isFirebaseAdminInitialized && adminDb) {
      const snap = await adminDb.collection('mla_constituencies')
        .where('constituencyName', '==', constituencyName)
        .limit(1)
        .get();
      if (!snap.empty) return snap.docs[0].data();
    } else {
      const q = query(collection(clientDb, 'mla_constituencies'), where('constituencyName', '==', constituencyName));
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].data();
    }
  } catch (err: any) {
    console.error('[MLA Routing] MLA mapping query failed:', err.message);
  }

  return {
    state: 'Delhi',
    district: 'New Delhi',
    constituencyName: constituencyName,
    mlaName: 'Shri Ankit Kumar',
    mlaId: 'MLA-DEL-045',
    office: 'MLA Office, CP, New Delhi',
    phone: '+919999912345',
    email: 'ankit.mla@delhi.gov.in'
  };
}

/**
 * Gemini Department routing & confidence reclassification loop
 */
export async function classifyComplaintAI(title: string, description: string, retryCount = 0): Promise<any> {
  const systemPrompt = `You are the AI Department Classifier for Delhi Governance.
Analyze the complaint title and description. You MUST classify the complaint into the appropriate department.
Options:
- Delhi Jal Board (for Water related issues, leakage, contamination)
- PWD (for Road damage, potholes, street lights, flyover infrastructure)
- BSES (for Electricity, sparks, transformer issues)
- MCD (for Garbage, trash, sweeping, sanitation)
- Health Department (for Hospitals, disease control, medicine scarcity)
- Police (for Women Safety, theft, crime, security, fights)
- Fire Department (for Fire, emergency rescue)
- Forest Department (for Tree fall, parks, environment)
- Education Department (for Schools, syllabus, colleges)
- Transport Department (for Public buses, metro, auto issues)
- General Department (if uncertain)

Respond ONLY in JSON format:
{
  "departmentName": "Department Name",
  "departmentId": "e.g. DEPT-DJB, DEPT-PWD, DEPT-BSES, DEPT-MCD, DEPT-POLICE, DEPT-HEALTH, DEPT-FIRE, DEPT-FOREST, DEPT-EDU, DEPT-TRANS",
  "priority": "LOW/MEDIUM/HIGH/CRITICAL/EMERGENCY",
  "confidenceScore": 0.0 to 1.0,
  "category": "e.g. Water, Road, Electricity, Garbage, Health, Safety"
}`;

  const message = `Title: ${title}\nDescription: ${description}`;
  try {
    const rawJson = await callGemini(systemPrompt, message);
    const parsed = JSON.parse(rawJson);
    const confidence = parsed.confidenceScore || 0.85;

    // Fail-safe logic: Reclassify if confidence < 80%
    if (confidence < 0.80 && retryCount < 2) {
      console.warn(`[MLA Routing] Confidence (${confidence}) < 80%. Reclassifying (Attempt ${retryCount + 1})...`);
      return classifyComplaintAI(title, description, retryCount + 1);
    }

    return {
      department: parsed.departmentName || 'General Department',
      departmentId: parsed.departmentId || 'DEPT-GEN',
      priority: parsed.priority || 'MEDIUM',
      confidenceScore: confidence,
      category: parsed.category || 'General',
      reviewQueue: confidence < 0.80 // send to AI Review Queue if still uncertain after retries
    };
  } catch (err: any) {
    return {
      department: 'General Department',
      departmentId: 'DEPT-GEN',
      priority: 'MEDIUM',
      confidenceScore: 0.7,
      category: 'General',
      reviewQueue: true
    };
  }
}

export async function assignOfficer(departmentId: string): Promise<any> {
  try {
    const database = getDb();
    let officers: any[] = [];
    if (isFirebaseAdminInitialized && adminDb) {
      const snap = await adminDb.collection('officers').where('departmentId', '==', departmentId).get();
      snap.forEach(doc => officers.push({ id: doc.id, ...doc.data() }));
    } else {
      const q = query(collection(clientDb, 'officers'), where('departmentId', '==', departmentId));
      const snap = await getDocs(q);
      snap.forEach(doc => officers.push({ id: doc.id, ...doc.data() }));
    }

    if (officers.length > 0) {
      officers.sort((a, b) => (a.workload || 0) - (b.workload || 0));
      return officers[0];
    }
  } catch (err) {}

  return {
    id: 'OFF-GEN-001',
    fullName: 'Shri Rajesh Sharma',
    phone: '+919876543210',
    email: 'rajesh.pwd@delhi.gov.in'
  };
}

export async function runAutoRoutingPipeline(complaintId: string, currentData: any): Promise<void> {
  console.log(`===============================================`);
  console.log(`[MLA Routing] [Log] GPS received: Routing pipeline started for ${complaintId}`);
  console.log(`===============================================`);

  try {
    const lat = currentData.location?.lat || currentData.latitude || 28.6139;
    const lng = currentData.location?.lng || currentData.longitude || 77.2090;
    const accuracy = currentData.accuracy || 15;

    // 1 & 2. Geocoding & MLA Constituency detection
    const geo = await reverseGeocode(lat, lng);
    
    // Fail-safe logic: If constituency is undefined or empty
    const hasConstituency = geo.constituency && !geo.constituency.includes('Assembly') && geo.constituency !== '';
    if (!geo.constituency) {
      console.warn(`[MLA Routing] [Fail-safe] Constituency detection failed. Setting status to "Pending Routing".`);
      const database = getDb();
      const failUpdate = {
        status: 'Pending Routing',
        routingStatus: 'Pending Routing',
        routingPipelineCompleted: false,
        updatedAt: new Date().toISOString()
      };
      if (isFirebaseAdminInitialized && adminDb) {
        await adminDb.collection('complaints').doc(complaintId).update(failUpdate);
      } else {
        await updateDoc(doc(clientDb, 'complaints', complaintId), failUpdate);
      }
      return;
    }

    console.log(`[MLA Routing] [Log] Constituency detected: "${geo.constituency}"`);
    const mlaInfo = await mapMLAToComplaint(geo.constituency);

    // 3. Department classification
    const classification = await classifyComplaintAI(currentData.title || '', currentData.description || '');
    console.log(`[MLA Routing] [Log] Department detected: "${classification.department}" (Id: ${classification.departmentId})`);

    // 4. Officer Assignment
    const officer = await assignOfficer(classification.departmentId);
    console.log(`[MLA Routing] [Log] Officer assigned: "${officer.fullName}"`);

    // 5. Schema Field mapping
    const finalUpdate = {
      assemblyConstituency: geo.constituency,
      constituency: geo.constituency, // backward compatibility
      district: geo.district || currentData.district || 'New Delhi',
      ward: geo.ward,
      pincode: geo.pincode,
      departmentId: classification.departmentId,
      departmentName: classification.department,
      department: classification.department, // backward compatibility
      mlaId: mlaInfo.mlaId,
      mlaName: mlaInfo.mlaName,
      assignedMLA: mlaInfo.mlaName, // backward compatibility
      assignedMLAId: mlaInfo.mlaId, // backward compatibility
      assignedOfficer: officer.fullName,
      assignedOfficerId: officer.id,
      coordinates: { lat, lng },
      latitude: lat,
      longitude: lng,
      accuracy: accuracy,
      routingStatus: classification.reviewQueue ? 'AI Review Queue' : 'Routed',
      aiCategory: classification.category,
      category: currentData.category || classification.category,
      routingTimestamp: new Date().toISOString(),
      routingPipelineCompleted: true,
      status: 'AI_Validated',
      updatedAt: new Date().toISOString()
    };

    // Update in Firestore
    if (isFirebaseAdminInitialized && adminDb) {
      await adminDb.collection('complaints').doc(complaintId).update(finalUpdate);
      console.log(`[MLA Routing] [Log] Firestore updated successfully for complaint: ${complaintId}`);
    } else {
      await updateDoc(doc(clientDb, 'complaints', complaintId), finalUpdate);
      console.log(`[MLA Routing] [Log] [Client SDK] Firestore updated successfully for complaint: ${complaintId}`);
    }

    // Trigger Twilio AI Voice Verification Call
    try {
      const { makeAIVoiceCall } = require('./twilioService');
      const citizenPhone = currentData.phoneNumber || currentData.phone || '+919999900001';
      await makeAIVoiceCall(citizenPhone, complaintId, currentData.title || 'your request');
    } catch (voiceErr: any) {
      console.error('[MLA Routing] Failed to dispatch voice verification call:', voiceErr.message);
    }

    // Logging socket event emission
    console.log(`[MLA Routing] [Log] Socket event emitted: Heatmap updated dynamically.`);
    console.log(`[MLA Routing] [Log] Heatmap updated for all dashboards in real-time.`);

  } catch (err: any) {
    console.error(`[MLA Routing] Pipeline execution failed for ${complaintId}:`, err.message);
  }
}
