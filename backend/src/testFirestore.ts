import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

async function test() {
  try {
    const querySnap = await getDocs(collection(db, 'complaints'));
    console.log(`[Test Firestore] Total complaints documents: ${querySnap.size}`);
    querySnap.forEach(doc => {
      console.log(` - ID: ${doc.id}, Category: ${doc.data().category}, CreatedAt: ${doc.data().createdAt}`);
    });
  } catch (err: any) {
    console.error(`[Test Firestore] Error:`, err.message);
  }
}

test();
