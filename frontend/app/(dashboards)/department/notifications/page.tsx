"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, AlertTriangle, Clock, ShieldAlert, 
  Check, Trash2, Building2
} from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
type NotificationType = 'SLA_WARNING' | 'CAPACITY_ALERT' | 'ESCALATION' | 'SYSTEM';

interface DeptNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionRequired?: boolean;
}

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_NOTIFICATIONS: DeptNotification[] = [
  {
    id: "notif-d1",
    title: "CM Office Escalation",
    message: "The Chief Minister's Office has requested an urgent status update on the Water Treatment Plant expansion project.",
    type: "ESCALATION",
    isRead: false,
    createdAt: "15 mins ago",
    actionRequired: true
  },
  {
    id: "notif-d2",
    title: "Critical Capacity Warning",
    message: "Officer Anita Sharma (West Delhi) has exceeded 95% workload capacity. Automated assignment is suspended for this officer.",
    type: "CAPACITY_ALERT",
    isRead: false,
    createdAt: "1 hour ago",
    actionRequired: true
  },
  {
    id: "notif-d3",
    title: "SLA Breach Alert: South District",
    message: "12 high-priority complaints in the South District have breached the 24-hour resolution SLA.",
    type: "SLA_WARNING",
    isRead: true,
    createdAt: "Yesterday"
  },
  {
    id: "notif-d4",
    title: "System Maintenance",
    message: "Scheduled backend maintenance will occur on Sunday at 02:00 AM. Reports may be temporarily unavailable.",
    type: "SYSTEM",
    isRead: true,
    createdAt: "Oct 24, 2026"
  }
];

export default function DepartmentNotificationsPage() {
  const [notifications, setNotifications] = useState<DeptNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  // ==========================================
  // BACKEND INTEGRATION HANDLERS
  // ==========================================
  const markAsRead = (id: string) => {
    // API TODO: await axios.put(`/api/department/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    // API TODO: await axios.put(`/api/department/notifications/read-all`);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    // API TODO: await axios.delete(`/api/department/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const filteredNotifications = useMemo(() => {
    if (filter === 'UNREAD') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconConfig = (type: NotificationType) => {
    switch (type) {
      case 'ESCALATION': return { icon: Building2, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" };
      case 'CAPACITY_ALERT': return { icon: AlertTriangle, color: "text-[#FF8C00]", bg: "bg-[#FF9933]/10" };
      case 'SLA_WARNING': return { icon: Clock, color: "text-[#1E3A8A]", bg: "bg-[#87CEEB]/20" };
      case 'SYSTEM': return { icon: ShieldAlert, color: "text-gray-500", bg: "bg-gray-100" };
      default: return { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-[#FF9933]/10 flex items-center justify-center mr-4 border border-[#FF9933]/20">
            <Bell className="w-6 h-6 text-[#FF8C00]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Department Alerts</h1>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              You have <span className="font-bold text-[#FF8C00]">{unreadCount}</span> unread messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 flex-1 sm:flex-none">
            <button 
              onClick={() => setFilter('ALL')}
              className={`flex-1 sm:px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-white text-[#FF8C00] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('UNREAD')}
              className={`flex-1 sm:px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white text-[#FF8C00] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Unread
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2.5 text-sm font-bold text-[#FF8C00] bg-[#FF9933]/10 hover:bg-[#FF9933]/20 border border-[#FF9933]/20 rounded-xl transition-colors shrink-0"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const { icon: Icon, color, bg } = getIconConfig(notif.type);
              
              return (
                <motion.div 
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 ${
                    notif.isRead 
                      ? 'bg-white border-gray-100 shadow-sm' 
                      : 'bg-[#FF9933]/5 border-[#FF9933]/30 shadow-md'
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  {!notif.isRead && (
                    <div className="absolute top-6 left-2 w-2 h-2 rounded-full bg-[#FF8C00]" />
                  )}

                  {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-1 ${notif.isRead ? 'bg-gray-50 text-gray-400' : bg}`}>
                    <Icon className={`w-6 h-6 ${notif.isRead ? 'text-gray-400' : color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                      <h3 className={`text-base font-black truncate pr-4 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs font-bold text-gray-400 whitespace-nowrap mt-1 sm:mt-0 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {notif.createdAt}
                      </span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed mb-4 ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                      {notif.message}
                    </p>

                    {/* Action Badge */}
                    {notif.actionRequired && !notif.isRead && (
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-[#EF4444] text-white shadow-sm">
                        Action Required
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0 justify-end sm:justify-start mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                    {!notif.isRead && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="p-2 text-[#22C55E] hover:bg-[#22C55E]/10 rounded-lg transition-colors flex-1 sm:flex-none flex justify-center items-center"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-1 sm:flex-none flex justify-center items-center sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Check className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Inbox Clear</h3>
              <p className="text-gray-500 font-medium mt-1">
                {filter === 'UNREAD' ? "You have no unread alerts requiring attention." : "Your department alert history is empty."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}