import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

async function diagnose() {
  console.log("Fetching all complaints from Firestore...");
  const snap = await getDocs(collection(db, "complaints"));
  console.log(`Found ${snap.size} total complaints in Firestore.`);
  
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}`);
    console.log(`  Title: ${data.title || data.category}`);
    console.log(`  District: ${data.district}`);
    console.log(`  Constituency (constituency): ${data.constituency}`);
    console.log(`  AssemblyConstituency (assemblyConstituency): ${data.assemblyConstituency}`);
    console.log(`  assignedMLA: ${data.assignedMLA}`);
    console.log(`  assignedMLAId: ${data.assignedMLAId}`);
    console.log(`  mlaName: ${data.mlaName}`);
    console.log(`  mlaId: ${data.mlaId}`);
    console.log(`  routingPipelineCompleted: ${data.routingPipelineCompleted}`);
    console.log(`  status: ${data.status}`);
    console.log("-----------------------------------------");
  });
}

diagnose().catch(console.error);
