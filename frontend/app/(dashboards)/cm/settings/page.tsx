"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Bot, Clock, Bell, ShieldAlert, Save, 
  CheckCircle2, Server, SlidersHorizontal, Lock
} from 'lucide-react';

// ==========================================
// BACKEND TYPES & MOCK DATA
// ==========================================
interface PlatformConfig {
  aiStrictness: number; // 0 to 100
  aiAutoFlag: boolean;
  slaCritical: number; // hours
  slaHigh: number;
  slaMedium: number;
  slaLow: number;
  notifyEmergencies: boolean;
  notifyDailyBrief: boolean;
  notifyCorruption: boolean;
  maintenanceMode: boolean;
}

const INITIAL_CONFIG: PlatformConfig = {
  aiStrictness: 85,
  aiAutoFlag: true,
  slaCritical: 2,
  slaHigh: 12,
  slaMedium: 48,
  slaLow: 120,
  notifyEmergencies: true,
  notifyDailyBrief: true,
  notifyCorruption: true,
  maintenanceMode: false,
};

export default function CMSettingsPage() {
  const [config, setConfig] = useState<PlatformConfig>(INITIAL_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ==========================================
  // BACKEND INTEGRATION HANDLER
  // ==========================================
  const handleSave = async () => {
    setIsSaving(true);
    // API TODO: await axios.put('/api/cm/platform-settings', config);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Platform configurations saved successfully and deployed to all nodes.");
    }, 1500);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Custom Saffron Toggle Switch Component
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }} 
            animate={{ opacity: 1, y: 0, x: '-50%' }} 
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 bg-[#1E3A8A] text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center border border-[#87CEEB]/30 w-max max-w-[90vw]"
          >
            <CheckCircle2 className="w-5 h-5 mr-2 text-[#87CEEB] shrink-0" />
            <span className="truncate">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E3A8A] flex items-center tracking-tight">
            <Settings className="w-7 h-7 mr-3 text-[#FF9933]" /> Platform Settings
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">Super Admin Global Configurations</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 uppercase tracking-widest text-xs"
        >
          {isSaving ? (
            <>Deploying...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Deploy Changes</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* AI Engine Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-black text-[#1E3A8A] mb-6 flex items-center border-b border-gray-100 pb-4">
              <Bot className="w-5 h-5 mr-2 text-[#87CEEB]" /> AI Engine Configuration
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-700">NLP Strictness Threshold</label>
                  <span className="text-xs font-black text-[#FF9933] bg-[#FF9933]/10 px-2 py-0.5 rounded-md border border-[#FF9933]/20">{config.aiStrictness}%</span>
                </div>
                <p className="text-xs font-medium text-gray-500 mb-3">Higher strictness increases false closure flagging sensitivity.</p>
                <input 
                  type="range" min="50" max="99" 
                  value={config.aiStrictness} 
                  onChange={(e) => setConfig({...config, aiStrictness: Number(e.target.value)})} 
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#FF9933]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Auto-Flag Suspicious Activity</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-[250px]">Allow AI to automatically suspend officer assignments upon detecting severe corruption keywords.</p>
                </div>
                <Toggle checked={config.aiAutoFlag} onChange={() => setConfig({...config, aiAutoFlag: !config.aiAutoFlag})} />
              </div>
            </div>
          </div>

          {/* CM Notification Routing */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-black text-[#1E3A8A] mb-6 flex items-center border-b border-gray-100 pb-4">
              <Bell className="w-5 h-5 mr-2 text-[#87CEEB]" /> Executive Alert Routing
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Immediate Emergency SMS</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Ping CM mobile device for critical city emergencies.</p>
                </div>
                <Toggle checked={config.notifyEmergencies} onChange={() => setConfig({...config, notifyEmergencies: !config.notifyEmergencies})} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Corruption Flags Escalation</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Send direct alert when AI detects severe officer misconduct.</p>
                </div>
                <Toggle checked={config.notifyCorruption} onChange={() => setConfig({...config, notifyCorruption: !config.notifyCorruption})} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Daily Automated Briefing</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Receive PDF report of city metrics every morning at 8:00 AM.</p>
                </div>
                <Toggle checked={config.notifyDailyBrief} onChange={() => setConfig({...config, notifyDailyBrief: !config.notifyDailyBrief})} />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Global SLA Overrides */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E3A8A]/5 rounded-bl-full pointer-events-none" />
            
            <h3 className="text-lg font-black text-[#1E3A8A] mb-2 flex items-center relative z-10">
              <Clock className="w-5 h-5 mr-2 text-[#FF9933]" /> State-Wide SLA Limits
            </h3>
            <p className="text-xs font-medium text-gray-500 mb-6 relative z-10">Override departmental SLAs. These values set the absolute maximum resolution time allowed across Delhi.</p>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-sm border border-red-200">Critical Priority</span>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaCritical} onChange={(e) => setConfig({...config, slaCritical: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-red-700 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400" />
                  <span className="ml-2 text-xs font-black text-gray-500 uppercase tracking-widest">Hours</span>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-sm border border-orange-200">High Priority</span>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaHigh} onChange={(e) => setConfig({...config, slaHigh: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-orange-700 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400" />
                  <span className="ml-2 text-xs font-black text-gray-500 uppercase tracking-widest">Hours</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-sm border border-blue-200">Medium Priority</span>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaMedium} onChange={(e) => setConfig({...config, slaMedium: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-blue-700 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400" />
                  <span className="ml-2 text-xs font-black text-gray-500 uppercase tracking-widest">Hours</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 bg-gray-200 px-2 py-0.5 rounded-sm border border-gray-300">Low Priority</span>
                </div>
                <div className="flex items-center">
                  <input type="number" value={config.slaLow} onChange={(e) => setConfig({...config, slaLow: Number(e.target.value)})} className="w-16 px-2 py-1.5 text-center font-black text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400" />
                  <span className="ml-2 text-xs font-black text-gray-500 uppercase tracking-widest">Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Security / Danger Zone */}
          <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> Danger Zone
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <div>
                  <p className="font-bold text-red-900 text-sm flex items-center">
                    <Server className="w-4 h-4 mr-2" /> Maintenance Mode
                  </p>
                  <p className="text-xs text-red-700/80 font-medium mt-0.5">Pauses all new citizen complaints temporarily.</p>
                </div>
                <Toggle checked={config.maintenanceMode} onChange={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})} />
              </div>

              <button className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" /> Rotate Super Admin Keys
              </button>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}