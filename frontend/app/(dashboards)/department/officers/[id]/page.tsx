"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Briefcase, MapPin, CheckCircle2, 
  AlertOctagon, Plus, Minus, ShieldAlert, Clock 
} from 'lucide-react';

// ==========================================
// BACKEND TYPES & MOCK DATA
// ==========================================
interface Complaint {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  location: string;
}

const MOCK_OFFICER = {
  id: "OFF-201",
  name: "Rajeev Kumar",
  district: "South Delhi",
  capacity: 50,
};

const INITIAL_ASSIGNED: Complaint[] = [
  { id: "CMP-1042", title: "Severe waterlogging near metro", priority: "CRITICAL", date: "Today", location: "Sector 4, Dwarka" },
  { id: "CMP-1041", title: "Broken sewage pipe leaking", priority: "HIGH", date: "Yesterday", location: "Vasant Kunj" },
];

const INITIAL_UNASSIGNED: Complaint[] = [
  { id: "CMP-1050", title: "Contaminated water supply", priority: "CRITICAL", date: "2 hrs ago", location: "Saket Block J" },
  { id: "CMP-1051", title: "No water pressure in residential area", priority: "MEDIUM", date: "5 hrs ago", location: "Hauz Khas" },
  { id: "CMP-1052", title: "Public tap continuously leaking", priority: "LOW", date: "Yesterday", location: "Green Park" },
];

export default function OfficerAssignmentPanel() {
  const { id } = useParams();
  const router = useRouter();

  const [assignedCases, setAssignedCases] = useState<Complaint[]>(INITIAL_ASSIGNED);
  const [unassignedCases, setUnassignedCases] = useState<Complaint[]>(INITIAL_UNASSIGNED);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Capacity Calculations
  const currentWorkload = assignedCases.length; // In a real app, this would be a larger number
  const utilPct = Math.round((currentWorkload / MOCK_OFFICER.capacity) * 100);
  const isOverloaded = utilPct > 90;

  // ==========================================
  // BACKEND INTEGRATION HANDLERS
  // ==========================================
  const handleAssign = (complaint: Complaint) => {
    if (currentWorkload >= MOCK_OFFICER.capacity) {
      return alert("Cannot assign. Officer is at maximum capacity.");
    }
    setIsProcessing(complaint.id);
    
    // API TODO: await axios.post(`/api/department/assign`, { officerId: id, complaintId: complaint.id });
    setTimeout(() => {
      setUnassignedCases(prev => prev.filter(c => c.id !== complaint.id));
      setAssignedCases(prev => [complaint, ...prev]);
      setIsProcessing(null);
    }, 600);
  };

  const handleRemove = (complaint: Complaint) => {
    setIsProcessing(complaint.id);
    
    // API TODO: await axios.post(`/api/department/unassign`, { officerId: id, complaintId: complaint.id });
    setTimeout(() => {
      setAssignedCases(prev => prev.filter(c => c.id !== complaint.id));
      setUnassignedCases(prev => [complaint, ...prev]);
      setIsProcessing(null);
    }, 600);
  };

  // UI Helpers
  const getPriorityColor = (priority: string) => {
    if (priority === 'CRITICAL') return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
    if (priority === 'HIGH') return 'text-[#FF9933] bg-[#FF9933]/10 border-[#FF9933]/20';
    return 'text-[#1E3A8A] bg-[#1E3A8A]/10 border-[#1E3A8A]/20';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-[#FF9933] hover:border-[#FF9933]/50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Assignment Panel</h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Route cases to specific officers.</p>
        </div>
      </div>

      {/* Officer Status Banner (Heavy Saffron Theme) */}
      <div className="bg-linear-to-r from-[#FF9933] to-[#FF8C00] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#FF9933]/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Briefcase className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
              ID: {id}
            </div>
            <h2 className="text-3xl font-black mb-1">{MOCK_OFFICER.name}</h2>
            <p className="flex items-center text-white/90 font-medium">
              <MapPin className="w-4 h-4 mr-1.5" /> District: {MOCK_OFFICER.district}
            </p>
          </div>

          <div className="w-full md:w-96 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
            <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-wider">
              <span>Workload Capacity</span>
              <span className={isOverloaded ? "text-red-200" : "text-white"}>{utilPct}% Utilized</span>
            </div>
            <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden mb-3">
              <motion.div 
                animate={{ width: `${utilPct}%` }}
                className={`h-full rounded-full ${isOverloaded ? 'bg-red-400' : 'bg-white'}`} 
              />
            </div>
            <p className="text-xs font-medium text-white/80">
              Handling {currentWorkload} out of {MOCK_OFFICER.capacity} maximum concurrent cases.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Queue Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Officer's Current Queue */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-lg font-black text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-[#FF9933]" /> Current Assignments
            </h3>
            <span className="bg-[#FF9933] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {assignedCases.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
            <AnimatePresence>
              {assignedCases.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Officer has no active assignments.</p>
                </motion.div>
              )}
              {assignedCases.map((caseItem) => (
                <motion.div 
                  key={`assigned-${caseItem.id}`} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-[#FF9933]/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                    <span className="text-xs font-bold text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {caseItem.date}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 leading-snug mb-3">{caseItem.title}</h4>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <span className="text-xs font-semibold text-[#87CEEB]">{caseItem.id}</span>
                    <button 
                      onClick={() => handleRemove(caseItem)}
                      disabled={isProcessing === caseItem.id}
                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center disabled:opacity-50"
                    >
                      {isProcessing === caseItem.id ? 'Moving...' : <><Minus className="w-3 h-3 mr-1" /> Unassign</>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Department Unassigned Queue */}
        <div className="bg-white rounded-3xl border border-[#87CEEB]/30 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-[#87CEEB]/20 bg-[#87CEEB]/5 flex justify-between items-center">
            <h3 className="text-lg font-black text-[#1E3A8A] flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-[#87CEEB]" /> Unassigned Queue
            </h3>
            <span className="bg-[#1E3A8A] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unassignedCases.length} Pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#87CEEB]/5">
            <AnimatePresence>
              {unassignedCases.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No pending unassigned cases in this district.</p>
                </motion.div>
              )}
              {unassignedCases.map((caseItem) => (
                <motion.div 
                  key={`unassigned-${caseItem.id}`} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-[#87CEEB]/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                    <span className="text-xs font-bold text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {caseItem.date}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 leading-snug mb-3">{caseItem.title}</h4>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <span className="text-xs font-semibold text-gray-400">{caseItem.location}</span>
                    <button 
                      onClick={() => handleAssign(caseItem)}
                      disabled={isProcessing === caseItem.id || isOverloaded}
                      className="text-xs font-bold text-white bg-[#FF9933] hover:bg-[#FF8C00] shadow-md px-3 py-1.5 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing === caseItem.id ? 'Moving...' : <><Plus className="w-3 h-3 mr-1" /> Assign Here</>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}