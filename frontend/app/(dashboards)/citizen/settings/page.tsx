"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Smartphone, Mail, ShieldAlert, Save } from 'lucide-react';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: false,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // API TODO: await axios.put('/api/users/settings', preferences);
    setTimeout(() => {
      alert("Settings saved successfully!");
      setIsSaving(false);
    }, 1000);
  };

  // Custom Toggle Switch Component
  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:ring-offset-2 ${checked ? 'bg-[#FF9933]' : 'bg-gray-200'}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-[#1E3A8A]">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your security and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Notifications Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center mb-6 border-b border-gray-50 pb-4">
            <Bell className="w-5 h-5 mr-2 text-[#FF9933]" /> Alert Preferences
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates on your email.</p>
                </div>
              </div>
              <Toggle checked={preferences.emailAlerts} onChange={() => setPreferences(p => ({...p, emailAlerts: !p.emailAlerts}))} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">SMS Alerts</p>
                  <p className="text-xs text-gray-500">Immediate text message updates.</p>
                </div>
              </div>
              <Toggle checked={preferences.smsAlerts} onChange={() => setPreferences(p => ({...p, smsAlerts: !p.smsAlerts}))} />
            </div>
          </div>

          <button onClick={handleSaveSettings} disabled={isSaving} className="mt-8 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-[#1E3A8A] font-medium rounded-xl transition border border-gray-200">
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        {/* Security Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center mb-6 border-b border-gray-50 pb-4">
            <Lock className="w-5 h-5 mr-2 text-[#FF9933]" /> Security
          </h2>
          
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Password changed!"); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50" />
            </div>
            
            <button type="submit" className="mt-4 w-full flex items-center justify-center py-2.5 bg-linear-to-r from-[#1E3A8A] to-[#2a4eab] text-white font-medium rounded-xl hover:opacity-90 transition">
              <ShieldAlert className="w-4 h-4 mr-2" /> Update Password
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
}