"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, User, Phone, Calendar, Clock, 
  UploadCloud, CheckCircle2, AlertOctagon, Send, FileCheck 
} from 'lucide-react';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [status, setStatus] = useState("Pending");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      alert(`Complaint ${id} successfully updated to: ${status}`);
      setIsUpdating(false);
      router.push('/officer/assigned');
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-[#1E3A8A] transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Grievance Details</h1>
          <p className="text-sm font-bold text-[#FF9933] mt-0.5">{id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Severe waterlogging near metro station</h2>
              <span className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                Critical Priority
              </span>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8">
              The main road connecting to the Sector 4 metro station is completely flooded due to yesterday's heavy rain. The drainage system appears to be blocked, causing massive traffic jams and preventing pedestrian movement.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Category</p>
                <p className="font-semibold text-[#1E3A8A]">Water Supply</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Submitted</p>
                <p className="font-semibold text-gray-800">Oct 24, 08:30 AM</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Location</p>
                <p className="font-semibold text-gray-800 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-[#87CEEB]" /> Sector 4, Dwarka
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">Citizen Information</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF9933]/10 rounded-full flex items-center justify-center text-[#FF9933]"><User className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Reporter</p>
                  <p className="font-bold text-gray-900">Rahul Sharma</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF9933]/10 rounded-full flex items-center justify-center text-[#FF9933]"><Phone className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Contact</p>
                  <p className="font-bold text-gray-900">+91 9876543210</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          
          <form onSubmit={handleUpdate} className="bg-linear-to-br from-[#1E3A8A] to-[#2a4eab] p-6 sm:p-8 rounded-3xl shadow-lg text-white">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-[#FFC266]" /> Officer Action Panel
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Update Resolution Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-[#FFC266] appearance-none font-medium"
                >
                  <option value="Pending" className="text-gray-900">Mark as Pending</option>
                  <option value="In Progress" className="text-gray-900">Mark as In Progress</option>
                  <option value="Resolved" className="text-gray-900">Mark as Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Internal Notes / Action Taken</label>
                <textarea 
                  rows={3} 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail the steps taken..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 focus:ring-2 focus:ring-[#FFC266] resize-none"
                  required
                />
              </div>

              {status === 'Resolved' && (
                <div className="p-4 border-2 border-dashed border-[#FFC266]/50 rounded-xl text-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <UploadCloud className="w-6 h-6 mx-auto text-[#FFC266] mb-2" />
                  <p className="text-sm font-medium">Upload Proof of Resolution</p>
                  <p className="text-[10px] text-blue-200 mt-1">Required for closure (Image/Doc)</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-3.5 bg-[#FF9933] hover:bg-opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-70"
              >
                {isUpdating ? "Processing..." : <><Send className="w-4 h-4 mr-2" /> Update Grievance</>}
              </button>
            </div>
          </form>

        </div>
      </div>
    </motion.div>
  );
}