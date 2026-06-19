"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Layers, 
  BarChart3, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Smartphone, 
  Building2, 
  MapPin, 
  Menu, 
  X 
} from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E3A8A]">
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9933] to-[#87CEEB] flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1E3A8A]">APKA SIKAYAT</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 font-medium text-sm text-gray-600">
              <a href="#features" className="hover:text-[#FF9933] transition-colors">Features</a>
              <a href="#workflow" className="hover:text-[#FF9933] transition-colors">How It Works</a>
              <a href="#stats" className="hover:text-[#FF9933] transition-colors">Impact Analytics</a>
              <Link href="/login" className="hover:text-[#1E3A8A] transition-colors">Sign In</Link>
              <Link href="/register" className="px-4 py-2 rounded-xl bg-[#1E3A8A] text-white hover:bg-[#FF9933] transition-all shadow-sm">
                Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-3 shadow-lg">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600 font-medium">Features</a>
            <a href="#workflow" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600 font-medium">How It Works</a>
            <a href="#stats" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600 font-medium">Impact Analytics</a>
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
              <Link href="/login" className="text-center py-2 text-gray-600 font-medium">Sign In</Link>
              <Link href="/register" className="text-center py-2.5 rounded-xl bg-[#1E3A8A] text-white font-medium">Register</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-to-bl from-[#FF9933]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#87CEEB]/20 to-transparent blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FF9933]/10 text-[#FF9933] mb-6 border border-[#FF9933]/20">
              Next-Generation Public Grievance Architecture
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-[#1E3A8A] via-[#FF9933] to-[#1E3A8A] bg-clip-text text-transparent leading-tight max-w-4xl mx-auto">
              AI-Powered CM Grievance Intelligence Platform
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Bridging the gap between citizens and administration through modern machine intelligence, real-time tracking, and automated institutional accountability.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#FFC266] text-white font-semibold shadow-lg shadow-[#FF9933]/20 hover:opacity-95 transition-all flex items-center justify-center group">
                File a Complaint <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-gray-200 text-[#1E3A8A] font-semibold hover:bg-gray-50 transition-all flex items-center justify-center">
                Officer Portal Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#1E3A8A] sm:text-4xl">Platform Capabilities</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Engineered to eliminate administrative delays and maintain absolute tracking precision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9933]/10 flex items-center justify-center text-[#FF9933] mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Intelligent AI Routing</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Automatically analyzes grievance context to safely categorize and dispatch it directly to the exact department holding correct jurisdiction.</p>
            </div>
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#87CEEB]/10 flex items-center justify-center text-[#1E3A8A] mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Geospatial Mapping</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Maps live grievance coordinates to locate multi-incident failure zones, enabling accurate community hot-spot interventions.</p>
            </div>
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Executive Visibility</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Provides high-level dashboard feeds to the central leadership framework, displaying officer performance and automated resolution tracking metrics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATISTICS */}
      <section id="stats" className="py-16 bg-gradient-to-r from-[#1E3A8A] to-[#14285F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-[#FF9933]">94%</p>
              <p className="mt-2 text-sm text-gray-300 font-medium">SLA Resolution Rate</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-[#87CEEB]">2.4 hrs</p>
              <p className="mt-2 text-sm text-gray-300 font-medium">Avg. Initial Response</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-white">45+</p>
              <p className="mt-2 text-sm text-gray-300 font-medium">Integrated Departments</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-[#FFC266]">250k+</p>
              <p className="mt-2 text-sm text-gray-300 font-medium">Grievances Processed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GOVERNMENT MISSION */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md mb-6 text-[#FF9933]">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mb-6">Transparent Governance Commitment</h2>
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto text-sm sm:text-base">
            "The metric of effective leadership is determined by how swiftly an administrative grid listens, adapts, and implements relief mechanics for its public sphere. Apka Sikayat translates governance objectives directly into actionable technology, removing legacy bottlenecks completely to uphold citizen accountability."
          </p>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-xs">AS</div>
            <span className="font-bold text-sm tracking-tight text-[#1E3A8A]">APKA SIKAYAT © 2026</span>
          </div>
          <p className="text-xs text-gray-400">Designed for advanced civic engineering and systemic public infrastructure optimization.</p>
        </div>
      </footer>
    </div>
  );
}