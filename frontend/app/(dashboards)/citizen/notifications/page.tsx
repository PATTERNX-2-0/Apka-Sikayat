"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, AlertCircle, Clock, 
  MessageSquare, Check, Trash2, ShieldCheck 
} from 'lucide-react';

// ==========================================
// 1. TYPES (Backend Readiness)
// ==========================================
// Define these to match your future Mongoose Schema exactly
type NotificationType = 'STATUS_UPDATE' | 'ALERT' | 'SYSTEM' | 'MESSAGE';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  complaintId?: string;
}

// ==========================================
// 2. MOCK DATA
// ==========================================
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Complaint Resolved",
    message: "Your complaint regarding 'Streetlights not working' (CMP-1005) has been marked as resolved by the assigned officer.",
    type: "STATUS_UPDATE",
    isRead: false,
    createdAt: "Just now",
    complaintId: "CMP-1005"
  },
  {
    id: "notif-2",
    title: "Officer Assigned",
    message: "Rajeev Kumar (Delhi Jal Board) has been assigned to your waterlogging complaint.",
    type: "STATUS_UPDATE",
    isRead: false,
    createdAt: "2 hours ago",
    complaintId: "CMP-1001"
  },
  {
    id: "notif-3",
    title: "Weather Advisory",
    message: "Heavy rainfall expected in South Delhi. Please report any severe waterlogging immediately.",
    type: "ALERT",
    isRead: true,
    createdAt: "Yesterday"
  },
  {
    id: "notif-4",
    title: "Feedback Requested",
    message: "We would love to hear your feedback on how we handled your recent complaint (CMP-1003).",
    type: "MESSAGE",
    isRead: true,
    createdAt: "Oct 20, 2026",
    complaintId: "CMP-1003"
  }
];

export default function NotificationsPage() {
  // ==========================================
  // 3. STATE (Swap with API later)
  // ==========================================
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  // ==========================================
  // 4. HANDLERS (Connect to API later)
  // ==========================================
  const markAsRead = (id: string) => {
    // API TODO: await axios.put(`/api/notifications/${id}/read`);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    // API TODO: await axios.put(`/api/notifications/read-all`);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    // API TODO: await axios.delete(`/api/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ==========================================
  // 5. HELPERS
  // ==========================================
  const filteredNotifications = useMemo(() => {
    if (filter === 'UNREAD') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'STATUS_UPDATE': return <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />;
      case 'ALERT': return <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
      case 'MESSAGE': return <MessageSquare className="w-5 h-5 text-[#87CEEB]" />;
      case 'SYSTEM': return <ShieldCheck className="w-5 h-5 text-[#1E3A8A]" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
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
            <h1 className="text-2xl font-bold text-[#1E3A8A]">Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              You have <span className="font-bold text-[#FF9933]">{unreadCount}</span> unread messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Tabs */}
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 flex-1 sm:flex-none">
            <button 
              onClick={() => setFilter('ALL')}
              className={`flex-1 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'ALL' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('UNREAD')}
              className={`flex-1 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Unread
            </button>
          </div>
          
          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2.5 text-sm font-medium text-[#1E3A8A] bg-[#87CEEB]/10 hover:bg-[#87CEEB]/20 rounded-xl transition-colors shrink-0"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <motion.div 
                key={notif.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`group relative p-5 rounded-2xl border transition-all flex gap-4 sm:gap-5 ${
                  notif.isRead 
                    ? 'bg-white border-gray-100 shadow-sm' 
                    : 'bg-[#FF9933]/5 border-[#FF9933]/30 shadow-md'
                }`}
              >
                {/* Unread Indicator Dot */}
                {!notif.isRead && (
                  <div className="absolute top-6 left-2 w-2 h-2 rounded-full bg-[#FF9933]" />
                )}

                {/* Icon Container */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${notif.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                  {getIconForType(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                    <h3 className={`text-base font-bold truncate pr-4 ${notif.isRead ? 'text-[#1E3A8A]' : 'text-[#1E3A8A]'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap mt-1 sm:mt-0 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {notif.createdAt}
                    </span>
                  </div>
                  
                  <p className={`text-sm leading-relaxed mb-3 ${notif.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {notif.message}
                  </p>

                  {/* Badges / Links */}
                  {notif.complaintId && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                      ID: {notif.complaintId}
                    </span>
                  )}
                </div>

                {/* Actions (Hidden on mobile unless unread, hover on desktop) */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 text-[#FF9933] hover:bg-[#FF9933]/10 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    title="Delete notification"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#1E3A8A]">You're all caught up!</h3>
              <p className="text-gray-500 mt-1">
                {filter === 'UNREAD' ? "You have no unread notifications right now." : "You don't have any notifications yet."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}