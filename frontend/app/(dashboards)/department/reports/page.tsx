"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, Download, Calendar, Filter, 
  FileText, CheckCircle2, Loader2, BarChart 
} from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
type ReportFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

interface DepartmentReport {
  id: string;
  title: string;
  type: ReportFrequency;
  period: string;
  generatedDate: string;
  totalCases: number;
  slaCompliance: number;
  fileSize: string;
}

// ==========================================
// MOCK DATA (Simulating Database Records)
// ==========================================
const MOCK_REPORTS: DepartmentReport[] = [
  { id: "REP-W42", title: "Week 42 Operations", type: "WEEKLY", period: "Oct 18 - Oct 24, 2026", generatedDate: "Oct 25, 2026", totalCases: 312, slaCompliance: 94.2, fileSize: "1.2 MB" },
  { id: "REP-W41", title: "Week 41 Operations", type: "WEEKLY", period: "Oct 11 - Oct 17, 2026", generatedDate: "Oct 18, 2026", totalCases: 285, slaCompliance: 91.5, fileSize: "1.1 MB" },
  { id: "REP-M09", title: "September Performance", type: "MONTHLY", period: "September 2026", generatedDate: "Oct 01, 2026", totalCases: 1245, slaCompliance: 92.4, fileSize: "4.5 MB" },
  { id: "REP-M08", title: "August Performance", type: "MONTHLY", period: "August 2026", generatedDate: "Sep 01, 2026", totalCases: 1102, slaCompliance: 88.9, fileSize: "4.1 MB" },
  { id: "REP-Q3", title: "Q3 Department Review", type: "QUARTERLY", period: "July - Sept 2026", generatedDate: "Oct 05, 2026", totalCases: 3560, slaCompliance: 91.0, fileSize: "12.8 MB" },
];

export default function DepartmentReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportFrequency>('MONTHLY');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter reports based on active tab
  const filteredReports = useMemo(() => {
    return MOCK_REPORTS.filter(report => report.type === activeTab);
  }, [activeTab]);

  // ==========================================
  // BACKEND INTEGRATION HANDLERS
  // ==========================================
  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    
    // API TODO: Download PDF Blob from backend
    // const res = await axios.get(`/api/reports/download/${id}`, { responseType: 'blob' });
    
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Report ${id} downloaded successfully!`);
    }, 1500);
  };

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // API TODO: POST to backend to generate custom PDF report
    setTimeout(() => {
      setIsGenerating(false);
      alert("Custom Report generated and sent to your email.");
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center">
            <FileSpreadsheet className="w-7 h-7 mr-3 text-[#FF9933]" /> Official Reports
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Access, generate, and download departmental performance archives.</p>
        </div>
      </div>

      {/* Ad-Hoc Report Generator (Saffron Themed) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="bg-linear-to-br from-[#FF9933] to-[#FF8C00] p-6 md:p-8 md:w-1/3 text-white flex flex-col justify-center relative overflow-hidden">
          <BarChart className="absolute right-0 bottom-0 w-48 h-48 text-white opacity-10 transform translate-x-1/4 translate-y-1/4" />
          <h2 className="text-xl font-black mb-2 relative z-10">Generate Custom Report</h2>
          <p className="text-white/90 text-sm relative z-10">Need data outside the standard reporting periods? Generate a custom PDF summary here.</p>
        </div>
        <form onSubmit={handleGenerateCustom} className="p-6 md:p-8 md:w-2/3 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
            <input type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50 font-medium text-gray-700" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
            <input type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50 font-medium text-gray-700" />
          </div>
          <button 
            type="submit" 
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-70 h-[50px]"
          >
            {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating...</> : 'Generate'}
          </button>
        </form>
      </div>

      {/* Standard Reports Section */}
      <div className="bg-white p-2 sm:p-4 rounded-3xl border border-gray-100 shadow-sm">
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto p-1 bg-gray-50 rounded-2xl border border-gray-100 mb-6 [&::-webkit-scrollbar]:hidden">
          {(['WEEKLY', 'MONTHLY', 'QUARTERLY'] as ReportFrequency[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-3 px-4 text-sm font-black rounded-xl transition-all capitalize ${
                activeTab === tab 
                  ? 'bg-white text-[#FF8C00] shadow-sm border border-gray-100' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.toLowerCase()} Reports
            </button>
          ))}
        </div>

        {/* Report Cards Grid */}
        <div className="p-2 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#FF9933]/30 shadow-sm hover:shadow-md transition-all p-6 flex flex-col relative group overflow-hidden"
                >
                  {/* Decorative corner block */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-[#87CEEB]/20 to-transparent rounded-bl-full z-0" />

                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#87CEEB]/10 flex items-center justify-center border border-[#87CEEB]/20 text-[#1E3A8A]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] bg-[#FF9933]/10 px-2.5 py-1 rounded-full">
                      {report.type}
                    </span>
                  </div>

                  <div className="relative z-10 mb-6 flex-1">
                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{report.title}</h3>
                    <p className="text-xs font-bold text-gray-500 flex items-center mb-4">
                      <Calendar className="w-3.5 h-3.5 mr-1" /> {report.period}
                    </p>
                    
                    <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-500">Total Cases</span>
                        <span className="font-black text-gray-900">{report.totalCases}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-500">SLA Adherence</span>
                        <span className="font-black text-[#22C55E] flex items-center">
                          {report.slaCompliance}% <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{report.fileSize} • PDF</span>
                    <button
                      onClick={() => handleDownload(report.id)}
                      disabled={downloadingId === report.id}
                      className="flex items-center justify-center px-4 py-2 bg-white border-2 border-[#FF9933] text-[#FF8C00] font-bold rounded-xl hover:bg-[#FF9933] hover:text-white transition-all disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-500 disabled:bg-gray-100"
                    >
                      {downloadingId === report.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Download className="w-4 h-4 mr-1.5" /> Download</>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredReports.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-900">No Reports Found</h3>
                <p className="text-gray-500">There are currently no generated reports for this category.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}