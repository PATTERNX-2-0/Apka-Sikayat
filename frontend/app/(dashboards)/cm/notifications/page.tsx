"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, ShieldAlert, AlertTriangle, Settings, 
  CheckCircle2, Trash2, Check, Clock, Flame, Info
} from 'lucide-react';

// =========================================================================
// TYPESCRIPT INTERFACES
// =========================================================================
type NotifType = 'CRITICAL' | 'ESCALATION' | 'SYSTEM' | 'INFO';

interface CMNotification {
  id: string;
  title: string;
  message: string;
  type: NotifType;
  time: string;
  isRead: boolean;
  actionRequired?: boolean;
}

// =========================================================================
// BACKEND-READY MOCK DATA
// =========================================================================
const INITIAL_NOTIFICATIONS: CMNotification[] = [
  {
    id: "NOTIF-001",
    type: "CRITICAL",
    title: "AI Alert: Imminent Infrastructure Risk",
    message: "Prediction engine forecasts 85% chance of severe waterlogging in East Delhi within 48 hours due to unseasonal rain patterns.",
    time: "10 mins ago",
    isRead: false,
    actionRequired: true
  },
  {
    id: "NOTIF-002",
    type: "ESCALATION",
    title: "Department SLA Breach",
    message: "Road Infrastructure department has breached the 72-hour SLA for 45+ critical complaints in Shahdara district.",
    time: "1 hour ago",
    isRead: false,
    actionRequired: true
  },
  {
    id: "NOTIF-003",
    type: "SYSTEM",
    title: "Nightly Data Sync Completed",
    message: "All district and departmental nodes have successfully synced with the master database. 1,245 new records processed.",
    time: "4 hours ago",
    isRead: true
  },
  {
    id: "NOTIF-004",
    type: "CRITICAL",
    title: "Citizen Trust Index Drop",
    message: "Overall Delhi CSAT score has dropped by 1.2 points in the last 24 hours following the North West power outage.",
    time: "Yesterday, 14:30",
    isRead: true
  },
  {
    id: "NOTIF-005",
    type: "INFO",
    title: "Weekly Executive Report Generated",
    message: "Your master executive summary for week 42 is ready for download in the Reports archive.",
    time: "Yesterday, 09:00",
    isRead: true
  }
];

export default function CMNotificationsPage() {
  const [notifications, setNotifications] = useState<CMNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');

  // =========================================================================
  // BACKEND INTEGRATION HANDLERS
  // =========================================================================
  const handleMarkAsRead = (id: string) => {
    // API TODO: await axios.put(`/api/cm/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    // API TODO: await axios.put(`/api/cm/notifications/read-all`);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    // API TODO: await axios.delete(`/api/cm/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // =========================================================================
  // UI HELPERS
  // =========================================================================
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'UNREAD') return notifications.filter(n => !n.isRead);
    if (activeTab === 'CRITICAL') return notifications.filter(n => n.type === 'CRITICAL');
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconConfig = (type: NotifType) => {
    switch (type) {
      case 'CRITICAL': return { icon: Flame, color: "text-red-600", bg: "bg-red-100", border: "border-red-200" };
      case 'ESCALATION': return { icon: AlertTriangle, color: "text-[#FF8C00]", bg: "bg-[#FF9933]/20", border: "border-[#FF9933]/30" };
      case 'SYSTEM': return { icon: Settings, color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" };
      case 'INFO': return { icon: Info, color: "text-[#87CEEB]", bg: "bg-[#87CEEB]/20", border: "border-[#87CEEB]/30" };
      default: return { icon: Bell, color: "text-[#1E3A8A]", bg: "bg-blue-100", border: "border-blue-200" };
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#1E3A8A] to-[#0f172a] flex items-center justify-center shadow-lg relative">
            <Bell className="w-7 h-7 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1E3A8A] tracking-tight">Executive Alerts</h1>
            <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">
              You have <span className="text-[#FF9933]">{unreadCount} unread</span> priority messages
            </p>
          </div>
        </div>

        <button 
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="w-full md:w-auto px-6 py-2.5 bg-gray-50 text-[#1E3A8A] font-black text-xs uppercase tracking-widest rounded-xl border border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* TABS */}
        <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 p-2 [&::-webkit-scrollbar]:hidden">
          {(['ALL', 'UNREAD', 'CRITICAL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === tab 
                  ? 'bg-[#1E3A8A] text-white shadow-md' 
                  : 'text-gray-500 hover:text-[#1E3A8A] hover:bg-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NOTIFICATION LIST */}
        <div className="flex-1 p-4 md:p-6 space-y-4 bg-gray-50/30">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const { icon: Icon, color, bg, border } = getIconConfig(notif.type);
                
                return (
                  <motion.div 
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative p-5 md:p-6 rounded-2xl border-2 transition-all flex flex-col sm:flex-row gap-4 sm:gap-6 ${
                      notif.isRead 
                        ? 'bg-white border-gray-100 shadow-xs' 
                        : 'bg-white border-[#FF9933]/40 shadow-md'
                    }`}
                  >
                    {/* Unread Saffron Indicator */}
                    {!notif.isRead && (
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-12 rounded-r-full bg-[#FF9933]" />
                    )}

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${notif.isRead ? 'bg-gray-50 border-gray-100 text-gray-400' : `${bg} ${border}`}`}>
                      <Icon className={`w-6 h-6 ${notif.isRead ? 'text-gray-400' : color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <h3 className={`text-base font-black pr-4 leading-tight ${notif.isRead ? 'text-gray-600' : 'text-[#1E3A8A]'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap flex items-center uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          <Clock className="w-3 h-3 mr-1" /> {notif.time}
                        </span>
                      </div>
                      
                      <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-500 font-medium' : 'text-gray-700 font-bold'}`}>
                        {notif.message}
                      </p>

                      {/* Action Badges */}
                      {notif.actionRequired && !notif.isRead && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                            Take Action
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions (Read / Delete) */}
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 justify-end sm:justify-start mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                      {!notif.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center p-2 text-[#22C55E] bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors tooltip-trigger"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(notif.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center p-2 text-gray-400 bg-gray-50 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        title="Delete alert"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              /* EMPTY STATE */
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Inbox Clear</h3>
                <p className="text-sm font-bold text-gray-500 mt-2 max-w-sm">
                  {activeTab === 'UNREAD' 
                    ? "You have acknowledged all executive alerts." 
                    : activeTab === 'CRITICAL'
                    ? "There are no critical structural threats at this time."
                    : "Your executive notification history is completely empty."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}