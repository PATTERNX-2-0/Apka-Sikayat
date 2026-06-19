"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, AlertTriangle, ShieldAlert, Bot, CloudRain, 
  ThermometerSun, Zap, Droplet, Trash2, Shield, Activity, 
  Search, Star, CheckCircle2, RefreshCw, CarFront
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';

// =========================================================================
// BACKEND-READY MOCK DATA
// =========================================================================

// 8. Prediction Engine Data
const PREDICTION_MODELS = [
  { name: 'Road Failure', risk: 85, icon: CarFront, color: '#FF9933', factor: 'Monsoon Damage' },
  { name: 'Water Leakage', risk: 72, icon: Droplet, color: '#87CEEB', factor: 'Aging Pipes' },
  { name: 'Garbage Overflow', risk: 88, icon: Trash2, color: '#EF4444', factor: 'Festival Season' },
  { name: 'Streetlight Failure', risk: 45, icon: Zap, color: '#22C55E', factor: 'Grid Stability' },
  { name: 'Public Health Risk', risk: 65, icon: Activity, color: '#F59E0B', factor: 'Dengue Season' },
];

const WEATHER_SEASONAL_RISKS = [
  { type: 'Weather Based', issue: 'Heavy Rainfall Predicted (48h)', impact: 'High Waterlogging Risk in Low-lying areas.', icon: CloudRain },
  { type: 'Seasonal Risk', issue: 'Post-Monsoon Vector Borne Disease', impact: 'Expected 30% spike in health complaints.', icon: ThermometerSun },
];

const PREVENTIVE_ACTIONS = [
  { id: 'ACT-01', action: 'Pre-deploy de-watering pumps to Minto Bridge and ITO.', impact: 'Prevents severe traffic gridlock.' },
  { id: 'ACT-02', action: 'Increase garbage collection frequency in East Delhi by 2x.', impact: 'Mitigates festive season overflow.' },
  { id: 'ACT-03', action: 'Initiate targeted fogging in South Delhi zones.', impact: 'Reduces predicted Dengue cases by 40%.' },
];

const DISTRICT_RISK_FORECAST = [
  { subject: 'East Delhi', risk: 85, fullMark: 100 },
  { subject: 'North West', risk: 78, fullMark: 100 },
  { subject: 'Shahdara', risk: 82, fullMark: 100 },
  { subject: 'South Delhi', risk: 45, fullMark: 100 },
  { subject: 'New Delhi', risk: 30, fullMark: 100 },
  { subject: 'West Delhi', risk: 65, fullMark: 100 },
];

// False Closure Detection Data
const FALSE_CLOSURES = [
  { id: 'CMP-8902', dept: 'Roads', officer: 'Vikram Singh', risk: 'High', csat: 1.2, recommendation: 'Reopen & Escalate' },
  { id: 'CMP-8814', dept: 'Water', officer: 'Anita Sharma', risk: 'Medium', csat: 2.5, recommendation: 'Request Visual Proof' },
  { id: 'CMP-8755', dept: 'Sanitation', officer: 'Rahul Dev', risk: 'High', csat: 1.0, recommendation: 'Reopen & Escalate' },
  { id: 'CMP-8622', dept: 'Electricity', officer: 'Priya M.', risk: 'Low', csat: 3.5, recommendation: 'Dismiss Flag' },
];

// Corruption Risk Data
const CORRUPTION_RISKS = [
  { officer: 'Suresh Kumar', district: 'East Delhi', score: 94, reason: 'Closed 15 cases in 2 mins. Citizen keyword "Bribe" detected 3 times.' },
  { officer: 'Amit Patel', district: 'Shahdara', score: 88, reason: 'High reopen rate (45%). Consistent 1-star ratings post-closure.' },
  { officer: 'Neha Gupta', district: 'North West', score: 76, reason: 'Geofencing mismatch: Cases closed while 12km away from site.' },
];

export default function CM_AI_InsightsPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    // API TODO: await axios.get('/api/cm/ai-insights');
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1800px] mx-auto">
      
      {/* --------------------------------------------------------- */}
      {/* HEADER */}
      {/* --------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-[#1E3A8A] flex items-center tracking-tight">
            <BrainCircuit className="w-8 h-8 mr-3 text-[#FF9933]" /> AI Insights & Prediction Engine
          </h2>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Algorithmic Auditing & Future Risk Forecasting</p>
        </div>
        <button 
          onClick={handleSync} disabled={isSyncing}
          className="flex items-center justify-center px-6 py-3 bg-linear-to-r from-[#1E3A8A] to-[#0f172a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin text-[#FF9933]' : 'text-white'}`} /> 
          {isSyncing ? 'Running ML Models...' : 'Sync AI Engine'}
        </button>
      </div>

      {/* --------------------------------------------------------- */}
      {/* TIER 1: PREDICTION ENGINE & FORECASTING */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* District Risk Radar Forecast */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-black text-[#1E3A8A] flex items-center mb-1">
            <Activity className="w-5 h-5 mr-2 text-[#87CEEB]" /> District Risk Forecast
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">7-Day Vulnerability Map</p>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={DISTRICT_RISK_FORECAST}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Risk Probability" dataKey="risk" stroke="#FF9933" strokeWidth={2} fill="#FF9933" fillOpacity={0.3} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Governance Issues */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-[#1E3A8A] flex items-center">
                <Bot className="w-5 h-5 mr-2 text-[#FF9933]" /> Infrastructure Failure Predictions
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">AI calculated probability of localized system failures</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-5">
              {PREDICTION_MODELS.map((model, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <model.icon className="w-4 h-4 mr-2" style={{ color: model.color }} />
                      <span className="font-bold text-sm text-gray-900">{model.name}</span>
                    </div>
                    <span className="text-xs font-black" style={{ color: model.color }}>{model.risk}% Risk</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${model.risk}%`, backgroundColor: model.color }}></div>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-right">Primary Factor: {model.factor}</p>
                </div>
              ))}
            </div>

            {/* Environmental Impacts & AI Actions */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#87CEEB]/10 border border-[#87CEEB]/30 p-4 rounded-2xl">
                <h4 className="text-xs font-black text-[#1E3A8A] uppercase tracking-widest mb-3 border-b border-[#87CEEB]/20 pb-2">Environmental Accelerators</h4>
                <div className="space-y-3">
                  {WEATHER_SEASONAL_RISKS.map((risk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm text-[#87CEEB] shrink-0">
                        <risk.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{risk.issue}</p>
                        <p className="text-[10px] font-medium text-gray-600 mt-0.5">{risk.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FF9933]/10 border border-[#FF9933]/30 p-4 rounded-2xl flex-1">
                <h4 className="text-xs font-black text-[#FF8C00] uppercase tracking-widest mb-3 border-b border-[#FF9933]/20 pb-2">Recommended Preventive Actions</h4>
                <div className="space-y-2">
                  {PREVENTIVE_ACTIONS.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF9933] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{action.action}</p>
                        <p className="text-[9px] font-bold text-gray-500">{action.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* TIER 2: ALGORITHMIC AUDITING PANELS */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* FALSE CLOSURE DETECTION PANEL */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-[#1E3A8A] flex items-center">
                <Search className="w-5 h-5 mr-2 text-[#87CEEB]" /> False Closure Detection
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">NLP & Logic-based Resolution Verification</p>
            </div>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
              {FALSE_CLOSURES.length} Flagged
            </span>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-4 pl-6">ID / Dept</th>
                  <th className="p-4">Officer</th>
                  <th className="p-4 text-center">CSAT</th>
                  <th className="p-4">AI Risk</th>
                  <th className="p-4 pr-6 text-right">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {FALSE_CLOSURES.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <p className="font-black text-[#1E3A8A] text-xs">{item.id}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{item.dept}</p>
                    </td>
                    <td className="p-4 font-bold text-gray-900 text-sm">{item.officer}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center text-xs font-bold bg-gray-100 rounded px-2 py-1 w-fit mx-auto">
                        <Star className="w-3 h-3 mr-1 text-[#FF9933] fill-[#FF9933]" /> {item.csat}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        item.risk === 'High' ? 'bg-red-50 text-red-600 border border-red-200' :
                        item.risk === 'Medium' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                        'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {item.risk}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase transition-colors ${
                        item.recommendation.includes('Escalate') 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}>
                        {item.recommendation}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CORRUPTION RISK PANEL */}
        <div className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-red-100 bg-red-50/30 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-red-700 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2" /> Corruption Risk Panel
              </h3>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">Behavioral anomaly & sentiment auditing</p>
            </div>
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
              Critical Alert
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {CORRUPTION_RISKS.map((risk, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-red-100 bg-white hover:shadow-md transition-shadow">
                {/* Risk Score Bubble */}
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-200 shrink-0">
                  <span className="text-xl font-black text-red-600 leading-none">{risk.score}</span>
                  <span className="text-[8px] font-black uppercase text-red-400 mt-1">Score</span>
                </div>
                
                {/* Officer Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-black text-gray-900 text-sm truncate">{risk.officer}</p>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">{risk.district}</span>
                  </div>
                  
                  <div className="mt-2 bg-red-50/50 p-2.5 rounded-lg border border-red-100 border-dashed">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-red-900 leading-tight">{risk.reason}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end gap-2">
                    <button className="text-[10px] font-black uppercase text-gray-500 hover:text-[#1E3A8A] px-2 py-1 transition-colors">View Profile</button>
                    <button className="text-[10px] font-black uppercase text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg shadow-sm transition-colors">Suspend / Investigate</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
}