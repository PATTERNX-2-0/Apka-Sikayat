"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // Make sure Link is imported
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, UserPlus } from 'lucide-react';

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_OFFICERS = [
  { id: "OFF-201", name: "Rajeev Kumar", district: "South Delhi", workload: 42, capacity: 50, resolved: 124, status: "Active" },
  { id: "OFF-202", name: "Anita Sharma", district: "West Delhi", workload: 48, capacity: 50, resolved: 189, status: "Overloaded" },
  { id: "OFF-203", name: "Vikram Singh", district: "Central Delhi", workload: 15, capacity: 50, resolved: 88, status: "Active" },
  { id: "OFF-204", name: "Priya Das", district: "East Delhi", workload: 0, capacity: 50, resolved: 0, status: "On Leave" },
];

export default function OfficerManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const filteredOfficers = MOCK_OFFICERS.filter(off => 
    off.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    off.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Officer Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Monitor workload, capacity, and route assignments.</p>
        </div>
        <button 
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Briefcase className="w-4 h-4 mr-2" /> Bulk Reassignment
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text" placeholder="Search by name or district..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50/50"
          />
        </div>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOfficers.map(officer => {
          const utilPct = Math.round((officer.workload / officer.capacity) * 100);
          const isOverloaded = utilPct > 90;
          return (
            <div key={officer.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{officer.name}</h3>
                  <p className="text-sm font-medium text-gray-500 flex items-center mt-1"><MapPin className="w-3.5 h-3.5 mr-1 text-[#87CEEB]" /> {officer.district}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${officer.status === 'On Leave' ? 'bg-gray-100 text-gray-600' : isOverloaded ? 'bg-red-100 text-red-600' : 'bg-[#22C55E]/10 text-[#22C55E]'}`}>
                  {officer.status}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                    <span className="text-gray-500">Capacity Utilized</span>
                    <span className={isOverloaded ? "text-red-600" : "text-[#FF9933]"}>{utilPct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full ${isOverloaded ? 'bg-red-500' : 'bg-[#FF9933]'}`} style={{ width: `${utilPct}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Cases</p>
                    <p className="text-xl font-black text-gray-900">{officer.workload}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Resolved</p>
                    <p className="text-xl font-black text-[#22C55E]">{officer.resolved}</p>
                  </div>
                </div>
              </div>

              {/* FIXED: Changed from <button> to <Link> for correct routing */}
              <Link 
                href={`/department/officers/${officer.id}`}
                className="w-full block text-center py-2.5 bg-white border-2 border-[#FF9933]/20 text-[#FF8C00] font-bold rounded-xl hover:bg-[#FF9933]/5 transition-colors"
              >
                View & Assign Cases
              </Link>
            </div>
          )
        })}
      </div>

      {/* Assignment Modal (Mock) */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center">
                <UserPlus className="w-6 h-6 mr-2 text-[#FF9933]" /> Assign Cases
              </h2>
              <p className="text-sm text-gray-500 mb-6">Select an officer to route unassigned pending complaints.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Officer</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50 font-medium">
                    <option>Vikram Singh (15 Active, Cap: 50)</option>
                    <option>Rajeev Kumar (42 Active, Cap: 50)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Number of Cases to Route</label>
                  <input type="number" defaultValue={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50 font-medium" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => { alert("Cases routed successfully!"); setIsAssignModalOpen(false); }} className="flex-1 py-3 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                  Confirm Route
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}