import { isFirebaseAdminInitialized, adminDb } from '../config/firebaseAdmin';
import { db as clientDb } from '../../firebase';
import { collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';

function getDb() {
  return isFirebaseAdminInitialized && adminDb ? adminDb : clientDb;
}

export async function seedMLAPortalData() {
  console.log('[Seed Service] Checking for required collections...');
  try {
    const database = getDb();
    
    // 1. Seed Departments
    const departments = [
      { id: 'DEPT-PWD', departmentId: 'DEPT-PWD', name: 'PWD', fullName: 'Public Works Department' },
      { id: 'DEPT-DJB', departmentId: 'DEPT-DJB', name: 'DJB', fullName: 'Delhi Jal Board' },
      { id: 'DEPT-POWER', departmentId: 'DEPT-POWER', name: 'Power Department', fullName: 'Department of Power' },
      { id: 'DEPT-POLICE', departmentId: 'DEPT-POLICE', name: 'Police', fullName: 'Delhi Police' },
      { id: 'DEPT-HEALTH', departmentId: 'DEPT-HEALTH', name: 'Health', fullName: 'Department of Health & Family Welfare' },
      { id: 'DEPT-MCD', departmentId: 'DEPT-MCD', name: 'Municipality', fullName: 'Municipal Corporation of Delhi' },
      { id: 'DEPT-UD', departmentId: 'DEPT-UD', name: 'Urban Development', fullName: 'Urban Development Department' },
      { id: 'DEPT-AGRI', departmentId: 'DEPT-AGRI', name: 'Agriculture Department', fullName: 'Department of Agriculture' },
      { id: 'DEPT-EDU', departmentId: 'DEPT-EDU', name: 'Education Department', fullName: 'Directorate of Education' }
    ];

    for (const dept of departments) {
      if (isFirebaseAdminInitialized && adminDb) {
        await adminDb.collection('departments').doc(dept.id).set(dept);
      } else {
        await setDoc(doc(clientDb, 'departments', dept.id), dept);
      }
    }
    console.log('[Seed Service] Departments collection seeded.');

    // 2. Seed Officers
    const officers = [
      { id: 'OFF-PWD-001', departmentId: 'DEPT-PWD', fullName: 'Shri Rajesh Sharma', phone: '+919876543210', email: 'rajesh.pwd@delhi.gov.in', rating: 4.8, workload: 2 },
      { id: 'OFF-DJB-001', departmentId: 'DEPT-DJB', fullName: 'Smt. Sunita Rao', phone: '+919876543211', email: 'sunita.djb@delhi.gov.in', rating: 4.5, workload: 4 },
      { id: 'OFF-POWER-001', departmentId: 'DEPT-POWER', fullName: 'Shri Amit Verma', phone: '+919876543212', email: 'amit.power@delhi.gov.in', rating: 4.2, workload: 1 },
      { id: 'OFF-POLICE-001', departmentId: 'DEPT-POLICE', fullName: 'Shri Vikram Singh', phone: '+919876543213', email: 'vikram.police@delhi.gov.in', rating: 4.9, workload: 3 },
      { id: 'OFF-MCD-001', departmentId: 'DEPT-MCD', fullName: 'Smt. Priya Gupta', phone: '+919876543214', email: 'priya.mcd@delhi.gov.in', rating: 4.0, workload: 5 }
    ];

    for (const off of officers) {
      if (isFirebaseAdminInitialized && adminDb) {
        await adminDb.collection('officers').doc(off.id).set(off);
      } else {
        await setDoc(doc(clientDb, 'officers', off.id), off);
      }
    }
    console.log('[Seed Service] Officers collection seeded.');

    // 3. Seed MLA Constituencies
    const constituencies = [
      {
        id: 'CONST-ND',
        state: 'Delhi',
        district: 'New Delhi',
        constituencyName: 'New Delhi Assembly',
        mlaName: 'Shri Ankit Kumar',
        mlaId: 'MLA-DEL-045',
        office: 'MLA Office, Connaught Place, New Delhi',
        phone: '+919999912345',
        email: 'ankit.mla@delhi.gov.in',
        wardList: ['Ward 12', 'Ward 13', 'Ward 14']
      },
      {
        id: 'CONST-ED',
        state: 'Delhi',
        district: 'East Delhi',
        constituencyName: 'East Delhi Assembly',
        mlaName: 'Smt. Ritu Maheshwari',
        mlaId: 'MLA-DEL-012',
        office: 'MLA Office, Laxmi Nagar, Delhi',
        phone: '+919999954321',
        email: 'ritu.mla@delhi.gov.in',
        wardList: ['Ward 5', 'Ward 6', 'Ward 7']
      }
    ];

    for (const consti of constituencies) {
      if (isFirebaseAdminInitialized && adminDb) {
        await adminDb.collection('mla_constituencies').doc(consti.id).set(consti);
        await adminDb.collection('mlas').doc(consti.mlaId).set({
          uid: consti.mlaId,
          mlaId: consti.mlaId,
          fullName: consti.mlaName,
          role: 'MLA',
          email: consti.email,
          phone: consti.phone,
          constituency: consti.constituencyName
        });
      } else {
        await setDoc(doc(clientDb, 'mla_constituencies', consti.id), consti);
        await setDoc(doc(clientDb, 'mlas', consti.mlaId), {
          uid: consti.mlaId,
          mlaId: consti.mlaId,
          fullName: consti.mlaName,
          role: 'MLA',
          email: consti.email,
          phone: consti.phone,
          constituency: consti.constituencyName
        });
      }
    }
    console.log('[Seed Service] MLA Constituencies & MLA users seeded.');

    // 4. Seed sample complaints assigned to MLA to ensure dashboard is visible and live immediately
    const sampleComplaints = [
      {
        id: 'CMP-1011',
        complaintId: 'CMP-1011',
        uid: 'wa_9999900001',
        citizenName: 'Amit Patel',
        phoneNumber: '+919999900001',
        email: 'amit.patel@gmail.com',
        title: 'Sewer Overflow on CP Radial Road 3',
        description: 'Severe sewage water clogging on Connaught Place Radial Road 3 since past 3 days. Extremely foul smell and health hazard.',
        category: 'Sanitation & Cleanliness',
        priority: 'CRITICAL',
        district: 'New Delhi',
        state: 'Delhi',
        constituency: 'New Delhi Assembly',
        assignedMLA: 'Shri Ankit Kumar',
        assignedMLAId: 'MLA-DEL-045',
        location: { lat: 28.6304, lng: 77.2177, address: 'Radial Road 3, Connaught Place, New Delhi' },
        latitude: 28.6304,
        longitude: 77.2177,
        status: 'AI_Validated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        assignedOfficer: 'Smt. Priya Gupta',
        assignedOfficerId: 'OFF-MCD-001',
        department: 'Municipality',
        departmentId: 'DEPT-MCD',
        routingPipelineCompleted: true,
        fraudFlag: 'CLEAN',
        timeline: [
          { step: 1, title: 'Complaint Submitted', date: new Date().toLocaleDateString('en-IN'), desc: 'Complaint registered.', iconName: 'FileText' },
          { step: 2, title: 'AI Validation Completed', date: new Date().toLocaleDateString('en-IN'), desc: 'AI auto routing finished.', iconName: 'ShieldCheck' }
        ],
        currentStep: 2
      },
      {
        id: 'CMP-1012',
        complaintId: 'CMP-1012',
        uid: 'wa_9999900002',
        citizenName: 'Rohan Joshi',
        phoneNumber: '+919999900002',
        email: 'rohan.joshi@gmail.com',
        title: 'Potholes on Barakhamba Road',
        description: 'Large potholes formed on Barakhamba road near Metro station Gate 4. Causing slow traffic and risk to two-wheelers.',
        category: 'Civic Infrastructure',
        priority: 'HIGH',
        district: 'New Delhi',
        state: 'Delhi',
        constituency: 'New Delhi Assembly',
        assignedMLA: 'Shri Ankit Kumar',
        assignedMLAId: 'MLA-DEL-045',
        location: { lat: 28.6270, lng: 77.2280, address: 'Barakhamba Road, New Delhi' },
        latitude: 28.6270,
        longitude: 77.2280,
        status: 'AI_Validated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        assignedOfficer: 'Shri Rajesh Sharma',
        assignedOfficerId: 'OFF-PWD-001',
        department: 'PWD',
        departmentId: 'DEPT-PWD',
        routingPipelineCompleted: true,
        fraudFlag: 'CLEAN',
        timeline: [
          { step: 1, title: 'Complaint Submitted', date: new Date().toLocaleDateString('en-IN'), desc: 'Complaint registered.', iconName: 'FileText' }
        ],
        currentStep: 1
      }
    ];

    for (const cmp of sampleComplaints) {
      if (isFirebaseAdminInitialized && adminDb) {
        const docRef = adminDb.collection('complaints').doc(cmp.id);
        const existingDoc = await docRef.get();
        if (!existingDoc.exists) {
          await docRef.set(cmp);
        }
      } else {
        const docRef = doc(clientDb, 'complaints', cmp.id);
        const existingDoc = await getDoc(docRef);
        if (!existingDoc.exists()) {
          await setDoc(docRef, cmp);
        }
      }
    }
    console.log('[Seed Service] Sample complaints seeded successfully.');

    // Auto-route any existing unrouted complaints in backlog
    console.log('[Seed Service] Checking for unrouted complaints in database...');
    let allComplaints: any[] = [];
    if (isFirebaseAdminInitialized && adminDb) {
      const snap = await adminDb.collection('complaints').get();
      snap.forEach(doc => allComplaints.push({ id: doc.id, ...doc.data() }));
    } else {
      const snap = await getDocs(collection(clientDb, 'complaints'));
      snap.forEach(doc => allComplaints.push({ id: doc.id, ...doc.data() }));
    }

    const unrouted = allComplaints.filter(c => !c.routingPipelineCompleted);
    console.log(`[Seed Service] Found ${unrouted.length} unrouted complaints. Auto-routing...`);
    
    if (unrouted.length > 0) {
      const { runAutoRoutingPipeline } = require('./mlaRoutingService');
      for (const cmp of unrouted) {
        console.log(`[Seed Service] Auto-routing backlog complaint: ${cmp.id}`);
        await runAutoRoutingPipeline(cmp.id, cmp);
      }
    }

  } catch (err: any) {
    console.error('[Seed Service] Error seeding data:', err.message);
  }
}
