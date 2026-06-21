"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Filter, Flame, TrendingDown, RefreshCw, Clock, Database, ShieldAlert, AlertTriangle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { HotspotData } from './HeatmapComponent';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Dynamically import the map to avoid SSR "window is not defined" crashes
const DynamicHeatmap = dynamic(
  () => import('./HeatmapComponent'),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-gray-200">
      <div className="animate-spin w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full mb-4"></div>
      <p className="text-[#1E3A8A] font-black tracking-widest uppercase text-xs">Initializing GIS Engine...</p>
    </div>
  )}
);

export default function CMHeatmapPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>('');
  const [totalComplaintsLoaded, setTotalComplaintsLoaded] = useState<number>(0);
  const [hotspotsDetected, setHotspotsDetected] = useState<number>(0);
  const [criticalZonesCount, setCriticalZonesCount] = useState<number>(0);
  
  // Auto Sync: OFF, 30s (30000), 1m (60000), 5m (300000), 10m (600000)
  const [autoSyncInterval, setAutoSyncInterval] = useState<string>('OFF');
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const getBackendUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5002';
      }
      return window.location.origin.replace(':5001', ':5002').replace(':3000', ':5002');
    }
    return 'http://localhost:5002';
  };

  const backendUrl = getBackendUrl();

  // ==========================================
  // CLIENT-SIDE LOCAL SIMULATION FALLBACK
  // ==========================================
  const LOCAL_DISTRICT_COORDS: { [key: string]: [number, number] } = {
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

  const localMockComplaintsRef = useRef<any[]>([]);

  const generateLocalMockComplaints = () => {
    if (localMockComplaintsRef.current.length > 0) return;
    const districts = Object.keys(LOCAL_DISTRICT_COORDS);
    const categories = ['Civic Infrastructure', 'Water Related Issues', 'Electricity', 'Sanitation & Cleanliness', 'Healthcare', 'Public Safety'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const departments = ['PWD', 'DJB', 'MCD', 'NDMC', 'Health Dept', 'Delhi Police'];
    const statuses = ['Submitted', 'AI_Validated', 'Assigned_Dept', 'Officer_Assigned', 'Investigation_Started', 'Resolved', 'Closed'];

    for (let i = 0; i < 1500; i++) {
      const district = districts[Math.floor(Math.random() * districts.length)];
      let finalDistrict = district;
      if (Math.random() < 0.25) {
        finalDistrict = Math.random() < 0.5 ? 'North East Delhi' : 'Shahdara';
      }
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      localMockComplaintsRef.current.push({
        id: `CMP-MOCK-${10000 + i}`,
        district: finalDistrict,
        category: categories[Math.floor(Math.random() * categories.length)],
        priority,
        status,
        department: departments[Math.floor(Math.random() * departments.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  };

  const fetchActualFirestoreComplaints = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "complaints"));
      const actualComplaints: any[] = [];
      querySnapshot.forEach((doc) => {
        actualComplaints.push({ id: doc.id, ...doc.data() });
      });
      console.log(`[Heatmap Page] Loaded ${actualComplaints.length} actual complaints from Firestore.`);
      if (actualComplaints.length > 0) {
        localMockComplaintsRef.current = actualComplaints;
        return;
      }
    } catch (error) {
      console.error("[Heatmap Page] Failed to fetch complaints from Firestore, using mock fallback:", error);
    }
    generateLocalMockComplaints();
  };

  const runLocalSimulation = async (isManual: boolean = false) => {
    await fetchActualFirestoreComplaints();
    
    if (isManual && localMockComplaintsRef.current.length === 0) {
      const newCount = Math.floor(Math.random() * 8) + 3;
      const districts = Object.keys(LOCAL_DISTRICT_COORDS);
      const categories = ['Civic Infrastructure', 'Water Related Issues', 'Electricity', 'Sanitation & Cleanliness', 'Healthcare', 'Public Safety'];
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const departments = ['PWD', 'DJB', 'MCD', 'NDMC', 'Health Dept', 'Delhi Police'];
      
      for (let i = 0; i < newCount; i++) {
        localMockComplaintsRef.current.push({
          id: `CMP-NEW-${Date.now()}-${i}`,
          district: districts[Math.floor(Math.random() * districts.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status: 'Submitted',
          department: departments[Math.floor(Math.random() * departments.length)],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    const districtAggregates: { [key: string]: any[] } = {};
    Object.keys(LOCAL_DISTRICT_COORDS).forEach(d => {
      districtAggregates[d] = [];
    });

    localMockComplaintsRef.current.forEach(c => {
      const dist = c.district || 'New Delhi';
      if (districtAggregates[dist]) {
        districtAggregates[dist].push(c);
      }
    });

    let criticalZones = 0;
    const computedHotspots: HotspotData[] = Object.keys(LOCAL_DISTRICT_COORDS).map((districtName, idx) => {
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
        const cat = c.category || 'General';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
        const prio = c.priority || 'MEDIUM';
        priorityBreakdown[prio] = (priorityBreakdown[prio] || 0) + 1;
        const dept = c.department || 'General';
        departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;

        const isResolved = ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status);
        if (isResolved) {
          resolvedCases++;
        } else {
          openCases++;
          if (prio === 'CRITICAL') {
            criticalCases++;
          }
        }

        if (prio === 'CRITICAL') severitySum += 10;
        else if (prio === 'HIGH') severitySum += 6;
        else if (prio === 'MEDIUM') severitySum += 3;
        else severitySum += 1;
      });

      const severityScore = totalCount > 0 ? parseFloat((severitySum / totalCount).toFixed(1)) : 0;
      const hotspotScore = openCases * 2 + criticalCases * 5;
      
      let status: HotspotData['status'] = 'GREEN';
      if (hotspotScore >= 500) {
        status = 'DARK_RED';
        criticalZones++;
      } else if (hotspotScore >= 300) {
        status = 'RED';
        criticalZones++;
      } else if (hotspotScore >= 150) {
        status = 'ORANGE';
      } else if (hotspotScore >= 50) {
        status = 'YELLOW';
      }

      const impactRadius = Math.round(12 + Math.sqrt(openCases) * 4);
      const riskScore = Math.min(100, Math.round((severityScore * 8) + (criticalCases * 3)));

      const criticalIssueNames = districtComplaints
        .filter(c => c.priority === 'CRITICAL' && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status))
        .map(c => c.title || c.category || 'Critical Alert')
        .slice(0, 3);

      return {
        id: `H-${idx + 1}`,
        name: districtName,
        coords: LOCAL_DISTRICT_COORDS[districtName],
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
        criticalIssueNames
      };
    });

    updateHeatmapState({
      lastSyncTimestamp: new Date().toISOString(),
      totalComplaintsLoaded: localMockComplaintsRef.current.length,
      hotspotsDetected: computedHotspots.filter(h => h.openCases > 0).length,
      criticalZonesCount: criticalZones,
      hotspots: computedHotspots
    });
  };

  const updateHeatmapState = (state: any) => {
    if (!state) return;
    setHotspots(state.hotspots || []);
    setLastSyncTimestamp(state.lastSyncTimestamp || '');
    setTotalComplaintsLoaded(state.totalComplaintsLoaded || 0);
    setHotspotsDetected(state.hotspotsDetected || 0);
    setCriticalZonesCount(state.criticalZonesCount || 0);
  };

  // Fetch initial live data
  const fetchLiveData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/cm/heatmap/live-data`);
      if (res.ok) {
        const val = await res.json();
        updateHeatmapState(val);
      } else {
        console.log('[Heatmap Page] Backend API returned status, falling back to local simulation...');
        await runLocalSimulation(false);
      }
    } catch (err) {
      console.warn('[Heatmap Page] Fetch live data error (backend offline?), using local simulation:', err);
      await runLocalSimulation(false);
    }
  };

  // Trigger sync API (passes force: true for manual sync)
  const triggerSync = async (isManual: boolean = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${backendUrl}/api/cm/heatmap/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: isManual })
      });
      if (res.ok) {
        const val = await res.json();
        updateHeatmapState(val);
      } else {
        await runLocalSimulation(isManual);
      }
    } catch (err) {
      console.warn('[Heatmap Page] Sync API error, performing local sync simulation:', err);
      await runLocalSimulation(isManual);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Setup Initial fetch and Socket.IO listener
  useEffect(() => {
    fetchLiveData();

    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Heatmap gateway connected');
    });

    socket.on('heatmap_update', (payload: any) => {
      console.log('[Socket.IO] Live heatmap update received:', payload);
      updateHeatmapState(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Setup Auto Sync Timer
  useEffect(() => {
    if (autoSyncTimerRef.current) {
      clearInterval(autoSyncTimerRef.current);
      autoSyncTimerRef.current = null;
    }

    if (autoSyncInterval !== 'OFF') {
      let delay = 60000; // default 1 minute
      if (autoSyncInterval === '30s') delay = 30000;
      else if (autoSyncInterval === '1m') delay = 60000;
      else if (autoSyncInterval === '5m') delay = 300000;
      else if (autoSyncInterval === '10m') delay = 600000;

      console.log(`[Heatmap Page] Enabling Auto Sync timer. Interval: ${autoSyncInterval} (${delay}ms)`);
      autoSyncTimerRef.current = setInterval(() => {
        triggerSync(false); // auto-sync runs incremental sync (force: false)
      }, delay);
    }

    return () => {
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
      }
    };
  }, [autoSyncInterval]);

  // Sort critical zones for Right Panel feed
  const criticalHotspots = [...hotspots]
    .filter(h => h.status === 'RED' || h.status === 'DARK_RED')
    .sort((a, b) => b.hotspotScore - a.hotspotScore);

  const healthyHotspots = [...hotspots]
    .filter(h => h.status === 'GREEN' || h.status === 'YELLOW')
    .sort((a, b) => a.openCases - b.openCases);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E3A8A] flex items-center">
            <MapPin className="w-7 h-7 mr-3 text-[#FF9933]" /> Live Threat & Density Map
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">Real-time geospatial intelligence of district workloads and emergency hotspots.</p>
        </div>
        
        {/* Sync Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          {/* Auto Sync Toggle */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 mr-3">Auto Sync</span>
            <select 
              value={autoSyncInterval}
              onChange={(e) => setAutoSyncInterval(e.target.value)}
              className="text-xs font-bold text-[#1E3A8A] bg-transparent outline-hidden cursor-pointer"
            >
              <option value="OFF">OFF</option>
              <option value="30s">30 Seconds</option>
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="10m">10 Minutes</option>
            </select>
          </div>

          <button 
            onClick={() => triggerSync(true)} // Manual sync performs full calculation
            disabled={isRefreshing}
            className="flex items-center justify-center px-4 py-2.5 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Data
          </button>
        </div>
      </div>

      {/* Metadata Panel (Last Sync Details) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Last Synced</span>
            <span className="text-xs font-black text-gray-800">
              {lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-3">
          <Database className="w-5 h-5 text-gray-500" />
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Complaints Loaded</span>
            <span className="text-xs font-black text-gray-800">{totalComplaintsLoaded}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FF9933]" />
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Hotspots Detected</span>
            <span className="text-xs font-black text-gray-800">{hotspotsDetected}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Critical Zones</span>
            <span className="text-xs font-black text-red-600">{criticalZonesCount}</span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative rounded-3xl flex flex-col lg:flex-row gap-6 min-h-[500px] overflow-hidden">
        
        {/* The Map */}
        <div className="flex-1 h-[450px] lg:h-full relative z-0">
          <DynamicHeatmap hotspots={hotspots} />
        </div>

        {/* Right Panel: Live Priority Feed */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full overflow-y-auto">
          
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm flex flex-col overflow-hidden max-h-[50%] shrink-0">
             <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-red-700 uppercase tracking-widest flex items-center">
                <Flame className="w-4 h-4 mr-2 animate-pulse" /> Critical Zones
              </h3>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {criticalHotspots.length > 0 ? (
                criticalHotspots.map(h => (
                  <div key={h.id} className="p-3 border border-red-100 rounded-xl bg-red-50/30">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-gray-900 text-sm">{h.name}</p>
                      <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 rounded">
                        Score: {h.hotspotScore}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                      {h.openCases} open cases. AI Risk Score is {h.riskScore}%.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-gray-400 text-center py-4 uppercase">No active critical hotspots</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-green-100 shadow-sm flex flex-col overflow-hidden max-h-[50%] shrink-0">
             <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-green-700 uppercase tracking-widest flex items-center">
                <TrendingDown className="w-4 h-4 mr-2" /> Healthy / Low Threat Zones
              </h3>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {healthyHotspots.length > 0 ? (
                healthyHotspots.map(h => (
                  <div key={h.id} className="p-3 border border-green-100 rounded-xl bg-green-50/30">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-gray-900 text-sm">{h.name}</p>
                      <span className="text-xs font-bold text-green-600">{h.openCases} cases</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-gray-400 text-center py-4 uppercase font-black">All zones active</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}