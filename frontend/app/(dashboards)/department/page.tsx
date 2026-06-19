"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Added Link import
import { motion } from 'framer-motion';
import { 
  FileText, Activity, CheckCircle2, ShieldCheck, 
  Users, PieChart as PieChartIcon, TrendingUp 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// ==========================================
// MOCK DATA FOR CHARTS
// ==========================================
const STATUS_DATA = [
  { name: 'Resolved', value: 933, color: '#22C55E' },  // Green
  { name: 'Active', value: 312, color: '#87CEEB' },    // Sky Blue
  { name: 'Escalated', value: 45, color: '#EF4444' },  // Red
];

const WEEKLY_TREND = [
  { day: 'Mon', received: 140, resolved: 120 },
  { day: 'Tue', received: 150, resolved: 145 },
  { day: 'Wed', received: 120, resolved: 130 },
  { day: 'Thu', received: 180, resolved: 160 },
  { day: 'Fri', received: 160, resolved: 175 },
  { day: 'Sat', received: 90, resolved: 110 },
  { day: 'Sun', received: 80, resolved: 93 },
];

export default function DeptDashboardOverview() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // API TODO: await axios.get('/api/department/metrics')
    setTimeout(() => {
      setMetrics({ total: 1245, active: 312, resolved: 933, sla: 92.4, activeOfficers: 45 });
    }, 500);
  }, []);

  if (!metrics) return <div className="flex h-64 items-center justify-center text-[#FF9933] font-bold animate-pulse">Loading Department Data...</div>;

  const CARDS = [
    { title: "Total Complaints", value: metrics.total, icon: FileText, color: "text-gray-700", bg: "bg-gray-100" },
    { title: "Active Complaints", value: metrics.active, icon: Activity, color: "text-[#1E3A8A]", bg: "bg-[#87CEEB]/20" },
    { title: "Resolved Cases", value: metrics.resolved, icon: CheckCircle2, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { title: "Department SLA", value: `${metrics.sla}%`, icon: ShieldCheck, color: "text-[#FF9933]", bg: "bg-[#FF9933]/10" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Department Overview</h2>
        <p className="text-sm font-medium text-gray-500 mt-1">Water Supply Department • Real-time status.</p>
      </div>

      {/* SAFFRON HIGHLIGHT BANNER */}
      <div className="bg-linear-to-r from-[#FF9933] to-[#FF8C00] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-[#FF9933]/20 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold flex items-center mb-2"><Users className="w-6 h-6 mr-2" /> Officer Force Active</h3>
          <p className="text-white/90 text-sm">You have {metrics.activeOfficers} field officers currently on duty and resolving assigned cases across all districts.</p>
        </div>
        
        {/* FIXED: Replaced <button> with <Link> to route to the officers page */}
        <Link 
          href="/department/officers"
          className="shrink-0 px-6 py-3 bg-white text-[#FF8C00] font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-center"
        >
          Manage Officers
        </Link>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {CARDS.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#FF9933]/30 transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="text-3xl font-black text-gray-900">{card.value}</h3>
              <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DONUT CHART: Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-[#87CEEB]" /> Case Distribution
          </h3>
          <div className="flex-1 h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-2xl font-black text-gray-900">{metrics.total}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
        </div>

        {/* AREA CHART: Weekly Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#FF9933]" /> 7-Day Resolution Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9933" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF9933" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold', fontSize: '12px' }} />
                <Area type="monotone" dataKey="received" name="Cases Received" stroke="#FF9933" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                <Area type="monotone" dataKey="resolved" name="Cases Resolved" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </motion.div>
  );
}