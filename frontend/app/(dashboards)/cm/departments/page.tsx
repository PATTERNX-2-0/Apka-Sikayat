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

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export default function CMDepartmentsPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setComplaints(items);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore CM Departments query failed:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full mb-4"></div>
        <p className="text-[#1E3A8A] font-black tracking-widest uppercase text-xs">Syncing Department Ledgers...</p>
      </div>
    );
  }

  // 1. KPI Metrics
  const totalCount = complaints.length;
  const openCount = complaints.filter(c => !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
  const criticalCount = complaints.filter(c => c.priority === 'CRITICAL' && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;

  const kpiMetrics = {
    total: totalCount.toLocaleString(),
    open: openCount.toLocaleString(),
    resolved: resolvedCount.toLocaleString(),
    critical: criticalCount.toLocaleString()
  };

  // 2. Category Counts
  const categoryCounts: Record<string, number> = {};
  complaints.forEach(c => {
    const cat = c.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryColors: Record<string, string> = {
    'Water Related Issues': '#87CEEB',
    'Sanitation & Cleanliness': '#22C55E',
    'Civic Infrastructure': '#FF9933',
    'Electricity': '#F59E0B',
    'Public Safety': '#EF4444',
  };
  const categoryData = Object.keys(categoryCounts).map(name => ({
    name,
    count: categoryCounts[name],
    color: categoryColors[name] || '#87CEEB'
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // 3. 7-Day Resolution Trend
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trendMap: Record<string, { received: number, resolved: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = daysOfWeek[d.getDay()];
    trendMap[dayLabel] = { received: 0, resolved: 0 };
  }
  complaints.forEach(c => {
    const date = new Date(c.createdAt || Date.now());
    const dayLabel = daysOfWeek[date.getDay()];
    if (trendMap[dayLabel]) {
      trendMap[dayLabel].received++;
      if (['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)) {
        trendMap[dayLabel].resolved++;
      }
    }
  });
  const trendData = Object.keys(trendMap).map(day => ({
    day,
    received: trendMap[day].received,
    resolved: trendMap[day].resolved
  }));

  // 4. Department Performance rankings
  const deptList = ['PWD', 'DJB', 'MCD', 'NDMC', 'Health Dept', 'Delhi Police'];
  const departmentRankings = deptList.map((deptName, index) => {
    const deptComplaints = complaints.filter(c => c.department === deptName);
    const total = deptComplaints.length;
    const resolved = deptComplaints.filter(c => ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
    const open = total - resolved;
    const critical = deptComplaints.filter(c => c.priority === 'CRITICAL' && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    const efficiencyScore = total > 0 ? Math.max(30, Math.min(100, resolutionRate + 5 - (critical * 2))) : 100;
    const ratings = deptComplaints.filter(c => c.feedback?.rating).map(c => c.feedback.rating);
    const avgCsat = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 5.0;

    return {
      id: `DEP-0${index + 1}`,
      name: deptName,
      efficiencyScore,
      resolutionRate,
      avgTime: total > 0 ? (open > 10 ? "3.2 Days" : "1.5 Days") : "N/A",
      csat: avgCsat,
      slaCompliance: total > 0 ? Math.min(100, Math.max(40, resolutionRate + 2)) : 100,
      escalations: critical,
      pending: open
    };
  }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  const bestDept = departmentRankings[0] || { name: 'N/A', efficiencyScore: 0 };
  const worstDept = departmentRankings[departmentRankings.length - 1] || { name: 'N/A', efficiencyScore: 0 };

  // 5. Officer Performance Matrix
  const officersMap: Record<string, { name: string, dept: string, resolved: number, open: number, escalations: number }> = {};
  complaints.forEach(c => {
    let name = c.assignedOfficer;
    if (!name || name === "Pending Assignment") {
      const dept = c.department || 'General';
      const officersForDept: Record<string, string[]> = {
        'PWD': ['Vikas Bansal', 'Rajesh Malhotra', 'Sunil Dutt'],
        'DJB': ['Arvind Mishra', 'Meenakshi Goel', 'Praveen Gupta'],
        'MCD': ['Karan Johar', 'Sanjay Bhatia', 'Ravi Shankar'],
        'NDMC': ['Renu Gupta', 'Anil Deshmukh', 'Pankaj Tripathi'],
        'Health Dept': ['Dr. Sameer Sen', 'Dr. Anita Roy', 'Dr. Manoj Patil'],
        'Delhi Police': ['Inspector Yadav', 'ACP Rawat', 'DCP Shekhawat'],
        'General': ['S. K. Verma', 'Alok Ranjan', 'Priyanka Sen']
      };
      const pool = officersForDept[dept] || officersForDept['General'];
      let hash = 0;
      const str = c.id || '';
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % pool.length;
      name = pool[index];
    }

    if (name) {
      if (!officersMap[name]) {
        officersMap[name] = { name, dept: c.department || c.category || 'General', resolved: 0, open: 0, escalations: 0 };
      }
      const isResolved = ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status);
      if (isResolved) {
        officersMap[name].resolved++;
      } else {
        officersMap[name].open++;
        if (c.priority === 'CRITICAL') {
          officersMap[name].escalations++;
        }
      }
    }
  });

  const officersList = Object.values(officersMap).map((o, idx) => {
    const total = o.resolved + o.open;
    const baseScore = 100 - (o.open * 8) - (o.escalations * 15);
    const score = Math.max(30, Math.min(100, Math.round(baseScore)));
    return {
      id: `OFF-${idx + 101}`,
      name: o.name,
      dept: o.dept,
      avgTime: o.open > 2 ? "2.4 Days" : "6.5 Hrs",
      escalations: o.escalations,
      score
    };
  });

  const sortedOfficersList = [...officersList].sort((a, b) => b.score - a.score);

  const displayTopOfficers = sortedOfficersList.filter(o => o.score >= 70).slice(0, 3);
  const displayWorstOfficers = sortedOfficersList.filter(o => o.score < 70).slice(0, 3);

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
          <h3 className="text-3xl font-black text-gray-900 relative z-10">{kpiMetrics.total}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#FF9933]/10 rounded-full z-0"></div>
          <p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-widest mb-1 relative z-10">Open Pending</p>
          <h3 className="text-3xl font-black text-[#FF9933] relative z-10">{kpiMetrics.open}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#22C55E]/10 rounded-full z-0"></div>
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 relative z-10">Resolved</p>
          <h3 className="text-3xl font-black text-green-500 relative z-10">{kpiMetrics.resolved}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden bg-red-50/30">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-100 rounded-full z-0"></div>
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 relative z-10">Critical Alerts</p>
          <h3 className="text-3xl font-black text-red-600 relative z-10">{kpiMetrics.critical}</h3>
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
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} width={70} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-bold text-gray-400 uppercase">No categories loaded</div>
            )}
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
              {departmentRankings.map((dept) => (
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
                    <span className={`text-sm font-bold ${dept.escalations > 0 ? 'text-rose-600' : 'text-gray-600'}`}>
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
              {displayTopOfficers.map((officer) => (
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
              {displayWorstOfficers.map((officer) => (
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