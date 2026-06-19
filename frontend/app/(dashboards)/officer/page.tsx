"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ClipboardList, AlertOctagon, Clock, CheckCircle2, 
  ArrowRight, Users, Activity, Briefcase
} from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
interface OfficerMetrics {
  assigned: number;
  pending: number;
  critical: number;
  overdue: number;
  capacityLimit: number;
  resolvedThisMonth: number;
}

export default function OfficerDashboardOverview() {
  const [metrics, setMetrics] = useState<OfficerMetrics | null>(null);

  useEffect(() => {
    // API TODO: const res = await axios.get('/api/officer/metrics');
    // Mocking API fetch
    setTimeout(() => {
      setMetrics({
        assigned: 42,
        pending: 18,
        critical: 3,
        overdue: 2,
        capacityLimit: 50,
        resolvedThisMonth: 124
      });
    }, 500);
  }, []);

  if (!metrics) {
    return <div className="flex h-64 items-center justify-center text-[#1E3A8A] font-medium animate-pulse">Loading Dashboard Metrics...</div>;
  }

  // Calculate Capacity Percentage
  const capacityPercentage = Math.min(100, Math.round(((metrics.assigned + metrics.pending) / metrics.capacityLimit) * 100));
  const capacityColor = capacityPercentage > 90 ? 'bg-[#EF4444]' : capacityPercentage > 70 ? 'bg-[#FF9933]' : 'bg-[#22C55E]';

  const TOP_CARDS = [
    { title: "Total Assigned", value: metrics.assigned, icon: ClipboardList, color: "text-[#1E3A8A]", bg: "bg-[#1E3A8A]/10" },
    { title: "Pending Action", value: metrics.pending, icon: Clock, color: "text-[#FF9933]", bg: "bg-[#FF9933]/10" },
    { title: "Critical / Emergency", value: metrics.critical, icon: AlertOctagon, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
    { title: "Overdue SLAs", value: metrics.overdue, icon: Activity, color: "text-gray-500", bg: "bg-gray-100" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1E3A8A]">Officer Operations Center</h2>
        <p className="text-sm text-gray-500 mt-1">Good morning, Rajeev. Here is your current workload status.</p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {TOP_CARDS.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              {/* Decorative corner background */}
              <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${card.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900">{card.value}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workload & Capacity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Capacity Bar */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-[#FF9933]" /> Workload Capacity
            </h3>
            <span className="text-sm font-bold text-gray-600">{capacityPercentage}% Utilized</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${capacityPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-4 rounded-full ${capacityColor}`}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            You are currently handling <span className="font-bold text-[#1E3A8A]">{metrics.assigned + metrics.pending}</span> out of your maximum capacity of {metrics.capacityLimit} concurrent cases.
            {capacityPercentage > 90 && <span className="text-[#EF4444] block mt-1">Warning: Approaching maximum load. Automatic assignment throttling activated.</span>}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{metrics.resolvedThisMonth}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Resolved This Month</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#87CEEB]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#87CEEB]" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">4.2 Hrs</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Avg. Response Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-linear-to-br from-[#1E3A8A] to-[#2a4eab] p-6 sm:p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Needs Immediate Action</h3>
            <p className="text-sm text-blue-100 opacity-90 leading-relaxed mb-6">
              You have {metrics.critical} critical cases and {metrics.overdue} overdue SLAs that require your immediate intervention before they escalate to the CM office.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/officer/critical" className="w-full flex justify-between items-center px-4 py-3 bg-[#EF4444] hover:bg-red-600 rounded-xl transition-colors font-medium">
              View Critical Cases <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/officer/assigned" className="w-full flex justify-between items-center px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors font-medium">
              View All Assigned <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </motion.div>
  );
}