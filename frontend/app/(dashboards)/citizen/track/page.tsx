"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, UserCheck, Wrench, 
  ShieldCheck, CheckCircle2, Lock, Clock, MapPin, Activity
} from 'lucide-react';

// Mock Data for the Timeline
const MOCK_COMPLAINT = {
  id: "CMP-1001",
  title: "Severe waterlogging on Main Road",
  category: "Water Supply",
  location: "Vasant Kunj Road, South West Delhi",
  submittedOn: "Oct 24, 2026, 09:30 AM",
  estResolution: "Oct 26, 2026",
  currentStep: 3, // 1: Submitted, 2: Assigned, 3: In Progress, 4: Verification, 5: Resolved, 6: Closed
  assignedOfficer: "Rahul Verma (JE - Delhi Jal Board)",
  timeline: [
    { step: 1, title: "Complaint Submitted", date: "Oct 24, 2026, 09:30 AM", desc: "Your complaint was received by the system.", icon: FileText },
    { step: 2, title: "Assigned to Department", date: "Oct 24, 2026, 11:15 AM", desc: "Routed to Delhi Jal Board. Officer assigned.", icon: UserCheck },
    { step: 3, title: "In Progress", date: "Oct 25, 2026, 10:00 AM", desc: "Team is currently working on the resolution at the site.", icon: Wrench },
    { step: 4, title: "Pending Verification", date: null, desc: "Awaiting field evidence and supervisor approval.", icon: ShieldCheck },
    { step: 5, title: "Resolved", date: null, desc: "Issue has been fixed.", icon: CheckCircle2 },
    { step: 6, title: "Closed", date: null, desc: "Complaint officially closed.", icon: Lock },
  ]
};

export default function TrackComplaintPage() {
  const [searchId, setSearchId] = useState("CMP-1001");
  const [isSearching, setIsSearching] = useState(false);
  const [data, setData] = useState<typeof MOCK_COMPLAINT | null>(MOCK_COMPLAINT);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      // For demo, just reload the mock data if they type anything
      setData(searchId ? MOCK_COMPLAINT : null);
      setIsSearching(false);
    }, 800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">Track Status</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your Complaint ID to see real-time updates.</p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Complaint ID (e.g. CMP-1001)"
            className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] transition-all bg-gray-50 font-medium text-[#1E3A8A]"
            required
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center hover:bg-[#FF9933] transition-colors disabled:opacity-70"
          >
            {isSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Complaint Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FF9933]/10 text-[#FF9933] mb-4 border border-[#FF9933]/20">
                {data.id}
              </div>
              <h2 className="text-xl font-bold text-[#1E3A8A] leading-tight mb-4">{data.title}</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 mr-3 text-[#87CEEB] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category</p>
                    <p className="text-sm font-medium text-gray-700">{data.category}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-[#87CEEB] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Location</p>
                    <p className="text-sm font-medium text-gray-700">{data.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <UserCheck className="w-5 h-5 mr-3 text-[#87CEEB] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Assigned To</p>
                    <p className="text-sm font-medium text-gray-700">{data.assignedOfficer}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50">
                <div className="bg-gray-50 rounded-xl p-4 flex items-center border border-gray-100">
                  <Clock className="w-8 h-8 text-[#FF9933] mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Estimated Resolution</p>
                    <p className="text-sm font-bold text-[#1E3A8A]">{data.estResolution}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-8 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#FF9933]" /> Resolution Timeline
            </h3>

            <div className="relative">
              {/* Vertical Connecting Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100"></div>
              {/* Highlighted Progress Line */}
              <div 
                className="absolute left-6 top-6 w-0.5 bg-[#FF9933] transition-all duration-1000 ease-in-out" 
                style={{ height: `${((data.currentStep - 1) / (data.timeline.length - 1)) * 100}%` }}
              ></div>

              <div className="space-y-8 relative">
                {data.timeline.map((item, index) => {
                  const Icon = item.icon;
                  const isCompleted = item.step < data.currentStep;
                  const isCurrent = item.step === data.currentStep;
                  const isPending = item.step > data.currentStep;

                  return (
                    <div key={item.step} className="flex relative">
                      {/* Timeline Node */}
                      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0 border-4 border-white shadow-sm transition-colors ${
                        isCompleted ? 'bg-[#22C55E] text-white' : 
                        isCurrent ? 'bg-[#FF9933] text-white ring-4 ring-[#FF9933]/20' : 
                        'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Timeline Content */}
                      <div className={`ml-6 pt-1 flex-1 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                          <h4 className={`text-base font-bold ${isCurrent ? 'text-[#FF9933]' : 'text-[#1E3A8A]'}`}>
                            {item.title}
                          </h4>
                          {item.date && (
                            <span className="text-xs font-medium text-gray-400 mt-1 sm:mt-0 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                              {item.date}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
          <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#1E3A8A]">No Complaint Found</h3>
          <p className="text-gray-500 mt-1">Please enter a valid Complaint ID to track its status.</p>
        </div>
      )}
    </motion.div>
  );
}