"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, AlertCircle, CheckCircle2, Clock, Search, Send, 
  MapPin, Loader2, Sparkles, User, Briefcase, TrendingUp, Download,
  Map as MapIcon, ShieldAlert, Award
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

// Dynamically import Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(
  () => import('@/components/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-gray-500 font-bold bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        Loading interactive map...
      </div>
    )
  }
);

export default function MLADashboard() {
  const { profile } = useAuth();
  const [constituency, setConstituency] = useState('All Constituencies');
  const [constituencyList, setConstituencyList] = useState<string[]>(['All Constituencies', 'New Delhi Assembly', 'East Delhi Assembly']);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const list = new Set<string>(['All Constituencies', 'New Delhi Assembly', 'East Delhi Assembly']);
    complaints.forEach(c => {
      if (c.constituency) list.add(c.constituency);
      if (c.assemblyConstituency) list.add(c.assemblyConstituency);
    });
    setConstituencyList(Array.from(list));
  }, [complaints]);

  // AI Copilot States
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<any[]>([
    { sender: 'ai', text: `Welcome representative. I am your RAG-enabled Governance Assistant. Ask me about constituency issues, slow officers, speech notes, or request a summary PDF.`, type: 'text' }
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Visit Mode States
  const [visitArea, setVisitArea] = useState('');
  const [visitReport, setVisitReport] = useState<any>(null);
  const [visitLoading, setVisitLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  // Listen to complaints in real-time
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "complaints"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allDocs: any[] = [];
      snapshot.forEach((doc) => {
        allDocs.push({ id: doc.id, ...doc.data() });
      });

      // Map constituency to district for legacy fallbacks dynamically
      const targetDistrict = constituency.replace(" Assembly", "");
      const isMLA = profile?.role === 'MLA';
      const mlaId = isMLA ? 'MLA-DEL-045' : (profile?.mlaId || profile?.uid || 'MLA-DEL-045');
      const mlaName = isMLA ? 'Shri Ankit Kumar' : (profile?.fullName || 'Shri Ankit Kumar');

      const filteredList = allDocs.filter(c => {
        // Filter by assigned MLA
        const matchesMLA = c.mlaId === mlaId || c.assignedMLAId === mlaId || c.assignedMLA === mlaName || c.mlaName === mlaName;
        if (!matchesMLA) return false;

        if (constituency === 'All Constituencies') return true;

        const matchesConstituency = c.constituency === constituency || c.assemblyConstituency === constituency;
        const matchesDistrictFallback = !c.constituency && c.district === targetDistrict;
        return matchesConstituency || matchesDistrictFallback;
      });

      // Print debug logs as required by audit engine
      console.log("================ MLA PORTAL DATA PIPELINE AUDIT ================");
      console.log(`[Audit] Constituency being queried: "${constituency}"`);
      console.log(`[Audit] MLA ID being used: "${mlaId}"`);
      console.log(`[Audit] Total complaint documents found in database: ${allDocs.length}`);
      console.log(`[Audit] Complaints after constituency filtering: ${filteredList.length}`);
      console.log("================================================================");

      // Sort by date descending
      filteredList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setComplaints(filteredList);
      setLoading(false);
    }, (err) => {
      console.error("Firestore complaints subscription failed:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [constituency, profile]);

  // Listen to notifications in real-time
  useEffect(() => {
    const q = query(collection(db, "notifications"), where("role", "==", "MLA"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setNotifications(list.slice(0, 5));
    });
    return () => unsubscribe();
  }, []);

  // Compute metrics
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
  const pendingCount = totalCount - resolvedCount;
  const criticalCount = complaints.filter(c => c.priority === 'CRITICAL' && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
  const emergencyCount = complaints.filter(c => c.priority === 'EMERGENCY' && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Resolved') return matchesSearch && ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status);
    if (statusFilter === 'Pending') return matchesSearch && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status);
    if (statusFilter === 'Critical') return matchesSearch && (c.priority === 'CRITICAL' || c.priority === 'EMERGENCY');
    return matchesSearch;
  });

  // Copilot Query Trigger
  const handleCopilotSend = async (textToSend?: string) => {
    const queryText = textToSend || copilotInput;
    if (!queryText.trim()) return;

    // Add user message
    setCopilotMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    if (!textToSend) setCopilotInput('');
    setCopilotLoading(true);

    try {
      const response = await fetch('/api/mla/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, constituency })
      });

      if (!response.ok) throw new Error("Copilot response error");
      const resData = await response.json();

      setCopilotMessages(prev => [...prev, {
        sender: 'ai',
        text: resData.text,
        type: resData.type || 'text',
        data: resData.data || null
      }]);
    } catch (err: any) {
      setCopilotMessages(prev => [...prev, { sender: 'ai', text: "Error connecting to AI Copilot. Please check network connection." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Visit Mode Intelligence Generator
  const generateVisitBriefing = async () => {
    if (!visitArea.trim()) return;
    setVisitLoading(true);
    setVisitReport(null);

    try {
      const response = await fetch('/api/mla/copilot/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaName: visitArea, constituency })
      });

      if (!response.ok) throw new Error("Visit mode error");
      const resData = await response.json();
      setVisitReport(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setVisitLoading(false);
    }
  };

  // Export to PDF client-side helper
  const triggerPDFExport = (title: string, content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #1E3A8A; border-bottom: 2px solid #FF9933; padding-bottom: 10px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            p { line-height: 1.6; font-size: 14px; }
            .section { margin-bottom: 20px; padding: 15px; border-left: 4px solid #FF9933; background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">Generated automatically on ${new Date().toLocaleString()} | AI MLA Portal</div>
          <p>${content.replace(/\n/g, '<br/>')}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-10">
      
      {/* Header and Constituency selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <span className="text-xs font-black text-[#FF9933] uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
            Delhi Legislative Assembly
          </span>
          <h2 className="text-3xl font-black text-[#1E3A8A] mt-2">Assembly Dashboard Center</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time telemetry and AI governance metrics for your local constituency.</p>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Selected Constituency</label>
          <select 
            value={constituency}
            onChange={(e) => setConstituency(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50 text-[#1E3A8A] font-bold shadow-sm"
          >
            {constituencyList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          { title: "Total Grievances", value: totalCount, icon: FileText, color: "text-[#1E3A8A]", bg: "bg-[#1E3A8A]/10" },
          { title: "Pending Resolution", value: pendingCount, icon: Clock, color: "text-[#FF9933]", bg: "bg-[#FF9933]/10" },
          { title: "Resolved Issues", value: resolvedCount, icon: CheckCircle2, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
          { title: "Critical Incidents", value: criticalCount, icon: AlertCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          { title: "Emergency Dispatch", value: emergencyCount, icon: ShieldAlert, color: "text-red-700", bg: "bg-red-700/10" }
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.bg} mb-4`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <h3 className="text-3xl font-black text-gray-900">{metric.value}</h3>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wide">{metric.title}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Map & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Map Leaflet (Col Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 overflow-hidden flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-[#1E3A8A] flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#FF9933]" /> Live Constituency Heatmap
            </h3>
            <div className="flex gap-4 text-xs font-bold text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Resolved</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical</span>
            </div>
          </div>

          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-gray-100 z-0 relative">
            <LeafletMap complaints={filteredComplaints} />
          </div>
        </div>

        {/* Live Telemetry Notifications */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col h-[500px]">
          <h3 className="text-lg font-black text-[#1E3A8A] mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Live Dispatch Alert Room
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <div key={i} className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF9933] mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">
                      {n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : 'Just Now'}
                    </p>
                    <p className="text-sm font-black text-[#1E3A8A] mt-0.5">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No active dispatch alerts.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AI Copilot & Visit Mode Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RAG AI Copilot (Col Span 2) */}
        <div className="lg:col-span-2 bg-[#1E3A8A] text-white rounded-3xl p-6 shadow-xl flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF9933] animate-pulse" /> AI Governance Assistant (Pinecone RAG)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-[#FF9933] border border-orange-500/30 px-2.5 py-0.5 rounded-md">
              Gemini 2.5 Active
            </span>
          </div>

          {/* Quick prompt buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              "Today's Report",
              "Top 10 Critical Issues",
              "Water Problems",
              "Which officer is slow?",
              "Generate Speech"
            ].map((p, i) => (
              <button 
                key={i} 
                onClick={() => handleCopilotSend(p)}
                disabled={copilotLoading}
                className="text-[10px] sm:text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 bg-slate-900/40 rounded-2xl p-4 border border-white/5">
            {copilotMessages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#FF9933] flex items-center justify-center font-bold text-xs flex-shrink-0">AI</div>
                )}
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                  m.sender === 'user' ? 'bg-[#FF9933] text-white rounded-tr-none font-medium' : 'bg-white/95 text-slate-800 rounded-tl-none leading-relaxed'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  
                  {m.type === 'pdf_download' && m.data && (
                    <button 
                      onClick={() => triggerPDFExport(m.data.title, m.data.text)}
                      className="mt-3 flex items-center gap-1.5 text-xs font-black text-white bg-[#1E3A8A] hover:opacity-90 px-3 py-2 rounded-xl border border-blue-400 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" /> Export Report PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
            {copilotLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#FF9933] flex items-center justify-center font-bold text-xs flex-shrink-0 animate-pulse">AI</div>
                <div className="p-3 bg-white/10 rounded-2xl rounded-tl-none text-sm text-gray-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF9933]" /> AI is querying live knowledge base...
                </div>
              </div>
            )}
          </div>

          {/* Chat Form */}
          <div className="flex gap-2">
            <input 
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
              placeholder="Ask anything about constituency problems..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF9933] transition-colors"
            />
            <button 
              onClick={() => handleCopilotSend()}
              disabled={copilotLoading}
              className="w-12 h-12 rounded-xl bg-[#FF9933] hover:bg-[#ffaa4f] text-white flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MLA Visit Mode Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col h-[500px]">
          <h3 className="text-lg font-black text-[#1E3A8A] mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF9933]" /> MLA On-Site Visit Intelligence
          </h3>
          <p className="text-xs text-gray-400 mb-4">Prepare instant briefings before visiting specific wards, local sectors or villages.</p>

          <div className="flex gap-2 mb-4">
            <input 
              type="text"
              value={visitArea}
              onChange={(e) => setVisitArea(e.target.value)}
              placeholder="e.g. Connaught Place"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
            />
            <button 
              onClick={generateVisitBriefing}
              disabled={visitLoading}
              className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#2c4fb5] text-white font-bold text-xs transition-colors disabled:opacity-50"
            >
              Inspect
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-4">
            {visitLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A]" />
                Generating localized intelligence report...
              </div>
            ) : visitReport ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-black text-sm text-[#1E3A8A]">{visitReport.areaName} Report</span>
                  <button 
                    onClick={() => triggerPDFExport(`Visit Intelligence - ${visitReport.areaName}`, visitReport.summary + '\n\nInfrastructure Status:\n' + visitReport.infrastructureStatus + '\n\nCitizen Satisfaction:\n' + visitReport.citizenSatisfaction)}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#FF9933] border border-orange-200 bg-orange-50 px-2 py-1 rounded-md"
                  >
                    <Download className="w-3 h-3" /> PDF Export
                  </button>
                </div>
                <div>
                  <p className="font-bold text-gray-700">Problems Summary</p>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">{visitReport.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center my-2">
                  <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                    <p className="font-bold text-green-700 text-sm">{visitReport.resolvedCount}</p>
                    <p className="text-[9px] text-green-600 font-bold uppercase">Resolved</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                    <p className="font-bold text-[#FF9933] text-sm">{visitReport.pendingCount}</p>
                    <p className="text-[9px] text-[#FF9933] font-bold uppercase">Pending</p>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-700">Infrastructure Health</p>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">{visitReport.infrastructureStatus}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700">Citizen Satisfaction Score</p>
                  <p className="text-gray-600 mt-0.5 leading-relaxed font-semibold">{visitReport.citizenSatisfaction}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-400">
                Enter a sector/village name above to compile visit intelligence report.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Grievance Telemetry Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-5">
          <div>
            <h3 className="text-xl font-black text-[#1E3A8A]">Grievance Telemetry Feed</h3>
            <p className="text-xs text-gray-500 mt-0.5">Real-time listing of complaints registered within the constituency boundaries.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
              />
            </div>
            {/* Filters */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold text-gray-600">
              {['All', 'Pending', 'Resolved', 'Critical'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-2 border-r last:border-0 border-gray-200 ${
                    statusFilter === f ? 'bg-[#1E3A8A] text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
              Loading real-time constituency logs...
            </div>
          ) : filteredComplaints.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Title / Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Assigned MLA</th>
                  <th className="px-6 py-4">Handling Officer</th>
                  <th className="px-6 py-4">Date Filed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-[#1E3A8A]">{c.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 truncate max-w-[200px]">{c.title || c.description}</p>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{c.category || 'Civic'}</span>
                    </td>
                    <td className="px-6 py-4 max-w-[180px] truncate text-xs">{c.location?.address}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        c.priority === 'CRITICAL' || c.priority === 'EMERGENCY' ? 'bg-red-50 text-red-600 border border-red-200' :
                        c.priority === 'HIGH' ? 'bg-orange-50 text-[#FF9933] border border-orange-200' :
                        'bg-blue-50 text-[#1E3A8A] border border-blue-200'
                      }`}>
                        {c.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status) 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-[#FF9933] uppercase">
                      {c.departmentName || c.department || 'Pending'}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-700">
                      {c.mlaName || c.assignedMLA || 'Pending'}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-950">
                      {c.assignedOfficer || 'Pending'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(c.createdAt || c.date).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-gray-400 font-medium">
              No grievances found matching the filters.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
