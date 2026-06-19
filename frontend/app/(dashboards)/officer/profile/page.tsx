"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building2, BadgeCheck, Save, Edit2, X, Lock } from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
interface OfficerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  department: string;
  badgeNumber: string;
  joinedDate: string;
}

const MOCK_PROFILE: OfficerProfile = {
  id: "OFF-2041",
  fullName: "Rajeev Kumar",
  email: "officer.rk@delhi.gov.in",
  phone: "+91 9876500000",
  district: "South Delhi",
  department: "Delhi Jal Board (Water Supply)",
  badgeNumber: "DJB-SD-402",
  joinedDate: "March 2023"
};

export default function OfficerProfilePage() {
  const [profile, setProfile] = useState<OfficerProfile>(MOCK_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<OfficerProfile>(MOCK_PROFILE);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // API TODO: await axios.put('/api/officer/profile', formData);
    setTimeout(() => {
      setProfile(formData);
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Officer Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your administrative details and contact information.</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-[#87CEEB]/10 text-[#1E3A8A] font-bold rounded-xl hover:bg-[#87CEEB]/20 transition-colors">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Contact Info
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: ID Card & Core Details */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="h-32 bg-linear-to-r from-[#1E3A8A] to-[#2a4eab] relative border-b-4 border-[#FF9933]">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg">
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-[#1E3A8A] text-3xl font-bold border border-gray-200">
                  RK
                </div>
              </div>
            </div>
            {/* Government seal watermark effect */}
            <div className="absolute top-4 right-6 opacity-10">
              <Building2 className="w-24 h-24 text-white" />
            </div>
          </div>

          <div className="pt-16 pb-8 px-8 flex-1">
            {isEditing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Note: In a real system, Officers usually cannot change their Name/Badge/Dept themselves, only contact info. We mock that restriction here. */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Backup Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-50">
                  <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-[#1E3A8A] text-white font-medium rounded-xl hover:bg-opacity-90 transition flex items-center">
                    {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </button>
                  <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition flex items-center">
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center text-[#1E3A8A] bg-[#87CEEB]/20 px-3 py-1 rounded-full w-max text-xs font-bold mb-6">
                  <BadgeCheck className="w-4 h-4 mr-1 text-[#FF9933]" /> Authorized District Officer
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-4 shrink-0">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Full Name</p>
                      <p className="font-bold text-gray-900">{profile.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-4 shrink-0">
                      <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Department</p>
                      <p className="font-bold text-gray-900">{profile.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-4 shrink-0">
                      <MapPin className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Jurisdiction</p>
                      <p className="font-bold text-[#FF9933]">{profile.district}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-4 shrink-0">
                      <Phone className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Contact Number</p>
                      <p className="font-bold text-gray-900">{profile.phone}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Security & Metrics Summary */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Identification</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Badge / Employee ID</p>
                <p className="font-mono font-bold text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-200 text-center tracking-widest">{profile.badgeNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Official Email</p>
                <p className="font-medium text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#1E3A8A] to-[#2a4eab] p-6 rounded-3xl shadow-md text-white">
            <h3 className="text-sm font-bold text-[#FFC266] uppercase tracking-wider mb-4 flex items-center">
              <Lock className="w-4 h-4 mr-2" /> Security
            </h3>
            <p className="text-xs text-blue-100 mb-4 opacity-90 leading-relaxed">
              As a district official, you are required to update your portal password every 90 days.
            </p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium text-sm transition-colors">
              Change Password
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}