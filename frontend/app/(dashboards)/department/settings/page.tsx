"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Building2, Clock, Bell, 
  Save, ShieldAlert, Sliders, Mail, User
} from 'lucide-react';

// ==========================================
// BACKEND TYPES & MOCK DATA
// ==========================================
interface DeptConfig {
  deptName: string;
  hodName: string;
  contactEmail: string;
  slaCritical: number; // in hours
  slaHigh: number;
  slaMedium: number;
  slaLow: number;
  alertSlaBreach: boolean;
  alertEscalation: boolean;
  alertDailyReport: boolean;
}

const MOCK_CONFIG: DeptConfig = {
  deptName: "Water Supply Department",
  hodName: "Dr. Suresh Menon",
  contactEmail: "hod.water@delhi.gov.in",
  slaCritical: 4,
  slaHigh: 24,
  slaMedium: 48,
  slaLow: 120,
  alertSlaBreach: true,
  alertEscalation: true,
  alertDailyReport: false,
};

export default function DepartmentSettingsPage() {
  const [config, setConfig] = useState<DeptConfig>(MOCK_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // BACKEND INTEGRATION HANDLER
  // ==========================================
  const handleSave = async () => {
    setIsSaving(true);
    // API TODO: await axios.put('/api/department/settings', config);
    setTimeout(() => {
      alert("Department configuration saved successfully!");
      setIsSaving(false);
    }, 1000);
  };

  // Custom Toggle Switch Component (Saffron Themed)
  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      type="button" 
      onClick={onChange} 
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:ring-offset-2 ${checked ? 'bg-linear-to-r from-[#FF9933] to-[#FF8C00]' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center">
            <Settings className="w-7 h-7 mr-3 text-[#FF9933]" /> Configuration
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage departmental SLAs, routing rules, and official details.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center px-6 py-3 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Configuration</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Department Profile */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center border-b border-gray-50 pb-4">
              <Building2 className="w-5 h-5 mr-2 text-[#87CEEB]" /> Official Profile
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Department Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={config.deptName} 
                    onChange={(e) => setConfig({...config, deptName: e.target.value})} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50/50 font-medium text-gray-900" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Head of Department (HOD)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={config.hodName} 
                    onChange={(e) => setConfig({...config, hodName: e.target.value})} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50/50 font-medium text-gray-900" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Official Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    value={config.contactEmail} 
                    onChange={(e) => setConfig({...config, contactEmail: e.target.value})} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] bg-gray-50/50 font-medium text-gray-900" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Toggles */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center border-b border-gray-50 pb-4">
              <Bell className="w-5 h-5 mr-2 text-[#87CEEB]" /> Alert & Routing Rules
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">SLA Breach Alerts</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Notify HOD immediately if any case breaches its SLA time limit.</p>
                </div>
                <Toggle checked={config.alertSlaBreach} onChange={() => setConfig({...config, alertSlaBreach: !config.alertSlaBreach})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">CM Office Escalations</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Receive immediate SMS when a case is flagged by the CM dashboard.</p>
                </div>
                <Toggle checked={config.alertEscalation} onChange={() => setConfig({...config, alertEscalation: !config.alertEscalation})} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Daily Automated Reports</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Send a PDF summary of department performance every morning at 8 AM.</p>
                </div>
                <Toggle checked={config.alertDailyReport} onChange={() => setConfig({...config, alertDailyReport: !config.alertDailyReport})} />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* SLA Configuration */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FF9933]/20 shadow-sm relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9933]/5 rounded-bl-full pointer-events-none" />
            
            <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-[#FF9933]" /> SLA Time Limits (Hours)
            </h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Define the maximum allowable time for officers to resolve cases based on priority. These drive the countdown timers.</p>
            
            <div className="space-y-5 relative z-10">
              
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Critical</span>
                  <p className="text-xs font-medium text-gray-600 mt-1">Emergencies, major hazards</p>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaCritical} onChange={(e) => setConfig({...config, slaCritical: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-red-700 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400" />
                  <span className="ml-2 text-sm font-bold text-gray-500">Hrs</span>
                </div>
              </div>

              <div className="bg-[#FF9933]/10 p-4 rounded-2xl border border-[#FF9933]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF8C00] bg-[#FF9933]/20 px-2 py-0.5 rounded-full">High</span>
                  <p className="text-xs font-medium text-gray-600 mt-1">Severe disruptions</p>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaHigh} onChange={(e) => setConfig({...config, slaHigh: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-[#FF8C00] bg-white border border-[#FF9933]/30 rounded-lg focus:ring-2 focus:ring-[#FF9933]" />
                  <span className="ml-2 text-sm font-bold text-gray-500">Hrs</span>
                </div>
              </div>

              <div className="bg-[#87CEEB]/10 p-4 rounded-2xl border border-[#87CEEB]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1E3A8A] bg-[#87CEEB]/30 px-2 py-0.5 rounded-full">Medium</span>
                  <p className="text-xs font-medium text-gray-600 mt-1">Standard complaints</p>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaMedium} onChange={(e) => setConfig({...config, slaMedium: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-[#1E3A8A] bg-white border border-[#87CEEB]/30 rounded-lg focus:ring-2 focus:ring-[#87CEEB]" />
                  <span className="ml-2 text-sm font-bold text-gray-500">Hrs</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">Low</span>
                  <p className="text-xs font-medium text-gray-600 mt-1">Minor issues, suggestions</p>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaLow} onChange={(e) => setConfig({...config, slaLow: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400" />
                  <span className="ml-2 text-sm font-bold text-gray-500">Hrs</span>
                </div>
              </div>

            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
            <h3 className="text-sm font-black text-red-600 uppercase tracking-wider mb-2 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> Security Settings
            </h3>
            <p className="text-xs font-medium text-gray-500 mb-4">Update your administrative portal password. Requires current credentials.</p>
            <button className="w-full py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
              Change Password
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}