"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, Download, Map, Building2, BrainCircuit, 
  LayoutDashboard, CheckCircle2, Calendar, FileText, 
  Loader2, Filter, Archive
} from 'lucide-react';

// =========================================================================
// MOCK DATA (For Generated Reports History)
// =========================================================================
const RECENT_REPORTS = [
  { id: 'REP-1042', title: 'Master Executive Summary', date: 'Today, 08:00 AM', type: 'COMBINED', size: '4.2 MB' },
  { id: 'REP-1041', title: 'AI Infrastructure Audit', date: 'Yesterday, 18:30 PM', type: 'AI_INSIGHTS', size: '1.8 MB' },
  { id: 'REP-1040', title: 'District Heatmap Snapshot', date: 'Yesterday, 09:15 AM', type: 'HEATMAP', size: '5.1 MB' },
  { id: 'REP-1039', title: 'Department Weekly Ranking', date: 'Oct 24, 2026', type: 'DEPARTMENTS', size: '2.4 MB' },
];

export default function CMReportsPage() {
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // =========================================================================
  // BACKEND INTEGRATION HANDLER
  // =========================================================================
  const handleDownload = async (type: string, name: string) => {
    setGeneratingType(type);
    
    // API TODO: This is where you connect to your Node.js backend.
    // Example: 
    // const response = await axios.post('/api/cm/reports/generate', { type, dateRange }, { responseType: 'blob' });
    // const url = window.URL.createObjectURL(new Blob([response.data]));
    // const link = document.createElement('a'); link.href = url; link.setAttribute('download', `${name}.pdf`); document.body.appendChild(link); link.click();
    
    // Simulating backend PDF generation delay
    setTimeout(() => {
      setGeneratingType(null);
      showToast(`${name} generated and downloaded successfully.`);
    }, 2000);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const REPORT_MODULES = [
    { id: 'WAR_ROOM', name: 'War Room Summary', desc: 'Pulse meter, active emergencies, and live incidents.', icon: LayoutDashboard, color: 'text-[#FF9933]', bg: 'bg-[#FF9933]/10' },
    { id: 'HEATMAP', name: 'GIS Heatmap Data', desc: 'Geospatial density and district risk distribution.', icon: Map, color: 'text-[#87CEEB]', bg: 'bg-[#87CEEB]/10' },
    { id: 'DEPARTMENTS', name: 'Department Audit', desc: 'Rankings, CSAT scores, and officer accountability.', icon: Building2, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
    { id: 'AI_INSIGHTS', name: 'AI Forecasts', desc: 'Corruption risks, false closures, and predictions.', icon: BrainCircuit, color: 'text-[#1E3A8A]', bg: 'bg-[#1E3A8A]/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-[1400px] mx-auto relative pb-12">
      
      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 bg-[#1E3A8A] text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center border border-[#87CEEB]/30"
          >
            <CheckCircle2 className="w-5 h-5 mr-2 text-[#87CEEB]" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-3xl font-black text-[#1E3A8A] tracking-tight">Executive Reports</h2>
          <p className="text-sm font-bold text-[#FF9933] uppercase tracking-widest mt-1">Export official governance data & analytics</p>
        </div>
      </div>

      {/* DATE FILTER PANEL */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center text-[#1E3A8A] font-black mr-4 shrink-0">
          <Filter className="w-5 h-5 mr-2 text-[#87CEEB]" /> Global Date Range
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Start Date</label>
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50 text-gray-700 font-bold" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">End Date</label>
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50 text-gray-700 font-bold" />
          </div>
        </div>
      </div>

      {/* MASTER COMBINED REPORT BANNER */}
      <div className="bg-linear-to-r from-[#1E3A8A] to-[#0f172a] rounded-3xl p-8 border border-[#87CEEB]/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Decorative Background Elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#87CEEB]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#FF9933]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className="bg-[#FF9933] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block shadow-sm">Highly Requested</span>
          <h3 className="text-2xl font-black text-white mb-2">Master Executive Summary</h3>
          <p className="text-[#87CEEB] text-sm font-medium max-w-xl">
            A comprehensive, compiled PDF containing the War Room snapshot, GIS Heatmap tables, full Department Rankings, and AI Forecasting predictions.
          </p>
        </div>

        <button 
          onClick={() => handleDownload('COMBINED', 'Master_Executive_Summary')}
          disabled={generatingType === 'COMBINED'}
          className="relative z-10 shrink-0 w-full md:w-auto flex items-center justify-center px-8 py-4 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-black rounded-xl shadow-lg hover:shadow-[#FF9933]/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {generatingType === 'COMBINED' ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Compiling Data...</>
          ) : (
            <><Download className="w-5 h-5 mr-2" /> Download Master PDF</>
          )}
        </button>
      </div>

      {/* MODULAR REPORT GRID */}
      <div>
        <h3 className="text-lg font-black text-[#1E3A8A] mb-4 flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2 text-[#FF9933]" /> Module Specific Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {REPORT_MODULES.map((module) => (
            <div key={module.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 hover:border-[#87CEEB]/50 transition-colors flex flex-col">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${module.bg}`}>
                <module.icon className={`w-6 h-6 ${module.color}`} />
              </div>
              <h4 className="font-black text-gray-900 text-lg mb-2">{module.name}</h4>
              <p className="text-xs text-gray-500 font-medium mb-6 flex-1">{module.desc}</p>
              
              <button 
                onClick={() => handleDownload(module.id, module.name.replace(/\s+/g, '_'))}
                disabled={generatingType === module.id}
                className="w-full py-2.5 bg-gray-50 hover:bg-[#87CEEB]/10 text-[#1E3A8A] font-black text-xs uppercase tracking-widest rounded-xl border border-gray-200 hover:border-[#87CEEB]/30 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {generatingType === module.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Export PDF</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* GENERATION HISTORY ARCHIVE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-[#1E3A8A] flex items-center">
              <Archive className="w-5 h-5 mr-2 text-[#87CEEB]" /> Generation Archive
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recently exported reports available for quick download</p>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="p-4 pl-6">Report Title</th>
                <th className="p-4">Date Generated</th>
                <th className="p-4">File Size</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-bold text-gray-900">{report.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{report.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-xs font-bold text-gray-600">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#FF9933]" /> {report.date}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-gray-500">{report.size}</span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] hover:text-[#FF8C00] transition-colors">
                      Download Again
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}