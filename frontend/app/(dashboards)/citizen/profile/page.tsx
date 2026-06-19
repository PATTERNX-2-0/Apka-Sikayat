"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit2, ShieldCheck, Save, X } from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  address: string;
  joinedDate: string;
}

const MOCK_PROFILE: UserProfile = {
  id: "USR-001",
  fullName: "Rahul Sharma",
  email: "citizen@demo.com",
  phone: "+91 9876543210",
  district: "South West Delhi",
  address: "Block C, Vasant Kunj",
  joinedDate: "October 2026"
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(MOCK_PROFILE);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // API TODO: await axios.put('/api/users/profile', formData);
    setTimeout(() => {
      setProfile(formData);
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and address.</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-[#87CEEB]/10 text-[#1E3A8A] font-medium rounded-xl hover:bg-[#87CEEB]/20 transition-colors">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Profile Header Banner */}
        <div className="h-32 bg-linear-to-r from-[#1E3A8A] to-[#87CEEB] relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg">
              <div className="w-full h-full bg-linear-to-br from-[#FF9933] to-[#FFC266] rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                {profile.fullName.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          {isEditing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-50">
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-[#FF9933] text-white font-medium rounded-xl hover:bg-opacity-90 transition flex items-center">
                  {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </button>
                <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition flex items-center">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full w-max text-xs font-bold mb-6">
                <ShieldCheck className="w-4 h-4 mr-1" /> Verified Citizen Since {profile.joinedDate}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center mr-4 shrink-0">
                    <User className="w-5 h-5 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Full Name</p>
                    <p className="font-semibold text-gray-800">{profile.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center mr-4 shrink-0">
                    <Mail className="w-5 h-5 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Email Address</p>
                    <p className="font-semibold text-gray-800">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center mr-4 shrink-0">
                    <Phone className="w-5 h-5 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Mobile Number</p>
                    <p className="font-semibold text-gray-800">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center mr-4 shrink-0">
                    <MapPin className="w-5 h-5 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Location</p>
                    <p className="font-semibold text-gray-800">{profile.address}, {profile.district}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}