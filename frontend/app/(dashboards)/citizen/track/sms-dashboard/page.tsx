"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Send, CheckCircle2, AlertTriangle, 
  Clock, Database, Loader2, Play, RefreshCw, ChevronLeft, ChevronRight, Lock
} from 'lucide-react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface SMSLog {
  id: string;
  complaintId: string;
  citizenId: string;
  phoneNumber: string;
  message: string;
  status: 'Queued' | 'Sent' | 'Delivered' | 'Failed';
  twilioSid: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface Stats {
  queued: number;
  sent: number;
  delivered: number;
  failed: number;
  total: number;
}

export default function SMSDashboardPage() {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState<Stats>({ queued: 0, sent: 0, delivered: 0, failed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Webhook Simulator states
  const [simSid, setSimSid] = useState('');
  const [simStatus, setSimStatus] = useState('delivered');
  const [simErrorCode, setSimErrorCode] = useState('');
  const [simErrorMsg, setSimErrorMsg] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simLog, setSimLog] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);

  // Fetch Logs & Stats
  const fetchData = async (page: number) => {
    try {
      const offset = (page - 1) * pageSize;
      const response = await axios.get(`http://localhost:5002/api/admin/sms-logs?limit=${pageSize}&offset=${offset}`);
      if (response.status === 200) {
        setLogs(response.data.logs);
        setTotalLogs(response.data.total);
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Failed to load SMS Logs dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Socket.IO realtime connection for live log updates!
  useEffect(() => {
    const socket = io('http://localhost:5002', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] SMS Dashboard connected');
    });

    socket.on('sms_log_update', (payload: any) => {
      console.log('[Socket.IO] SMS update received:', payload);
      // Refresh current page data and stats
      fetchData(currentPage);
      
      // Flash a quick simulator console notification
      setSimLog(prev => [`[REALTIME EVENT] Twilio SID: ${payload.twilioSid} status updated to: ${payload.status}`, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentPage]);

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simSid) {
      alert("Please provide a Twilio SID to simulate.");
      return;
    }
    setSimLoading(true);
    setSimLog(prev => [`Simulating Twilio webhook status "${simStatus}" callback for SID: ${simSid}...`, ...prev]);
    
    try {
      const payload: any = {
        MessageSid: simSid,
        MessageStatus: simStatus
      };
      
      if (simStatus === 'failed' || simStatus === 'undelivered') {
        payload.ErrorCode = simErrorCode || '30008';
        payload.ErrorMessage = simErrorMsg || 'Unknown error delivery timeout';
      }

      const res = await axios.post('http://localhost:5002/api/webhooks/twilio', payload);
      if (res.status === 200) {
        setSimLog(prev => [`✅ Webhook trigger successful! Log updated.`, ...prev]);
      }
    } catch (err: any) {
      setSimLog(prev => [`❌ Webhook trigger failed: ${err.message}`, ...prev]);
    } finally {
      setSimLoading(false);
    }
  };

  const getStatusBadge = (status: SMSLog['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25';
      case 'Sent':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/25';
      case 'Queued':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/25';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/25 animate-pulse';
      default:
        return 'bg-gray-500/10 text-gray-500 border border-gray-500/25';
    }
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  // Delivery rate calculations
  const totalAttempted = stats.sent + stats.delivered + stats.failed;
  const deliveryRate = totalAttempted > 0 ? Math.round((stats.delivered / totalAttempted) * 100) : 0;
  const failureRate = totalAttempted > 0 ? Math.round((stats.failed / totalAttempted) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-[#FF9933]" /> SMS Gateway Operations
          </h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise Twilio monitoring and status callback logging dashboard.</p>
        </div>
        
        <button 
          onClick={() => { setLoading(true); fetchData(currentPage); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-all text-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Dispatched</span>
            <Send className="w-4 h-4" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.total}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">{stats.queued}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-500 mt-2">{stats.delivered}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-rose-500 mt-2">{stats.failed}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Delivery Success</span>
            <Database className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-sky-600">{deliveryRate}%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ratio</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Logs Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-400" /> Audit Ledger logs
          </h2>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold">
                  <th className="p-4">Complaint ID</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF9933] mb-2" />
                      Loading SMS history log...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      No SMS alerts logged. Submit a grievance to trigger notifications.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-[#1E3A8A]">{log.complaintId}</td>
                        <td className="p-4 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                          {log.phoneNumber}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                      {/* Sub-row for SID and Error logs */}
                      <tr className="bg-gray-50/30 text-[11px] text-gray-400 font-mono">
                        <td colSpan={4} className="px-4 py-2 border-b border-gray-50/50">
                          <div className="flex flex-col sm:flex-row justify-between gap-1">
                            <span>Twilio SID: <span className="text-gray-600 font-semibold">{log.twilioSid || 'MOCKED_STANDBY'}</span></span>
                            {log.errorMessage && (
                              <span className="text-rose-500 font-semibold">Error: {log.errorMessage}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500 font-medium">
              <span>Page {currentPage} of {totalPages} ({totalLogs} logs)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Webhook Simulator */}
        <div className="space-y-6">
          <div className="bg-[#1E293B] text-slate-100 p-6 rounded-2xl shadow-xl space-y-6 border border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-[#FF9933]" /> Twilio Webhook Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Trigger mock HTTP status callback events to test delivery logger updates locally.
              </p>
            </div>

            <form onSubmit={handleSimulateWebhook} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Target Twilio SID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={simSid}
                    onChange={(e) => setSimSid(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-[#FF9933] font-mono text-xs"
                    placeholder="e.g. SM068b5773176d6..."
                    required
                  />
                  {logs.length > 0 && (
                    <select
                      onChange={(e) => setSimSid(e.target.value)}
                      value={simSid}
                      className="px-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
                    >
                      <option value="">Recent SIDs...</option>
                      {logs.filter(l => l.twilioSid).map(l => (
                        <option key={l.id} value={l.twilioSid!}>{l.twilioSid!.substring(0, 12)}...</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status callback</label>
                <select
                  value={simStatus}
                  onChange={(e) => setSimStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-[#FF9933] font-semibold text-xs"
                >
                  <option value="delivered">delivered (Delivered)</option>
                  <option value="sent">sent (Sent)</option>
                  <option value="queued">queued (Queued)</option>
                  <option value="failed">failed (Failed)</option>
                  <option value="undelivered">undelivered (Failed)</option>
                </select>
              </div>

              {(simStatus === 'failed' || simStatus === 'undelivered') && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Error Code</label>
                    <input 
                      type="text" 
                      value={simErrorCode}
                      onChange={(e) => setSimErrorCode(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                      placeholder="e.g. 30008"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Error message</label>
                    <input 
                      type="text" 
                      value={simErrorMsg}
                      onChange={(e) => setSimErrorMsg(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                      placeholder="Delivery timeout"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={simLoading}
                className="w-full py-3 bg-[#FF9933] text-white font-bold rounded-xl hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 text-xs"
              >
                {simLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Trigger Status Callback Webhook'}
              </button>
            </form>
          </div>

          {/* Simulator logs terminal */}
          <div className="bg-[#0F172A] text-emerald-400 p-5 rounded-2xl shadow-xl flex flex-col h-[260px] font-mono border border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
              <span className="text-[10px] font-bold text-slate-400">WEBHOOK_SIMULATOR.log</span>
              <button 
                onClick={() => setSimLog([])} 
                className="text-[9px] text-slate-400 hover:text-white border border-slate-700 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] pt-3 pr-2 scrollbar-thin">
              {simLog.length > 0 ? (
                simLog.map((log, i) => (
                  <div key={i} className="leading-relaxed border-b border-slate-800/40 pb-1 break-words">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-center pt-10">
                  Ready. Trigger a callback simulator event above to inspect responses.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
