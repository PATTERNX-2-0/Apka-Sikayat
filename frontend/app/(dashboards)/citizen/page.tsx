"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle2, Clock, ArrowRight, Plus } from 'lucide-react';

// Mock Data for Dashboard Cards
const METRICS = [
  { title: "Total Complaints", value: "12", icon: FileText, color: "text-[#1E3A8A]", bg: "bg-[#1E3A8A]/10" },
  { title: "Active Issues", value: "3", icon: Clock, color: "text-[#FF9933]", bg: "bg-[#FF9933]/10" },
  { title: "Resolved", value: "8", icon: CheckCircle2, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  { title: "Escalated", value: "1", icon: AlertCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
];

export default function CitizenDashboardOverview() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E3A8A]">Welcome, Rahul</h2>
          <p className="text-sm text-gray-500 mt-1">Here is a summary of your civic requests.</p>
        </div>
        <Link 
          href="/citizen/submit" 
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FFC266] text-white font-medium shadow-md shadow-[#FF9933]/20 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Complaint
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {METRICS.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metric.bg}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-sm font-medium text-gray-500 mt-1">{metric.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Mini-Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1E3A8A]">Recent Complaints</h3>
          <Link href="/citizen/history" className="text-sm font-medium text-[#87CEEB] hover:text-[#1E3A8A] transition-colors flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8FAFC] text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Complaint ID</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-[#1E3A8A]">CMP-1001</td>
                <td className="px-6 py-4 text-gray-600">Water Supply</td>
                <td className="px-6 py-4 text-gray-500">Oct 24, 2026</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FF9933]/10 text-[#FF9933]">
                    In Progress
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-[#1E3A8A]">CMP-0984</td>
                <td className="px-6 py-4 text-gray-600">Street Light</td>
                <td className="px-6 py-4 text-gray-500">Oct 20, 2026</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#22C55E]/10 text-[#22C55E]">
                    Resolved
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}