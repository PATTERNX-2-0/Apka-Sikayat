"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ClipboardList, AlertOctagon, BarChart3, 
  User, Settings, LogOut, Shield, Bell 
} from 'lucide-react';

const OFFICER_LINKS = [
  { name: 'Dashboard', href: '/officer', icon: LayoutDashboard },
  { name: 'Assigned', href: '/officer/assigned', icon: ClipboardList },
  { name: 'Critical', href: '/officer/critical', icon: AlertOctagon },
  { name: 'Analytics', href: '/officer/analytics', icon: BarChart3 },
];

const TopRightActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center space-x-2 sm:space-x-4 relative" ref={menuRef}>
      {/* Notifications */}
      <Link href="/officer/notifications" className="relative p-2 text-gray-500 hover:text-[#FF9933] transition-colors rounded-full hover:bg-[#FF9933]/10">
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
      </Link>

      {/* Profile Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-r from-[#1E3A8A] to-[#2a4eab] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
      >
        DO
      </button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 sm:top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100]"
          >
            <div className="p-4 border-b border-gray-50 bg-[#F8FAFC]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#1E3A8A] px-2 py-0.5 rounded-full">District Officer</span>
              </div>
              <p className="text-sm font-bold text-[#1E3A8A]">Rajeev Kumar</p>
              <p className="text-xs text-gray-500 truncate">South Delhi • Dept of Water</p>
            </div>
            <div className="p-2 space-y-1">
              <Link href="/officer/profile" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-xl hover:bg-[#87CEEB]/10 hover:text-[#1E3A8A] transition-colors">
                <User className="w-4 h-4 mr-3" /> My Profile
              </Link>
            </div>
            <div className="p-2 border-t border-gray-50">
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4 mr-3" /> Sign Out
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== '/officer' && pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 shadow-sm fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-50 h-20">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#1E3A8A] to-[#2a4eab] flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#1E3A8A] leading-tight">Apka Sikayat</h1>
            <p className="text-xs font-semibold text-[#FF9933] uppercase tracking-wider">Officer Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {OFFICER_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all font-medium text-sm ${
                  active 
                  ? 'bg-linear-to-r from-[#1E3A8A]/5 to-[#87CEEB]/10 text-[#1E3A8A] border border-[#1E3A8A]/10 shadow-sm font-bold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#1E3A8A]'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${active ? 'text-[#FF9933]' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen relative">
        
        {/* DESKTOP TOP HEADER */}
        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 items-center justify-end px-8 sticky top-0 z-30 shadow-sm">
          <TopRightActions />
        </header>

        {/* MOBILE TOP HEADER */}
        <header className="md:hidden fixed top-0 w-full h-16 bg-white border-b border-gray-100 shadow-sm z-40 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-[#1E3A8A]" />
            <span className="font-bold text-[#1E3A8A]">Officer Portal</span>
          </div>
          <TopRightActions />
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pt-20 md:pt-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 z-50 flex justify-around shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] pb-safe">
        {OFFICER_LINKS.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full py-2.5 transition-colors ${
                active ? 'text-[#1E3A8A]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl mb-1 transition-all ${active ? 'bg-[#1E3A8A]/10 scale-110' : 'bg-transparent'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-center">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}