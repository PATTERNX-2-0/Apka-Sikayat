"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// FIXED: Added Star and MapPin. Removed Facebook and Twitter.
import { 
  HeartPulse, AlertTriangle, Trophy, Radio, MessageSquare, 
  Flame, Waves, Zap, Droplet, Wind, Stethoscope, ShieldAlert,
  Bot, TrendingUp, AlertOctagon, CheckCircle2, Star, MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// =========================================================================
// BACKEND-READY MOCK DATA
// =========================================================================

const PULSE_DATA = [
  { name: 'Overall Delhi', score: 78, icon: HeartPulse, color: '#FF9933', trend: '+2.1' },
  { name: 'Roads', score: 64, icon: TrendingUp, color: '#1E3A8A', trend: '-1.2' },
  { name: 'Water', score: 82, icon: Droplet, color: '#87CEEB', trend: '+4.5' },
  { name: 'Electricity', score: 91, icon: Zap, color: '#22C55E', trend: '+0.8' },
  { name: 'Sanitation', score: 71, icon: Wind, color: '#F59E0B', trend: '-3.4' },
  { name: 'Healthcare', score: 88, icon: Stethoscope, color: '#87CEEB', trend: '+1.1' },
  { name: 'Public Safety', score: 76, icon: ShieldAlert, color: '#1E3A8A', trend: '+2.4' },
  { name: 'Environment', score: 62, icon: Waves, color: '#EF4444', trend: '-4.2' },
];

const EMERGENCY_ALERTS = [
  { id: 'EMG-1', type: 'Severe Waterlogging', loc: 'Minto Bridge', time: 'Just Now', icon: Waves, severity: 'Critical' },
  { id: 'EMG-2', type: 'Fire Incident', loc: 'Bawana Industrial', time: '4m ago', icon: Flame, severity: 'High' },
  { id: 'EMG-3', type: 'Building Collapse', loc: 'Old Delhi', time: '12m ago', icon: AlertOctagon, severity: 'Critical' },
  { id: 'EMG-4', type: 'Gas Leakage', loc: 'Okhla Phase 2', time: '18m ago', icon: Wind, severity: 'High' },
  { id: 'EMG-5', type: 'Open Electric Wire', loc: 'Laxmi Nagar', time: '22m ago', icon: Zap, severity: 'Medium' },
];

const DISTRICT_RANKINGS = [
  { id: 1, name: 'New Delhi', score: 92, open: 145, critical: 2, csat: 4.8, heatIndex: 24, risk: 12 },
  { id: 2, name: 'South Delhi', score: 88, open: 320, critical: 5, csat: 4.5, heatIndex: 35, risk: 18 },
  { id: 3, name: 'East Delhi', score: 76, open: 890, critical: 18, csat: 3.8, heatIndex: 68, risk: 45 },
  { id: 4, name: 'North West', score: 68, open: 1120, critical: 42, csat: 3.1, heatIndex: 82, risk: 76 },
  { id: 5, name: 'Shahdara', score: 54, open: 1450, critical: 65, csat: 2.4, heatIndex: 94, risk: 88 },
];

const LIVE_INCIDENT_FEED = [
  { type: 'Life Threatening', title: 'Sewer Line Cave-in', loc: 'Rohini Sector 16', time: '1m ago', tag: 'bg-red-100 text-red-700 border-red-200' },
  { type: 'AI Detected', title: 'Emerging Pothole Cluster', loc: 'Outer Ring Road', time: '2m ago', tag: 'bg-purple-100 text-purple-700 border-purple-200' },
  { type: 'Social Media', title: 'Viral Twitter Video: Water Issue', loc: 'Dwarka', time: '5m ago', tag: 'bg-[#87CEEB]/20 text-[#1E3A8A] border-[#87CEEB]/30' },
  { type: 'Escalation', title: 'CM Intervention Requested', loc: 'Vasant Kunj', time: '8m ago', tag: 'bg-[#FF9933]/20 text-[#FF8C00] border-[#FF9933]/30' },
  { type: 'Closure', title: 'Major Power Restored', loc: 'Najafgarh', time: '10m ago', tag: 'bg-green-100 text-green-700 border-green-200' },
  { type: 'New Complaint', title: 'Streetlight Outage', loc: 'Karol Bagh', time: '12m ago', tag: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const CSAT_SENTIMENT = [
  { name: 'Positive Feedback', value: 65, color: '#22C55E' },
  { name: 'Neutral Inquiry', value: 20, color: '#87CEEB' },
  { name: 'Negative Escalation', value: 15, color: '#EF4444' },
];

const CSAT_TREND = [
  { month: 'Jan', index: 68 }, { month: 'Feb', index: 72 }, { month: 'Mar', index: 71 },
  { month: 'Apr', index: 75 }, { month: 'May', index: 78 }, { month: 'Jun', index: 82 },
];

export default function CMWarRoomDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // API TODO: await axios.get('/api/cm/war-room-data')
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full mb-4"></div>
        <p className="text-[#1E3A8A] font-black tracking-widest uppercase text-xs">Syncing City Grid...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* --------------------------------------------------------- */}
      {/* HEADER */}
      {/* --------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-3xl font-black text-[#1E3A8A] tracking-tight">Governance War Room</h2>
          <p className="text-sm font-bold text-[#FF9933] uppercase tracking-widest mt-1">Real-Time City Command Center</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl">
          <span className="flex h-3 w-3 mr-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-black text-gray-700 tracking-wider uppercase">Live State Synced</span>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* ROW 1: PULSE METER & EMERGENCY ALERTS */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 10. GOVERNANCE PULSE METER */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-[#1E3A8A] flex items-center">
                <HeartPulse className="w-5 h-5 mr-2 text-[#FF9933]" /> Governance Pulse Meter
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Quick Service Quality Indicators</p>
            </div>
            <button className="text-[10px] font-black text-[#1E3A8A] bg-[#87CEEB]/10 px-3 py-1.5 rounded-lg hover:bg-[#87CEEB]/20 transition-colors uppercase">
              View Historical Trend
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PULSE_DATA.map((pulse, i) => {
              const isOverall = pulse.name === 'Overall Delhi';
              return (
                <div key={i} className={`p-4 rounded-2xl border transition-colors ${isOverall ? 'bg-linear-to-br from-[#1E3A8A] to-[#0f172a] text-white border-transparent shadow-md' : 'bg-gray-50 border-gray-100 hover:border-[#FF9933]/30'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <pulse.icon className={`w-6 h-6 ${isOverall ? 'text-[#FF9933]' : ''}`} style={{ color: !isOverall ? pulse.color : undefined }} />
                    <div className="text-right">
                      <span className={`text-2xl font-black ${isOverall ? 'text-white' : 'text-gray-900'}`}>{pulse.score}</span>
                      <p className={`text-[10px] font-bold ${pulse.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{pulse.trend}%</p>
                    </div>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-wider mt-2 ${isOverall ? 'text-blue-200' : 'text-gray-500'}`}>{pulse.name}</p>
                  <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isOverall ? 'bg-white/20' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full" style={{ width: `${pulse.score}%`, backgroundColor: isOverall ? '#FF9933' : pulse.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 11. EMERGENCY ALERTS CENTER */}
        <div className="bg-red-50/80 rounded-3xl border border-red-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-5 bg-red-600 flex justify-between items-center text-white border-b border-red-700">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center shadow-red-900 drop-shadow-sm">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-200" /> Emergency Center
              </h3>
            </div>
            <span className="bg-white text-red-600 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">{EMERGENCY_ALERTS.length} Active</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {EMERGENCY_ALERTS.map((alert, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <alert.icon className="w-12 h-12 text-red-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-black text-red-700 uppercase tracking-wider">{alert.type}</p>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{alert.time}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{alert.loc}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">{alert.severity} Priority</span>
                    <button className="text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors uppercase">Escalate</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* ROW 2: DISTRICT RANKING & LIVE FEED */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 4. DISTRICT RANKING LEADERBOARD */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-black text-[#1E3A8A] flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-[#FF9933]" /> District Performance Matrix
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Compare governance performance & infrastructure risk</p>
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-4 pl-6">District</th>
                  <th className="p-4">Gov Score</th>
                  <th className="p-4">Open Cases</th>
                  <th className="p-4">Critical</th>
                  <th className="p-4">CSAT</th>
                  <th className="p-4">Infra Risk</th>
                  <th className="p-4 pr-6">Heat Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DISTRICT_RANKINGS.map((dist, i) => (
                  <tr key={dist.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-[#FF9933] text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                      <span className="font-bold text-gray-900 whitespace-nowrap">{dist.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-black ${dist.score >= 80 ? 'text-green-600 bg-green-50' : dist.score >= 60 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'}`}>{dist.score}/100</span>
                    </td>
                    <td className="p-4 font-bold text-gray-700">{dist.open}</td>
                    <td className="p-4 font-black text-red-600">{dist.critical}</td>
                    <td className="p-4">
                      <div className="flex items-center text-xs font-bold text-gray-700">
                        <Star className="w-3.5 h-3.5 mr-1 text-[#FF9933] fill-[#FF9933]" /> {dist.csat}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${dist.risk}%` }}></div>
                      </div>
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${dist.heatIndex > 80 ? 'bg-red-50 text-red-700 border-red-200' : dist.heatIndex > 50 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {dist.heatIndex} Heat
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. LIVE INCIDENT FEED */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[400px] xl:h-auto overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-black text-[#1E3A8A] flex items-center">
                <Radio className="w-5 h-5 mr-2 text-[#87CEEB]" /> Live Incident Feed
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time city event streams</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
            {LIVE_INCIDENT_FEED.map((feed, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${i === 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  {i !== LIVE_INCIDENT_FEED.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-1 group-hover:bg-gray-200 transition-colors"></div>}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${feed.tag}`}>{feed.type}</span>
                    <span className="text-[10px] font-bold text-gray-400">{feed.time}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1.5">{feed.title}</p>
                  <p className="text-xs font-medium text-gray-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" /> {feed.loc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --------------------------------------------------------- */}
      {/* ROW 3: CITIZEN SATISFACTION SCORE (CSAT) */}
      {/* --------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-[#1E3A8A] flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-[#FF9933]" /> Citizen Satisfaction & Sentiment
            </h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Public sentiment analysis & trust index</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">City Trust Index</p>
            <p className="text-3xl font-black text-[#22C55E]">4.2<span className="text-sm text-gray-400">/5.0</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sentiment Breakdown Pie */}
          <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-0 lg:pr-8">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 w-full text-left">Feedback Sentiment Analysis</p>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CSAT_SENTIMENT} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {CSAT_SENTIMENT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-900">85%</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Approval</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {CSAT_SENTIMENT.map((s, i) => (
                <div key={i} className="flex items-center text-[10px] font-bold text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: s.color }}></span>
                  {s.value}%
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend Area Chart */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-full text-left">Trust Index Historical Trend</p>
              <div className="flex gap-2">
                <button className="text-[10px] font-bold text-white bg-[#1E3A8A] px-2 py-1 rounded">Monthly</button>
                <button className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Quarterly</button>
              </div>
            </div>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CSAT_TREND} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#87CEEB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="index" name="Trust Index" stroke="#87CEEB" strokeWidth={3} fillOpacity={1} fill="url(#colorTrust)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );
}