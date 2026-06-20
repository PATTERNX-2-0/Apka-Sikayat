"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Building, UserCheck, Wrench, ShieldAlert, CheckCircle, Lock, RefreshCw, Smartphone } from 'lucide-react';
import axios from 'axios';
import { db } from '@/lib/firebase';
import { collection, limit, query, getDocs } from 'firebase/firestore';

const STAGES = [
  { step: 1, title: 'Complaint Submitted', status: 'Submitted', desc: 'Your complaint was received by the system.', icon: Send, color: 'bg-blue-500' },
  { step: 2, title: 'AI Validation Completed', status: 'AI_Validated', desc: 'AI reviewed the complaint and verified authenticity.', icon: Sparkles, color: 'bg-blue-500' },
  { step: 3, title: 'Assigned To Department', status: 'Assigned_Dept', desc: 'Complaint routed to the responsible department.', icon: Building, color: 'bg-blue-500' },
  { step: 4, title: 'Officer Assigned', status: 'Officer_Assigned', desc: 'A specific resolving officer has been assigned.', icon: UserCheck, color: 'bg-blue-500' },
  { step: 5, title: 'Investigation Started', status: 'Investigation_Started', desc: 'The department has started reviewing your complaint details.', icon: ShieldAlert, color: 'bg-amber-500' },
  { step: 6, title: 'Field Inspection Scheduled', status: 'Inspection_Scheduled', desc: 'A field visit has been scheduled to inspect the site.', icon: ShieldAlert, color: 'bg-amber-500' },
  { step: 7, title: 'Field Inspection Completed', status: 'Inspection_Completed', desc: 'Site inspection completed by the assigned officer.', icon: ShieldAlert, color: 'bg-amber-500' },
  { step: 8, title: 'Action In Progress', status: 'Action_In_Progress', desc: 'Department team has started resolving the issue at the site.', icon: Wrench, color: 'bg-yellow-500' },
  { step: 9, title: 'Issue Resolved', status: 'Resolved', desc: 'The department has resolved the issue. Awaiting citizen verification.', icon: CheckCircle, color: 'bg-emerald-500' },
  { step: 10, title: 'Citizen Verification', status: 'Citizen_Verified', desc: 'Citizen confirmed and verified the resolution.', icon: UserCheck, color: 'bg-emerald-500' },
  { step: 11, title: 'Complaint Closed', status: 'Closed', desc: 'The complaint has been successfully resolved and closed.', icon: Lock, color: 'bg-emerald-500' }
];

export default function LifecycleTesterPage() {
  const [complaintId, setComplaintId] = useState("CMP-1001");
  const [selectedStatus, setSelectedStatus] = useState("Submitted");
  const [notes, setNotes] = useState("");
  const [updatedBy, setUpdatedBy] = useState("AI Engine");
  const [isLoading, setIsLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<string[]>([]);
  const [existingComplaints, setExistingComplaints] = useState<string[]>([]);

  // Load existing complaints from Firestore on mount
  useEffect(() => {
    async function loadComplaints() {
      try {
        const q = query(collection(db, "complaints"), limit(10));
        const snap = await getDocs(q);
        const ids = snap.docs.map(doc => doc.id);
        setExistingComplaints(ids);
        if (ids.length > 0) {
          setComplaintId(ids[0]);
        }
      } catch (err) {
        console.warn("Failed to load complaints from Firestore: ", err);
      }
    }
    loadComplaints();
  }, []);

  const addLog = (msg: string) => {
    setResponseLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const triggerStatusChange = async (statusOverride?: string, notesOverride?: string, actorOverride?: string) => {
    setIsLoading(true);
    const targetStatus = statusOverride || selectedStatus;
    const targetNotes = notesOverride || notes || `Simulation update to ${targetStatus}`;
    const targetActor = actorOverride || updatedBy;

    addLog(`Sending request for ${complaintId} to set status to ${targetStatus}...`);

    try {
      const response = await axios.post(`http://localhost:5002/api/complaints/${complaintId}/status`, {
        status: targetStatus,
        notes: targetNotes,
        updatedBy: targetActor
      });

      if (response.status === 200) {
        addLog(`✅ SUCCESS: Complaint ${complaintId} set to "${targetStatus}"`);
        addLog(`💬 Response Message: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error(error);
      addLog(`❌ ERROR: ${error.response?.data?.error || error.message || "Failed to connect to backend server"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTrigger = (stage: typeof STAGES[0]) => {
    let actor = "Department Administrator";
    let message = stage.desc;

    if (stage.step === 2) {
      actor = "AI Validation Engine";
      message = "Authenticity score 98% approved. Safe-check verified.";
    } else if (stage.step === 4) {
      actor = "PWD Assigning Desk";
      message = "Officer Rajeev assigned for on-site inspection.";
    } else if (stage.step === 7) {
      actor = "Officer Rajeev";
      message = "Site inspected. Broken pipeline verified. Scheduled repairs.";
    } else if (stage.step === 9) {
      actor = "PWD Road Team";
      message = "Pothole filled and tarmac dry. Ready for review.";
    }

    setSelectedStatus(stage.status);
    setUpdatedBy(actor);
    setNotes(message);
    triggerStatusChange(stage.status, message, actor);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-[#FF9933]" /> Complaint Lifecycle Simulator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Simulate official department workflows. Keep your Citizen Track page open in another window to observe live updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulator controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1E3A8A]">Trigger Status Event</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Target Complaint ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] font-semibold text-[#1E3A8A]"
                    placeholder="e.g. CMP-1001"
                  />
                  {existingComplaints.length > 0 && (
                    <select
                      onChange={(e) => setComplaintId(e.target.value)}
                      value={complaintId}
                      className="px-2 rounded-xl border border-gray-200 text-sm font-semibold"
                    >
                      <option value="">Recent IDs...</option>
                      {existingComplaints.map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Trigger Stage</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] font-semibold"
                >
                  {STAGES.map(s => (
                    <option key={s.status} value={s.status}>{s.step}. {s.title} ({s.status})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Actor (Triggered By)</label>
                <input 
                  type="text"
                  value={updatedBy}
                  onChange={(e) => setUpdatedBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] font-semibold"
                  placeholder="e.g. AI Engine, Officer Rajeev"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Timeline Description / Note</label>
                <input 
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF9933] font-medium"
                  placeholder="Details of the lifecycle change..."
                />
              </div>
            </div>

            <button
              onClick={() => triggerStatusChange()}
              disabled={isLoading}
              className="w-full py-3 bg-[#1E3A8A] text-white font-bold rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Trigger Custom Lifecycle Transition
                </>
              )}
            </button>
          </div>

          {/* Quick-trigger templates */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] mb-4">Quick Simulate Buttons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {STAGES.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.step}
                    onClick={() => handleQuickTrigger(s)}
                    disabled={isLoading}
                    className="p-3.5 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col items-center text-center gap-2 cursor-pointer group disabled:opacity-50"
                  >
                    <div className={`w-8 h-8 rounded-full ${s.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Stage {s.step}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{s.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Logs terminal */}
        <div className="lg:col-span-1 bg-[#1E293B] text-emerald-400 p-6 rounded-2xl shadow-xl flex flex-col h-[540px] font-mono border border-slate-700">
          <div className="flex justify-between items-center pb-4 border-b border-slate-700 shrink-0">
            <span className="text-xs font-bold text-slate-400">SIMULATOR_LEDGER.log</span>
            <button 
              onClick={() => setResponseLog([])} 
              className="text-[10px] text-slate-400 hover:text-white border border-slate-600 px-2 py-0.5 rounded"
            >
              Clear Logs
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-xs pt-4 pr-2 scrollbar-thin">
            {responseLog.length > 0 ? (
              responseLog.map((log, i) => (
                <div key={i} className="leading-relaxed border-b border-slate-800/40 pb-1 break-words">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center pt-20">
                Listening for events...<br />
                Click quick-trigger actions or post updates to view execution trace.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
