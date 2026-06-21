"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, User, Phone, Calendar, Clock, 
  UploadCloud, CheckCircle2, AlertOctagon, Send, FileCheck, ShieldAlert
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import axios from 'axios';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Investigation_Started");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function getComplaintDetails() {
      if (!id) return;
      try {
        const docRef = doc(db, "complaints", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setComplaint(data);
          // Set appropriate next status based on current
          if (data.status) {
            setStatus(data.status);
          }
        }
      } catch (err) {
        console.error("Error loading complaint details:", err);
      } finally {
        setLoading(false);
      }
    }
    getComplaintDetails();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Hit Express backend API
      const response = await axios.post(`http://localhost:5002/api/complaints/${id}/status`, {
        status: status,
        notes: notes || `Officer status update to: ${status}`,
        updatedBy: `Officer Rajeev (Assigned)`
      });

      if (response.status === 200) {
        alert(`Grievance ${id} successfully updated to: ${status}`);
        router.push('/officer/assigned');
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error updating complaint status:", error);
      alert(error.response?.data?.error || error.message || "Failed to update grievance. Please ensure the backend server is running.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-transparent">
        <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback data if complaint doesn't exist in Firestore
  const displayTitle = complaint?.title || "Severe waterlogging near metro station";
  const displayPriority = complaint?.priority || "HIGH";
  const displayDesc = complaint?.description || "The main road connecting to the sector metro station is completely flooded due to heavy rains. Drainage system appears blocked.";
  const displayCategory = complaint?.category || "Water Supply";
  const displayDate = complaint?.createdAt 
    ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : "Oct 24, 08:30 AM";
  const displayLocation = complaint?.location?.address || "Sector 4, Dwarka";
  const isAnonymous = complaint?.isAnonymous || false;

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-[#1E3A8A] transition-colors shadow-sm cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Grievance Operations</h1>
          <p className="text-sm font-bold text-[#FF9933] mt-0.5">{id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900 leading-snug">{displayTitle}</h2>
              <span className={`border text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 ${getPriorityStyles(displayPriority)}`}>
                {displayPriority} Priority
              </span>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8">
              {displayDesc}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Category</p>
                <p className="font-semibold text-[#1E3A8A] text-sm">{displayCategory}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Submitted</p>
                <p className="font-semibold text-gray-800 text-sm">{displayDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Location</p>
                <p className="font-semibold text-gray-800 flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-[#87CEEB] shrink-0" /> <span className="truncate">{displayLocation}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">Citizen Contact Registry</h3>
            {isAnonymous ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Anonymity Lock Active</p>
                  <p className="text-xs text-blue-700/80 mt-0.5">This citizen requested identity hiding. Direct contact details are masked by administrative policy.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF9933]/10 rounded-full flex items-center justify-center text-[#FF9933]"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Reporter Name</p>
                    <p className="font-bold text-gray-900 text-sm">Citizen User</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF9933]/10 rounded-full flex items-center justify-center text-[#FF9933]"><Phone className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Contact Phone</p>
                    <p className="font-bold text-gray-900 text-sm">{complaint?.phoneNumber || "+91 9988877665"}</p>
                  </div>
                </div>
              </div>
            )}
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
                <label className="block text-sm font-medium text-blue-100 mb-2">Update Lifecycle Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-[#FFC266] appearance-none font-medium text-sm"
                >
                  <option value="Submitted" className="text-gray-900">Stage 1: Submitted</option>
                  <option value="AI_Validated" className="text-gray-900">Stage 2: AI Validated</option>
                  <option value="Assigned_Dept" className="text-gray-900">Stage 3: Assigned Department</option>
                  <option value="Officer_Assigned" className="text-gray-900">Stage 4: Officer Assigned</option>
                  <option value="Investigation_Started" className="text-gray-900">Stage 5: Investigation Started</option>
                  <option value="Inspection_Scheduled" className="text-gray-900">Stage 6: Field Visit Scheduled</option>
                  <option value="Inspection_Completed" className="text-gray-900">Stage 7: Field Visit Completed</option>
                  <option value="Action_In_Progress" className="text-gray-900">Stage 8: Action In Progress</option>
                  <option value="Resolved" className="text-gray-900">Stage 9: Mark as Resolved</option>
                  <option value="Citizen_Verified" className="text-gray-900">Stage 10: Citizen Verified</option>
                  <option value="Closed" className="text-gray-900">Stage 11: Mark as Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Internal Activity Logger</label>
                <textarea 
                  rows={3} 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail the actions taken or scheduled inspection plans..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 focus:ring-2 focus:ring-[#FFC266] resize-none text-sm"
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
                className="w-full py-3.5 bg-[#FF9933] hover:bg-opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-70 cursor-pointer"
              >
                {isUpdating ? "Processing..." : <><Send className="w-4 h-4 mr-2" /> Commit Status Update</>}
              </button>
            </div>
          </form>

        </div>
      </div>
    </motion.div>
  );
}