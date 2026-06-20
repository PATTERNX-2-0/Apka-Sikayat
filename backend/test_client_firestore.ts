import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../frontend/.env") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function testClientAccess() {
  console.log("[Diagnostic Client] Initializing Firebase with Config Project ID:", firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    console.log("[Diagnostic Client] Logging in as citizen@demo.com...");
    const userCredential = await signInWithEmailAndPassword(auth, "citizen@demo.com", "password123");
    const user = userCredential.user;
    console.log("[Diagnostic Client] Logged in successfully! User UID:", user.uid);

    console.log("[Diagnostic Client] Querying complaints collection where uid =", user.uid);
    const q = query(collection(db, "complaints"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    console.log(`[Diagnostic Client] Retrieved ${querySnapshot.size} complaints.`);
    querySnapshot.forEach((doc) => {
      console.log(` - Complaint ID: ${doc.id}, Title: "${doc.data().title}", Status: "${doc.data().status}"`);
    });

    // Test writing a temp document
    console.log("[Diagnostic Client] Testing write to complaints...");
    const testId = `CMP-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    const docRef = doc(db, "complaints", testId);
    await setDoc(docRef, {
      id: testId,
      uid: user.uid,
      title: "Test Complaint from Diagnostic Tool",
      status: "Pending",
      date: new Date().toISOString().split('T')[0]
    });
    console.log(`[Diagnostic Client] Successfully wrote test complaint: ${testId}`);

  } catch (err: any) {
    console.error("[Diagnostic Client] Test failed with error:", err.code || err.message, err);
  }
}

testClientAccess();
