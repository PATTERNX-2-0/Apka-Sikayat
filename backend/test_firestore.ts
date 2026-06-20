import { isFirebaseAdminInitialized, adminDb } from './firebaseAdmin';

async function runTest() {
  console.log(`[Diagnostic] Firebase Admin initialized: ${isFirebaseAdminInitialized}`);
  if (!adminDb) {
    console.error("[Diagnostic] Firebase Firestore Admin DB is null!");
    return;
  }
  
  try {
    console.log("[Diagnostic] Attempting to query Firestore 'complaints' collection...");
    const snap = await adminDb.collection('complaints').limit(2).get();
    console.log(`[Diagnostic] Success! Retrieved ${snap.size} complaint documents.`);
    snap.docs.forEach(doc => {
      console.log(` - Document ID: ${doc.id}, Title: "${doc.data().title}"`);
    });
  } catch (err: any) {
    console.error("[Diagnostic] Firestore query failed:", err.message);
  }
}

runTest();
