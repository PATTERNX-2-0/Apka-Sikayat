"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Download, Map, TrendingUp, 
  Clock, CheckCircle2, Users, Award 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';

// ==========================================
// MOCK DATA (To be replaced by Backend API)
// ==========================================
const DISTRICT_DATA = [
  { name: 'South', pending: 45, resolved: 120 },
  { name: 'West', pending: 85, resolved: 210 },
  { name: 'Central', pending: 20, resolved: 88 },
  { name: 'East', pending: 110, resolved: 150 },
  { name: 'North', pending: 35, resolved: 95 },
];

const PERFORMANCE_DATA = [
  { month: 'Jan', slaCompliance: 88, avgDays: 4.2 },
  { month: 'Feb', slaCompliance: 92, avgDays: 3.8 },
  { month: 'Mar', slaCompliance: 94, avgDays: 3.1 },
  { month: 'Apr', slaCompliance: 90, avgDays: 3.5 },
  { month: 'May', slaCompliance: 96, avgDays: 2.8 },
];

const OFFICER_PERFORMANCE = [
  { name: 'Rajeev K.', resolved: 145, slaSuccess: 98 },
  { name: 'Anita S.', resolved: 132, slaSuccess: 95 },
  { name: 'Priya D.', resolved: 110, slaSuccess: 92 },
  { name: 'Vikram S.', resolved: 98, slaSuccess: 88 },
  { name: 'Amit P.', resolved: 85, slaSuccess: 85 },
];

export default function DepartmentAnalyticsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [kpiMetrics, setKpiMetrics] = useState<any>(null);

  useEffect(() => {
    // API TODO: await axios.get('/api/department/analytics/kpi');
    setTimeout(() => {
      setKpiMetrics({
        avgResolution: "3.2 Days",
        totalResolved: 1245,
        slaAdherence: 92.4,
        activeOfficers: 45
      });
    }, 500);
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    // API TODO: Download PDF Blob from backend
    setTimeout(() => {
      alert("Monthly Report PDF Generated!");
      setIsExporting(false);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm z-10 relative">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-[#FF9933]" /> Analytics & Reports
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Deep dive into departmental performance, officer efficiency, and district load.</p>
        </div>

        <button 
          onClick={handleExport} disabled={isExporting}
          className="flex items-center px-6 py-2.5 bg-[#FF9933]/10 text-[#FF8C00] font-bold rounded-xl hover:bg-[#FF9933]/20 transition-colors disabled:opacity-50 border border-[#FF9933]/20"
        >
          <Download className="w-4 h-4 mr-2" /> {isExporting ? 'Generating...' : 'Export PDF Report'}
        </button>
      </div>

      {/* DEPARTMENT PERFORMANCE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#87CEEB]/20 flex items-center justify-center mb-4 text-[#1E3A8A]">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Avg Resolution Time</p>
          <h3 className="text-2xl font-bold text-gray-900">{kpiMetrics?.avgResolution || "..."}</h3>
          <p className="text-xs text-[#22C55E] mt-2 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> 15% faster this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center mb-4 text-[#22C55E]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Resolved</p>
          <h3 className="text-2xl font-bold text-gray-900">{kpiMetrics?.totalResolved || "..."}</h3>
          <p className="text-xs text-[#22C55E] mt-2 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +124 from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FF9933]/10 flex items-center justify-center mb-4 text-[#FF9933]">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">SLA Adherence</p>
          <h3 className="text-2xl font-bold text-gray-900">{kpiMetrics?.slaAdherence || "..."}%</h3>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-[#FF9933] h-1.5 rounded-full" style={{ width: `${kpiMetrics?.slaAdherence || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center mb-4 text-[#1E3A8A]">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Active Officers</p>
          <h3 className="text-2xl font-bold text-gray-900">{kpiMetrics?.activeOfficers || "..."}</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">Currently deployed</p>
        </div>
      </div>

      {/* CHARTS GRID 1: DISTRICT & SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District Load Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center">
            <Map className="w-5 h-5 mr-2 text-[#87CEEB]" /> District Comparison
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                <Bar dataKey="pending" name="Pending Cases" fill="#FF9933" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved Cases" fill="#87CEEB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center">
             <TrendingUp className="w-5 h-5 mr-2 text-[#22C55E]" /> Department Performance Trend
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="slaCompliance" name="SLA Success %" stroke="#22C55E" strokeWidth={4} dot={{ r: 6, fill: '#22C55E', strokeWidth: 0 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CHARTS GRID 2: OFFICER PERFORMANCE */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center">
          <Award className="w-5 h-5 mr-2 text-[#FF9933]" /> Top Officer Performance
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={OFFICER_PERFORMANCE} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} width={80} />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold' }} />
              <Bar dataKey="resolved" name="Cases Resolved" fill="#87CEEB" radius={[0, 8, 8, 0]} barSize={24} />
              <Bar dataKey="slaSuccess" name="SLA Success %" fill="#FF9933" radius={[0, 8, 8, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </motion.div>
  );
}