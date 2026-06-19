"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Filter, Flame, TrendingDown, RefreshCw } from 'lucide-react';

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

  // ==========================================
  // BACKEND INTEGRATION HANDLER
  // ==========================================
  const refreshData = () => {
    setIsRefreshing(true);
    // API TODO: await axios.get('/api/cm/heatmap/live-data');
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E3A8A] flex items-center">
            <MapPin className="w-7 h-7 mr-3 text-[#FF9933]" /> Live Threat & Density Map
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">Real-time geospatial intelligence of district workloads and emergency hotspots.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </button>
          <button 
            onClick={refreshData}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Data
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative rounded-3xl flex flex-col lg:flex-row gap-6 min-h-[500px]">
        
        {/* The Map */}
        <div className="flex-1 h-[400px] lg:h-full relative z-0">
          <DynamicHeatmap />
          
          {/* Floating Map Legend (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-[10] bg-white/95 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-lg pointer-events-none hidden sm:block">
            <p className="text-gray-900 text-[10px] font-black uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Density Legend</p>
            <div className="space-y-2.5">
              <div className="flex items-center text-xs text-gray-700 font-bold"><span className="w-4 h-4 rounded-full bg-[#EF4444]/60 border-2 border-[#EF4444] mr-3"></span> Critical (&gt;500 Cases)</div>
              <div className="flex items-center text-xs text-gray-700 font-bold"><span className="w-4 h-4 rounded-full bg-[#FF8C00]/60 border-2 border-[#FF9933] mr-3"></span> High (&gt;200 Cases)</div>
              <div className="flex items-center text-xs text-gray-700 font-bold"><span className="w-4 h-4 rounded-full bg-[#22C55E]/60 border-2 border-[#22C55E] mr-3"></span> Healthy Level</div>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Priority Feed */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full">
          
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm flex flex-col overflow-hidden h-1/2">
             <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-red-700 uppercase tracking-widest flex items-center">
                <Flame className="w-4 h-4 mr-2" /> Critical Zones
              </h3>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
               {/* Hardcoded for demo, would map from state in reality */}
               <div className="p-3 border border-red-100 rounded-xl bg-red-50/30">
                 <div className="flex justify-between items-center mb-1">
                   <p className="font-bold text-gray-900 text-sm">North East Delhi</p>
                   <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 rounded">890</span>
                 </div>
                 <p className="text-xs font-medium text-gray-500">Requires immediate resource diversion.</p>
               </div>
               <div className="p-3 border border-red-100 rounded-xl bg-red-50/30">
                 <div className="flex justify-between items-center mb-1">
                   <p className="font-bold text-gray-900 text-sm">Shahdara</p>
                   <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 rounded">560</span>
                 </div>
                 <p className="text-xs font-medium text-gray-500">Sanitation infrastructure overloaded.</p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-green-100 shadow-sm flex flex-col overflow-hidden h-1/2">
             <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-green-700 uppercase tracking-widest flex items-center">
                <TrendingDown className="w-4 h-4 mr-2" /> Improving Zones
              </h3>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
               <div className="p-3 border border-green-100 rounded-xl bg-green-50/30">
                 <div className="flex justify-between items-center mb-1">
                   <p className="font-bold text-gray-900 text-sm">New Delhi</p>
                   <span className="text-xs font-bold text-green-600">-14% vs Last Week</span>
                 </div>
               </div>
               <div className="p-3 border border-green-100 rounded-xl bg-green-50/30">
                 <div className="flex justify-between items-center mb-1">
                   <p className="font-bold text-gray-900 text-sm">South Delhi</p>
                   <span className="text-xs font-bold text-green-600">-8% vs Last Week</span>
                 </div>
               </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}