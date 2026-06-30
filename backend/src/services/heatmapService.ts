import { isFirebaseAdminInitialized, adminDb } from '../config/firebaseAdmin';

export interface HotspotData {
  id: string;
  name: string;
  coords: [number, number];
  complaints: number;
  status: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'DARK_RED';
  openCases: number;
  resolvedCases: number;
  criticalCases: number;
  severityScore: number;
  impactRadius: number;
  riskScore: number;
  hotspotScore: number;
  categoryBreakdown: { [key: string]: number };
  priorityBreakdown: { [key: string]: number };
  departmentBreakdown: { [key: string]: number };
}

export interface HeatmapState {
  lastSyncTimestamp: string;
  totalComplaintsLoaded: number;
  hotspotsDetected: number;
  criticalZonesCount: number;
  hotspots: HotspotData[];
}

const DISTRICT_COORDS: { [key: string]: [number, number] } = {
  'Central Delhi': [28.6465, 77.2157],
  'East Delhi': [28.6300, 77.2900],
  'New Delhi': [28.6139, 77.2090],
  'North Delhi': [28.6830, 77.1850],
  'North East Delhi': [28.7100, 77.2600],
  'North West Delhi': [28.7300, 77.1300],
  'Shahdara': [28.6800, 77.3000],
  'South Delhi': [28.5355, 77.2100],
  'South East Delhi': [28.5500, 77.2500],
  'South West Delhi': [28.5800, 77.0500],
  'West Delhi': [28.6500, 77.1000],
};

// Global in-memory cache for heatmap state
let currentHeatmapState: HeatmapState = {
  lastSyncTimestamp: new Date(0).toISOString(),
  totalComplaintsLoaded: 0,
  hotspotsDetected: 0,
  criticalZonesCount: 0,
  hotspots: [],
};

// Mock complaints for simulation mode
let mockComplaints: any[] = [];

// Initialize mock complaints if running locally without real DB
function initMockComplaints() {
  if (mockComplaints.length > 0) return;
  
  const districts = Object.keys(DISTRICT_COORDS);
  const categories = ['Civic Infrastructure', 'Water Related Issues', 'Electricity', 'Sanitation & Cleanliness', 'Healthcare', 'Public Safety'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const departments = ['PWD', 'DJB', 'MCD', 'NDMC', 'Health Dept', 'Delhi Police'];
  const statuses = ['Submitted', 'AI_Validated', 'Assigned_Dept', 'Officer_Assigned', 'Investigation_Started', 'Resolved', 'Closed'];

  // Generate 1500 mock complaints to simulate real-world density
  for (let i = 0; i < 1500; i++) {
    const district = districts[Math.floor(Math.random() * districts.length)];
    // Make North East Delhi and Shahdara critical by biasing generation
    let finalDistrict = district;
    if (Math.random() < 0.25) {
      finalDistrict = Math.random() < 0.5 ? 'North East Delhi' : 'Shahdara';
    }

    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    mockComplaints.push({
      id: `CMP-MOCK-${10000 + i}`,
      district: finalDistrict,
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priority,
      status: status,
      department: departments[Math.floor(Math.random() * departments.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
}

export function getHeatmapState(): HeatmapState {
  // If state is empty, trigger an initial sync
  if (currentHeatmapState.hotspots.length === 0) {
    calculateHotspots(true); // force full recalculation
  }
  return currentHeatmapState;
}

export async function calculateHotspots(forceFull: boolean = false): Promise<HeatmapState> {
  const startTime = Date.now();
  console.log(`[Heatmap Engine] Starting hotspot calculation. Force full: ${forceFull}`);

  let complaintsToProcess: any[] = [];
  const nowStr = new Date().toISOString();
  const lastSync = forceFull ? new Date(0).toISOString() : currentHeatmapState.lastSyncTimestamp;

  if (isFirebaseAdminInitialized && adminDb) {
    try {
      // Query Firestore incrementally based on updatedAt
      let queryRef = adminDb.collection('complaints').where('updatedAt', '>', lastSync);
      const snapshot = await queryRef.get();
      
      console.log(`[Heatmap Engine] Incremental query fetched ${snapshot.size} records.`);
      
      snapshot.forEach(doc => {
        complaintsToProcess.push({ id: doc.id, ...doc.data() });
      });

      // If we are doing incremental sync, fetch the rest from our existing state
      // to do a full merge/recalculation.
      if (!forceFull && complaintsToProcess.length > 0) {
        // Fetch all complaints to perform full recalculation
        const fullSnapshot = await adminDb.collection('complaints').get();
        complaintsToProcess = [];
        fullSnapshot.forEach(doc => {
          complaintsToProcess.push({ id: doc.id, ...doc.data() });
        });
      } else if (!forceFull && complaintsToProcess.length === 0) {
        // Nothing updated since last sync
        console.log(`[Heatmap Engine] No new/updated records. Sync skipped.`);
        currentHeatmapState.lastSyncTimestamp = nowStr;
        return currentHeatmapState;
      }
    } catch (err: any) {
      console.error('[Heatmap Engine] Firestore fetch failed, falling back to mock:', err.message);
      initMockComplaints();
      complaintsToProcess = mockComplaints;
    }
  } else {
    // Simulation fallback
    initMockComplaints();
    if (forceFull) {
      complaintsToProcess = mockComplaints;
    } else {
      // Simulate adding a few new complaints on each sync call
      const newComplaintsCount = Math.floor(Math.random() * 5) + 1;
      const districts = Object.keys(DISTRICT_COORDS);
      const categories = ['Civic Infrastructure', 'Water Related Issues', 'Electricity', 'Sanitation & Cleanliness', 'Healthcare', 'Public Safety'];
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const departments = ['PWD', 'DJB', 'MCD', 'NDMC', 'Health Dept', 'Delhi Police'];
      
      for (let i = 0; i < newComplaintsCount; i++) {
        const district = districts[Math.floor(Math.random() * districts.length)];
        const newC = {
          id: `CMP-NEW-${Date.now()}-${i}`,
          district,
          category: categories[Math.floor(Math.random() * categories.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status: 'Submitted',
          department: departments[Math.floor(Math.random() * departments.length)],
          createdAt: nowStr,
          updatedAt: nowStr
        };
        mockComplaints.push(newC);
      }
      complaintsToProcess = mockComplaints;
    }
  }

  // Aggregate complaints by District
  const districtAggregates: { [key: string]: any[] } = {};
  Object.keys(DISTRICT_COORDS).forEach(d => {
    districtAggregates[d] = [];
  });

  complaintsToProcess.forEach(c => {
    const dist = c.district || 'New Delhi';
    if (districtAggregates[dist]) {
      districtAggregates[dist].push(c);
    } else {
      // Dynamic addition if not present
      districtAggregates[dist] = [c];
    }
  });

  let criticalZonesCount = 0;
  const hotspots: HotspotData[] = Object.keys(DISTRICT_COORDS).map((districtName, idx) => {
    const districtComplaints = districtAggregates[districtName] || [];
    const totalCount = districtComplaints.length;

    let openCases = 0;
    let resolvedCases = 0;
    let criticalCases = 0;
    let severitySum = 0;

    const categoryBreakdown: { [key: string]: number } = {};
    const priorityBreakdown: { [key: string]: number } = {};
    const departmentBreakdown: { [key: string]: number } = {};

    districtComplaints.forEach(c => {
      // Category Breakdown
      const cat = c.category || 'General';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

      // Priority Breakdown
      const prio = c.priority || 'MEDIUM';
      priorityBreakdown[prio] = (priorityBreakdown[prio] || 0) + 1;

      // Department Breakdown
      const dept = c.department || 'General';
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;

      // Case Status Check
      const isResolved = ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status);
      if (isResolved) {
        resolvedCases++;
      } else {
        openCases++;
        if (prio === 'CRITICAL') {
          criticalCases++;
        }
      }

      // Severity Weights
      if (prio === 'CRITICAL') severitySum += 10;
      else if (prio === 'HIGH') severitySum += 6;
      else if (prio === 'MEDIUM') severitySum += 3;
      else severitySum += 1;
    });

    const severityScore = totalCount > 0 ? parseFloat((severitySum / totalCount).toFixed(1)) : 0;
    
    // AI Hotspot engine calculations
    const hotspotScore = openCases * 2 + criticalCases * 5;
    
    // Determine Zone status based on hotspot score thresholds
    let status: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'DARK_RED' = 'GREEN';
    if (hotspotScore >= 500) {
      status = 'DARK_RED';
      criticalZonesCount++;
    } else if (hotspotScore >= 300) {
      status = 'RED';
      criticalZonesCount++;
    } else if (hotspotScore >= 150) {
      status = 'ORANGE';
    } else if (hotspotScore >= 50) {
      status = 'YELLOW';
    }

    // Impact radius is a log/square root function of open cases
    const impactRadius = Math.round(12 + Math.sqrt(openCases) * 4);
    
    // Risk score out of 100 based on severity and critical count
    const riskScore = Math.min(100, Math.round((severityScore * 8) + (criticalCases * 3)));

    return {
      id: `H-${idx + 1}`,
      name: districtName,
      coords: DISTRICT_COORDS[districtName],
      complaints: totalCount,
      status,
      openCases,
      resolvedCases,
      criticalCases,
      severityScore,
      impactRadius,
      riskScore,
      hotspotScore,
      categoryBreakdown,
      priorityBreakdown,
      departmentBreakdown,
    };
  });

  currentHeatmapState = {
    lastSyncTimestamp: nowStr,
    totalComplaintsLoaded: complaintsToProcess.length,
    hotspotsDetected: hotspots.filter(h => h.openCases > 0).length,
    criticalZonesCount,
    hotspots,
  };

  const elapsed = Date.now() - startTime;
  console.log(`[Heatmap Engine] Recalculated state in ${elapsed}ms. Last Sync: ${currentHeatmapState.lastSyncTimestamp}`);
  return currentHeatmapState;
}

export function startFirebaseListener(io: any) {
  if (isFirebaseAdminInitialized && adminDb) {
    console.log("[Heatmap Engine] Starting real-time Firestore listener for complaints...");
    adminDb.collection('complaints').onSnapshot(async (snapshot) => {
      console.log(`[Heatmap Engine] Real-time Firestore update detected. Recalculating...`);
      const newState = await calculateHotspots(true);
      io.emit('heatmap_update', newState);

      // Real-time RAG Knowledge Base Vector Auto-Updates and Routing Triggers
      try {
        const { upsertVector } = require('./pineconeService');
        const { runAutoRoutingPipeline } = require('./mlaRoutingService');

        snapshot.docChanges().forEach(async (change) => {
          const data = change.doc.data();
          
          // Trigger Auto Routing Engine if new and not completed
          if (change.type === 'added' && !data.routingPipelineCompleted) {
            console.log(`[Heatmap Engine] New complaint detected. Triggering auto routing pipeline: ${change.doc.id}`);
            // Run asynchronously so we don't block
            runAutoRoutingPipeline(change.doc.id, data).catch((err: any) => {
              console.error(`[Heatmap Engine] Failed to auto route complaint ${change.doc.id}:`, err.message);
            });
          }

          if (change.type === 'added' || change.type === 'modified') {
            const textToEmbed = `Grievance ID: ${change.doc.id}\nCategory: ${data.category}\nPriority: ${data.priority}\nDistrict: ${data.district}\nStatus: ${data.status}\nDescription: ${data.description}`;
            await upsertVector(change.doc.id, textToEmbed, {
              type: 'complaint',
              category: data.category || 'General',
              district: data.district || 'Delhi',
              title: data.title || 'Public Grievance'
            });
          }
        });
      } catch (err: any) {
        console.error('[Heatmap Engine] Pinecone/Routing real-time updates failed:', err.message);
      }

    }, (error) => {
      console.error("[Heatmap Engine] Firestore real-time listener error:", error.message);
    });
  } else {
    console.log("[Heatmap Engine] Firestore Admin not initialized. Falling back to Client SDK Firestore listener...");
    try {
      const { db: clientDb } = require('../../firebase');
      const { collection: firestoreCollection, onSnapshot } = require('firebase/firestore');
      const { runAutoRoutingPipeline } = require('./mlaRoutingService');

      onSnapshot(firestoreCollection(clientDb, 'complaints'), async (snapshot: any) => {
        console.log(`[Heatmap Engine] [Client SDK] Real-time Firestore update detected. Recalculating...`);
        const newState = await calculateHotspots(true);
        io.emit('heatmap_update', newState);

        snapshot.docChanges().forEach(async (change: any) => {
          const data = change.doc.data();
          if (change.type === 'added' && !data.routingPipelineCompleted) {
            console.log(`[Heatmap Engine] [Client SDK] New complaint detected: ${change.doc.id}`);
            runAutoRoutingPipeline(change.doc.id, data).catch((err: any) => {
              console.error(`[Heatmap Engine] [Client SDK] Failed to auto route complaint ${change.doc.id}:`, err.message);
            });
          }
        });
      }, (error: any) => {
        console.error("[Heatmap Engine] [Client SDK] Firestore listener error:", error.message);
      });
    } catch (err: any) {
      console.error("[Heatmap Engine] Failed to start Client SDK Firestore listener:", err.message);
    }
  }
}

