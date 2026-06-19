"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, AlertOctagon, Clock, CheckCircle2, FileText, MapPin, ChevronRight } from 'lucide-react';

// Mock Backend Data
const MOCK_ASSIGNED = [
  { id: "CMP-1042", title: "Severe waterlogging near metro", category: "Water Supply", priority: "CRITICAL", status: "Pending", date: "Today, 08:30 AM", location: "Sector 4, Dwarka" },
  { id: "CMP-1041", title: "Broken sewage pipe leaking", category: "Sanitation", priority: "HIGH", status: "In Progress", date: "Yesterday", location: "Vasant Kunj" },
  { id: "CMP-1039", title: "Traffic light malfunction", category: "Roads & Traffic", priority: "MEDIUM", status: "Pending", date: "Oct 24", location: "Hauz Khas" },
  { id: "CMP-1035", title: "Unscheduled power cut", category: "Electricity", priority: "HIGH", status: "Resolved", date: "Oct 22", location: "Lajpat Nagar" },
  { id: "CMP-1030", title: "Garbage collection delayed", category: "Sanitation", priority: "LOW", status: "Pending", date: "Oct 20", location: "Saket" },
];

export default function AssignedComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    return MOCK_ASSIGNED.filter(item => {
      const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || item.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [searchTerm, priorityFilter]);

  const getPriorityStyles = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
      case 'HIGH': return 'bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20';
      case 'MEDIUM': return 'bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-[#1E3A8A]">Assigned Complaints</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and resolve the grievances currently in your queue.</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between z-10 relative">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search ID or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1E3A8A] bg-gray-50/50"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1E3A8A] bg-gray-50/50 appearance-none font-medium text-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredData.map((complaint) => (
            <motion.div 
              key={complaint.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4 cursor-default"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#1E3A8A] bg-gray-100 px-2.5 py-1 rounded-md">{complaint.id}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getPriorityStyles(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                  {complaint.status === 'Pending' && <span className="flex items-center text-xs font-semibold text-[#FF9933]"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                  {complaint.status === 'In Progress' && <span className="flex items-center text-xs font-semibold text-[#1E3A8A]"><AlertOctagon className="w-3 h-3 mr-1" /> In Progress</span>}
                  {complaint.status === 'Resolved' && <span className="flex items-center text-xs font-semibold text-[#22C55E]"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</span>}
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{complaint.title}</h3>
              </div>

              <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 text-sm text-gray-500 font-medium">
                <div className="flex items-center"><FileText className="w-4 h-4 mr-1.5 text-[#87CEEB]" /> {complaint.category}</div>
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-[#87CEEB]" /> <span className="truncate max-w-[120px]">{complaint.location}</span></div>
              </div>

              <div className="mt-2 md:mt-0 flex justify-end shrink-0">
                <Link 
                  href={`/officer/assigned/${complaint.id}`}
                  className="w-full md:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-xl bg-linear-to-r from-[#1E3A8A] to-[#2a4eab] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                >
                  Action <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}