"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, Clock, MapPin, Phone, 
  ChevronRight, ShieldAlert, Timer, PhoneCall 
} from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
type SLAStatus = 'OVERDUE' | 'IMMINENT' | 'ESCALATED';

interface CriticalComplaint {
  id: string;
  title: string;
  category: string;
  location: string;
  citizenPhone: string;
  slaStatus: SLAStatus;
  timeDetails: string;
  assignedTime: string;
}

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_CRITICAL: CriticalComplaint[] = [
  {
    id: "CMP-1039",
    title: "Traffic light malfunction at major intersection",
    category: "Roads & Traffic",
    location: "Hauz Khas Intersection",
    citizenPhone: "+91 9876511111",
    slaStatus: "OVERDUE",
    timeDetails: "Overdue by 3h 45m",
    assignedTime: "Oct 24, 09:00 AM"
  },
  {
    id: "CMP-1042",
    title: "Severe waterlogging entering residential homes",
    category: "Water Supply",
    location: "Sector 4, Dwarka",
    citizenPhone: "+91 9876522222",
    slaStatus: "IMMINENT",
    timeDetails: "1h 15m remaining",
    assignedTime: "Today, 08:30 AM"
  },
  {
    id: "CMP-1011",
    title: "Open high-tension live wire on street",
    category: "Electricity",
    location: "Block B, Lajpat Nagar",
    citizenPhone: "+91 9876533333",
    slaStatus: "ESCALATED",
    timeDetails: "CM Office Flagged",
    assignedTime: "Yesterday, 02:00 PM"
  }
];

export default function CriticalComplaintsPage() {
  const [data, setData] = useState<CriticalComplaint[]>(MOCK_CRITICAL);
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'IMMINENT'>('ALL');

  const filteredData = useMemo(() => {
    if (filter === 'ALL') return data;
    return data.filter(item => item.slaStatus === filter);
  }, [data, filter]);

  // UI Configuration based on severity
  const getSeverityConfig = (status: SLAStatus) => {
    switch (status) {
      case 'OVERDUE': 
        return { 
          badge: 'bg-[#EF4444]', text: 'text-white', border: 'border-[#EF4444]', 
          bgLight: 'bg-[#EF4444]/5', iconColor: 'text-[#EF4444]', pulse: true 
        };
      case 'IMMINENT': 
        return { 
          badge: 'bg-[#FF9933]', text: 'text-white', border: 'border-[#FF9933]', 
          bgLight: 'bg-[#FF9933]/5', iconColor: 'text-[#FF9933]', pulse: false 
        };
      case 'ESCALATED': 
        return { 
          badge: 'bg-[#1E3A8A]', text: 'text-white', border: 'border-[#1E3A8A]', 
          bgLight: 'bg-[#1E3A8A]/5', iconColor: 'text-[#1E3A8A]', pulse: true 
        };
      default: 
        return { 
          badge: 'bg-gray-500', text: 'text-white', border: 'border-gray-500', 
          bgLight: 'bg-gray-50', iconColor: 'text-gray-500', pulse: false 
        };
    }
  };

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page if they just click ack
    // API TODO: await axios.post(`/api/officer/complaints/${id}/acknowledge`);
    alert(`Emergency response initiated for ${id}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Panel */}
      <div className="bg-linear-to-r from-[#EF4444] to-[#dc2626] p-6 sm:p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
        {/* Background Alert Pattern */}
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <ShieldAlert className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
              <AlertOctagon className="w-4 h-4 mr-2" /> Action Required Immediately
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Critical Queue</h1>
            <p className="text-red-100 mt-2 text-sm max-w-xl leading-relaxed">
              These cases have either breached their mandatory resolution time, are about to breach, or have been directly escalated by the CM Office.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex bg-black/20 p-1.5 rounded-xl backdrop-blur-sm shrink-0">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'ALL' ? 'bg-white text-[#EF4444] shadow-sm' : 'text-white hover:bg-white/10'}`}
            >
              All Critical
            </button>
            <button 
              onClick={() => setFilter('OVERDUE')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'OVERDUE' ? 'bg-white text-[#EF4444] shadow-sm' : 'text-white hover:bg-white/10'}`}
            >
              Overdue
            </button>
          </div>
        </div>
      </div>

      {/* Critical Complaint List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredData.length > 0 ? (
            filteredData.map((complaint) => {
              const config = getSeverityConfig(complaint.slaStatus);
              return (
                <motion.div 
                  key={complaint.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}
                  className={`bg-white rounded-2xl border-2 ${config.border} shadow-sm overflow-hidden flex flex-col md:flex-row`}
                >
                  {/* Left Edge Color Bar */}
                  <div className={`hidden md:flex flex-col items-center justify-center w-32 ${config.badge} p-4 text-center shrink-0`}>
                    {config.pulse && (
                      <span className="relative flex h-4 w-4 mb-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white/90"></span>
                      </span>
                    )}
                    <h3 className="text-white font-black text-lg">{complaint.id}</h3>
                    <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider mt-1">{complaint.slaStatus}</p>
                  </div>

                  {/* Main Content */}
                  <div className={`flex-1 p-5 sm:p-6 ${config.bgLight}`}>
                    {/* Mobile Header (replaces the left edge bar on small screens) */}
                    <div className="md:hidden flex items-center justify-between mb-3 border-b pb-3 border-gray-200/50">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.badge} ${config.text}`}>
                        {complaint.id} • {complaint.slaStatus}
                      </span>
                      {config.pulse && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-4">{complaint.title}</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start">
                        <Timer className={`w-5 h-5 mr-3 mt-0.5 ${config.iconColor}`} />
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Time Status</p>
                          <p className={`font-bold ${config.iconColor}`}>{complaint.timeDetails}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 mr-3 mt-0.5 text-[#87CEEB]" />
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Location</p>
                          <p className="font-semibold text-gray-800">{complaint.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/50">
                      <a 
                        href={`tel:${complaint.citizenPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex justify-center items-center py-2.5 px-4 bg-white border border-gray-200 text-[#1E3A8A] font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <PhoneCall className="w-4 h-4 mr-2" /> Contact Citizen
                      </a>
                      <button 
                        onClick={(e) => handleAcknowledge(complaint.id, e)}
                        className={`flex-1 flex justify-center items-center py-2.5 px-4 text-white font-bold rounded-xl shadow-md transition-all ${config.badge} hover:opacity-90`}
                      >
                        Initiate Response
                      </button>
                      <Link 
                        href={`/officer/assigned/${complaint.id}`}
                        className="flex-1 flex justify-center items-center py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold rounded-xl shadow-md transition-all"
                      >
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>

                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-[#22C55E]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E3A8A] mb-2">Queue Clear</h3>
              <p className="text-gray-500">You have zero critical or overdue complaints right now. Excellent work maintaining SLAs!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}