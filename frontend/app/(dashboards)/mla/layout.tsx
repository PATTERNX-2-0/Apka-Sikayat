"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Map, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MLALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative overflow-hidden">
      
      {/* Sidebar navigation */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-100 h-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#2a4eab] flex items-center justify-center shadow-lg shadow-[#1E3A8A]/30 border border-blue-500">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-[#1E3A8A] leading-none tracking-tight">MLA Portal</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Constituency Room</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <Link
            href="/mla"
            className={`flex items-center px-4 py-3.5 rounded-xl transition-all font-bold text-sm bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/20`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3 text-[#FF9933]" />
            Dashboard Center
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link 
            href="/login" 
            className="flex items-center px-4 py-3.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Secure Logout
          </Link>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen relative overflow-y-auto pb-12">
        <header className="hidden md:flex h-24 bg-white/90 backdrop-blur-xl border-b border-gray-200 items-center justify-between px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-3"></div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Telemetry Status: <span className="text-green-600">Active</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-black text-[#1E3A8A]">MLA Command Office</p>
              <p className="text-xs text-gray-500">Assembly Representative</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FF9933] text-white flex items-center justify-center font-bold text-sm shadow-md">
              MLA
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-8 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
