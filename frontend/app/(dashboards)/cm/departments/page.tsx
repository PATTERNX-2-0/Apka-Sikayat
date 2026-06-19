"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Activity, CheckCircle2, AlertTriangle, 
  TrendingUp, Trophy, AlertOctagon, RefreshCw, BarChart3,
  Clock, Star, ShieldAlert, Users, Award, UserX, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell
} from 'recharts';

// =========================================================================
// TYPESCRIPT INTERFACES (For Backend Integration)
// =========================================================================
interface DepartmentRanking {
  id: string;
  name: string;
  efficiencyScore: number; // Out of 100
  resolutionRate: number; // %
  avgTime: string; // e.g., "2.4 Days"
  csat: number; // Citizen Satisfaction out of 5
  slaCompliance: number; // %
  escalations: number;
  pending: number;
}

interface OfficerPerformance {
  id: string;
  name: string;
  dept: string;
  avgTime: string;
  escalations: number;
  score: number;
}

// =========================================================================
// MOCK DATA 
// =========================================================================
const KPI_METRICS = {
  total: "142,854",
  open: "12,405",
  resolved: "128,910",
  critical: "1,539"
};

const CATEGORY_DATA = [
  { name: 'Water', count: 4200, color: '#87CEEB' },
  { name: 'Sanitation', count: 3800, color: '#22C55E' },
  { name: 'Roads', count: 3100, color: '#FF9933' },
  { name: 'Electricity', count: 2400, color: '#F59E0B' },
  { name: 'Safety', count: 1800, color: '#EF4444' },
];

const TREND_DATA = [
  { day: 'Mon', received: 850, resolved: 800 },
  { day: 'Tue', received: 920, resolved: 890 },
  { day: 'Wed', received: 880, resolved: 910 },
  { day: 'Thu', received: 1100, resolved: 950 },
  { day: 'Fri', received: 1050, resolved: 1020 },
  { day: 'Sat', received: 600, resolved: 700 },
  { day: 'Sun', received: 450, resolved: 500 },
];

const DEPARTMENT_RANKINGS: DepartmentRanking[] = [
  { id: "DEP-01", name: "Water Services", efficiencyScore: 92, resolutionRate: 94, avgTime: "1.2 Days", csat: 4.6, slaCompliance: 96, escalations: 12, pending: 450 },
  { id: "DEP-02", name: "Electricity Board", efficiencyScore: 88, resolutionRate: 91, avgTime: "1.5 Days", csat: 4.4, slaCompliance: 92, escalations: 24, pending: 320 },
  { id: "DEP-03", name: "Sanitation Dept", efficiencyScore: 76, resolutionRate: 82, avgTime: "3.1 Days", csat: 3.8, slaCompliance: 85, escalations: 89, pending: 1200 },
  { id: "DEP-04", name: "Public Safety", efficiencyScore: 72, resolutionRate: 78, avgTime: "2.4 Days", csat: 3.5, slaCompliance: 81, escalations: 145, pending: 890 },
  { id: "DEP-05", name: "Road Infrastructure", efficiencyScore: 58, resolutionRate: 64, avgTime: "6.5 Days", csat: 2.4, slaCompliance: 62, escalations: 312, pending: 2450 },
];

const TOP_OFFICERS: OfficerPerformance[] = [
  { id: "OFF-101", name: "Ramesh Gupta", dept: "Water Services", avgTime: "4.5 Hrs", escalations: 0, score: 98 },
  { id: "OFF-102", name: "Priya Sharma", dept: "Electricity Board", avgTime: "5.2 Hrs", escalations: 1, score: 95 },
  { id: "OFF-103", name: "Anil Kumar", dept: "Public Safety", avgTime: "6.1 Hrs", escalations: 2, score: 92 },
];

const WORST_OFFICERS: OfficerPerformance[] = [
  { id: "OFF-201", name: "Vikram Singh", dept: "Road Infrastructure", avgTime: "14.2 Days", escalations: 45, score: 34 },
  { id: "OFF-202", name: "Suresh Menon", dept: "Sanitation Dept", avgTime: "11.5 Days", escalations: 38, score: 41 },
  { id: "OFF-203", name: "Neha Verma", dept: "Water Services", avgTime: "8.4 Days", escalations: 29, score: 52 },
];

export default function CMDepartmentsPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const bestDept = DEPARTMENT_RANKINGS.reduce((prev, current) => (prev.efficiencyScore > current.efficiencyScore) ? prev : current);
  const worstDept = DEPARTMENT_RANKINGS.reduce((prev, current) => (prev.efficiencyScore < current.efficiencyScore) ? prev : current);

  const handleSync = () => {
    setIsSyncing(true);
    // API TODO: await axios.get('/api/cm/departments/overview');
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E3A8A] flex items-center">
            <Building2 className="w-7 h-7 mr-3 text-[#FF9933]" /> Department Audits
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">City-wide performance rankings & workloads</p>
        </div>
        <button 
          onClick={handleSync} disabled={isSyncing}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Data
        </button>
      </div>

      {/* COMPLAINT OVERVIEW KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#87CEEB]/10 rounded-full z-0"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Total YTD</p>
          <h3 className="text-3xl font-black text-gray-900 relative z-10">{KPI_METRICS.total}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#FF9933]/10 rounded-full z-0"></div>
          <p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-widest mb-1 relative z-10">Open Pending</p>
          <h3 className="text-3xl font-black text-[#FF9933] relative z-10">{KPI_METRICS.open}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#22C55E]/10 rounded-full z-0"></div>
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 relative z-10">Resolved</p>
          <h3 className="text-3xl font-black text-green-500 relative z-10">{KPI_METRICS.resolved}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden bg-red-50/30">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-100 rounded-full z-0"></div>
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 relative z-10">Critical Alerts</p>
          <h3 className="text-3xl font-black text-red-600 relative z-10">{KPI_METRICS.critical}</h3>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-[#1E3A8A] mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#FF9933]" /> 7-Day Resolution Trend
          </h3>
          <div className="w-full min-h-[300px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#87CEEB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold', fontSize: '12px' }} />
                <Area type="monotone" dataKey="received" name="Cases Received" stroke="#87CEEB" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                <Area type="monotone" dataKey="resolved" name="Cases Resolved" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-[#1E3A8A] mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#87CEEB]" /> Top Categories
          </h3>
          <div className="w-full min-h-[300px] h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} width={70} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* DEPARTMENT RANKINGS SECTION */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Rankings Header & Highlights */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-black text-[#1E3A8A] mb-4">Department Ranking Matrix</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Performer */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Top Performing</p>
                  <p className="font-black text-gray-900">{bestDept.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-600">{bestDept.efficiencyScore}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Efficiency</p>
              </div>
            </div>

            {/* Worst Performer */}
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Critical Attention Required</p>
                  <p className="font-black text-gray-900">{worstDept.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-rose-600">{worstDept.efficiencyScore}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Efficiency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="p-4 pl-6 whitespace-nowrap">Department Name</th>
                <th className="p-4 whitespace-nowrap">Efficiency Score</th>
                <th className="p-4 whitespace-nowrap">Resolution Rate</th>
                <th className="p-4 whitespace-nowrap">Avg Time</th>
                <th className="p-4 whitespace-nowrap">SLA Compliance</th>
                <th className="p-4 whitespace-nowrap">Citizen Sat.</th>
                <th className="p-4 whitespace-nowrap">Escalations</th>
                <th className="p-4 pr-6 whitespace-nowrap">Pending Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEPARTMENT_RANKINGS.sort((a, b) => b.efficiencyScore - a.efficiencyScore).map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-gray-900 whitespace-nowrap">{dept.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{dept.id}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-black ${
                      dept.efficiencyScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                      dept.efficiencyScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {dept.efficiencyScore}/100
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-700">{dept.resolutionRate}%</td>
                  <td className="p-4">
                    <div className="flex items-center text-sm font-bold text-gray-600">
                      <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> {dept.avgTime}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-700">{dept.slaCompliance}%</td>
                  <td className="p-4">
                    <div className="flex items-center text-sm font-bold text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-[#FF9933] fill-[#FF9933]" /> {dept.csat}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-bold ${dept.escalations > 100 ? 'text-rose-600' : 'text-gray-600'}`}>
                      {dept.escalations}
                    </span>
                  </td>
                  <td className="p-4 pr-6 font-black text-[#1E3A8A]">{dept.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICER ACCOUNTABILITY SECTION */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-[#1E3A8A] flex items-center">
              <Users className="w-6 h-6 mr-3 text-[#FF9933]" /> Officer Accountability
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Top Performers vs. Critical Attention Needed
            </p>
          </div>
          <button className="text-xs font-bold text-[#1E3A8A] bg-[#87CEEB]/20 px-4 py-2 rounded-xl hover:bg-[#87CEEB]/30 transition-colors flex items-center">
            Full Officer Directory <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Top Performers */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
            <h4 className="flex items-center text-sm font-black text-emerald-600 uppercase tracking-widest mb-6 border-b border-gray-50 pb-3">
              <Award className="w-5 h-5 mr-2" /> Top Officers
            </h4>
            <div className="space-y-4">
              {TOP_OFFICERS.map((officer) => (
                <div key={officer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-emerald-50/30 hover:border-emerald-200 hover:shadow-sm transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <span className="font-black text-lg">{officer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{officer.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{officer.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="text-center sm:text-right">
                      <p className="text-xs font-bold text-gray-700 flex items-center justify-center sm:justify-end">
                        <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" /> {officer.avgTime}
                      </p>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Resolution</p>
                    </div>
                    <div className="text-center sm:text-right border-l border-gray-200 pl-4">
                      <p className="text-xs font-bold text-gray-700">{officer.escalations}</p>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Escalations</p>
                    </div>
                    <div className="text-center sm:text-right border-l border-gray-200 pl-4">
                      <p className="text-lg font-black text-emerald-600">{officer.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Worst Performers */}
          <div className="p-6">
            <h4 className="flex items-center text-sm font-black text-rose-600 uppercase tracking-widest mb-6 border-b border-gray-50 pb-3">
              <UserX className="w-5 h-5 mr-2" /> Worst Performing
            </h4>
            <div className="space-y-4">
              {WORST_OFFICERS.map((officer) => (
                <div key={officer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-rose-50/30 hover:border-rose-200 hover:shadow-sm transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 border border-rose-200">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{officer.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{officer.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="text-center sm:text-right">
                      <p className="text-xs font-bold text-rose-600 flex items-center justify-center sm:justify-end">
                        <Clock className="w-3.5 h-3.5 mr-1 text-rose-400" /> {officer.avgTime}
                      </p>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Resolution</p>
                    </div>
                    <div className="text-center sm:text-right border-l border-gray-200 pl-4">
                      <p className="text-xs font-bold text-rose-600">{officer.escalations}</p>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Escalations</p>
                    </div>
                    <div className="text-center sm:text-right border-l border-gray-200 pl-4">
                      <p className="text-lg font-black text-rose-600">{officer.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}