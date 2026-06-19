"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, 
  AlertTriangle, Calendar, FileDown 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

// ==========================================
// BACKEND TYPES
// ==========================================
interface AnalyticsSummary {
  avgResolutionTime: string;
  totalResolved: number;
  slaAdherence: number;
  escalationRate: number;
}

// Mock Data for Charts (To be replaced by API)
const TREND_DATA = [
  { name: 'Mon', resolved: 12, received: 15 },
  { name: 'Tue', resolved: 19, received: 18 },
  { name: 'Wed', resolved: 15, received: 22 },
  { name: 'Thu', resolved: 22, received: 20 },
  { name: 'Fri', resolved: 28, received: 25 },
  { name: 'Sat', resolved: 14, received: 10 },
  { name: 'Sun', resolved: 8, received: 12 },
];

const CATEGORY_DATA = [
  { name: 'Water', count: 45 },
  { name: 'Roads', count: 32 },
  { name: 'Electricity', count: 28 },
  { name: 'Sanitation', count: 55 },
  { name: 'Other', count: 15 },
];

export default function OfficerAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('This Week');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // API TODO: const res = await axios.get(`/api/officer/analytics?timeframe=${timeframe}`);
    // Mocking API fetch delay
    setTimeout(() => {
      setSummary({
        avgResolutionTime: "4.2 Hours",
        totalResolved: 118,
        slaAdherence: 94.5,
        escalationRate: 2.1
      });
    }, 600);
  }, [timeframe]);

  const handleExportPDF = () => {
    setIsExporting(true);
    
    // ==========================================
    // BACKEND INTEGRATION READY CODE
    // ==========================================
    /* try {
      const response = await axios.get(`/api/officer/analytics/export-pdf?timeframe=${timeframe}`, { 
        responseType: 'blob' // Crucial for receiving PDF files
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Officer_Analytics_${timeframe}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to download PDF", error);
    }
    */

    // Mock PDF generation delay
    setTimeout(() => {
      alert("Analytics Report PDF generated and downloaded successfully!");
      setIsExporting(false);
    }, 1500);
  };

  if (!summary) {
    return <div className="flex h-64 items-center justify-center text-[#1E3A8A] font-medium animate-pulse">Loading Analytics...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm z-10 relative">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A8A] flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-[#FF9933]" /> Performance Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor resolution times, team workload, and SLA compliance.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full md:w-40 pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50 text-sm appearance-none font-medium text-[#1E3A8A]"
            >
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
            </select>
          </div>
          
          {/* Changed from CSV to PDF with new icon and text */}
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center justify-center px-4 py-2.5 bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold rounded-xl hover:bg-[#1E3A8A]/20 transition-colors shrink-0 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 mr-2" /> {isExporting ? 'Generating PDF...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#87CEEB]/20 flex items-center justify-center mb-4 text-[#1E3A8A]">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Avg Resolution Time</p>
          <h3 className="text-2xl font-bold text-gray-900">{summary.avgResolutionTime}</h3>
          <p className="text-xs text-[#22C55E] mt-2 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> 12% faster than last week
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center mb-4 text-[#22C55E]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Resolved</p>
          <h3 className="text-2xl font-bold text-gray-900">{summary.totalResolved}</h3>
          <p className="text-xs text-[#22C55E] mt-2 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +24 from last week
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FF9933]/10 flex items-center justify-center mb-4 text-[#FF9933]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">SLA Adherence</p>
          <h3 className="text-2xl font-bold text-gray-900">{summary.slaAdherence}%</h3>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-[#FF9933] h-1.5 rounded-full" style={{ width: `${summary.slaAdherence}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-4 text-[#EF4444]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Escalation Rate</p>
          <h3 className="text-2xl font-bold text-gray-900">{summary.escalationRate}%</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">Cases pushed to CM level</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#1E3A8A] mb-6">Workload Trend (Received vs Resolved)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#87CEEB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="received" name="Cases Received" stroke="#87CEEB" strokeWidth={3} fillOpacity={1} fill="url(#colorReceived)" />
                <Area type="monotone" dataKey="resolved" name="Cases Resolved" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-[#1E3A8A] mb-6">Issues by Category</h3>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }} width={80} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#FF9933" radius={[0, 8, 8, 0]} barSize={24} name="Active Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </motion.div>
  );
}