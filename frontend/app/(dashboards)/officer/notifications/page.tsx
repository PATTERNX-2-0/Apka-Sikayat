"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, AlertOctagon, ClipboardList, Clock, 
  Check, Trash2, ShieldAlert
} from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
type NotificationType = 'NEW_ASSIGNMENT' | 'SLA_BREACH' | 'SYSTEM_ALERT';

interface OfficerNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  complaintId?: string;
  isEmergency?: boolean;
}

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_NOTIFICATIONS: OfficerNotification[] = [
  {
    id: "notif-o1",
    title: "CRITICAL: SLA Breached",
    message: "Complaint CMP-1039 (Traffic light malfunction) has exceeded the 48-hour resolution SLA. Immediate action required.",
    type: "SLA_BREACH",
    isRead: false,
    createdAt: "10 mins ago",
    complaintId: "CMP-1039",
    isEmergency: true
  },
  {
    id: "notif-o2",
    title: "New Case Assigned",
    message: "A new High Priority case (CMP-1042) regarding severe waterlogging has been added to your queue.",
    type: "NEW_ASSIGNMENT",
    isRead: false,
    createdAt: "1 hour ago",
    complaintId: "CMP-1042"
  },
  {
    id: "notif-o3",
    title: "System Update",
    message: "The Apka Sikayat backend will undergo routine maintenance tonight at 02:00 AM. Expect 15 minutes of downtime.",
    type: "SYSTEM_ALERT",
    isRead: true,
    createdAt: "Yesterday"
  }
];

export default function OfficerNotificationsPage() {
  const [notifications, setNotifications] = useState<OfficerNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const markAsRead = (id: string) => {
    // API TODO: await axios.put(`/api/officer/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    // API TODO: await axios.put(`/api/officer/notifications/read-all`);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    // API TODO: await axios.delete(`/api/officer/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'UNREAD') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconConfig = (type: NotificationType, isEmergency?: boolean) => {
    if (isEmergency) return { icon: AlertOctagon, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" };
    switch (type) {
      case 'NEW_ASSIGNMENT': return { icon: ClipboardList, color: "text-[#1E3A8A]", bg: "bg-[#1E3A8A]/10" };
      case 'SLA_BREACH': return { icon: Clock, color: "text-[#FF9933]", bg: "bg-[#FF9933]/10" };
      case 'SYSTEM_ALERT': return { icon: ShieldAlert, color: "text-[#87CEEB]", bg: "bg-[#87CEEB]/10" };
      default: return { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center mr-4">
            <Bell className="w-6 h-6 text-[#1E3A8A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A8A]">Dispatch Alerts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              You have <span className="font-bold text-[#EF4444]">{unreadCount}</span> pending alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 flex-1 sm:flex-none">
            <button onClick={() => setFilter('ALL')} className={`flex-1 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'ALL' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              All
            </button>
            <button onClick={() => setFilter('UNREAD')} className={`flex-1 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="px-4 py-2.5 text-sm font-medium text-[#1E3A8A] bg-[#87CEEB]/10 hover:bg-[#87CEEB]/20 rounded-xl transition-colors shrink-0">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const { icon: Icon, color, bg } = getIconConfig(notif.type, notif.isEmergency);
              return (
                <motion.div 
                  key={notif.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98, x: -20 }} transition={{ duration: 0.2 }}
                  className={`group relative p-5 rounded-2xl border transition-all flex gap-4 sm:gap-5 ${
                    notif.isRead ? 'bg-white border-gray-100 shadow-sm' : notif.isEmergency ? 'bg-[#EF4444]/5 border-[#EF4444]/30 shadow-md' : 'bg-[#FF9933]/5 border-[#FF9933]/30 shadow-md'
                  }`}
                >
                  {!notif.isRead && <div className={`absolute top-6 left-2 w-2 h-2 rounded-full ${notif.isEmergency ? 'bg-[#EF4444]' : 'bg-[#FF9933]'}`} />}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${notif.isRead ? 'bg-gray-50 text-gray-400' : bg}`}>
                    <Icon className={`w-5 h-5 ${notif.isRead ? 'text-gray-400' : color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                      <h3 className={`text-base font-bold truncate pr-4 ${notif.isRead ? 'text-gray-700' : notif.isEmergency ? 'text-[#EF4444]' : 'text-[#1E3A8A]'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs font-medium text-gray-400 whitespace-nowrap mt-1 sm:mt-0 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {notif.createdAt}
                      </span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed mb-3 ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                      {notif.message}
                    </p>

                    {notif.complaintId && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-white text-[#1E3A8A] border border-gray-200 shadow-sm">
                        CASE: {notif.complaintId}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    {!notif.isRead && (
                      <button onClick={() => markAsRead(notif.id)} className="p-2 text-[#22C55E] hover:bg-[#22C55E]/10 rounded-lg transition-colors" title="Mark as read">
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notif.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#1E3A8A]">Inbox Clear</h3>
              <p className="text-gray-500 mt-1">You have no pending alerts or assignments.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}