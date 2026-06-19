"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Sparkles, MapPin, FileText, ShieldAlert, 
  Users, TrendingUp, Lightbulb, Download, Crosshair,
  AlertTriangle, Navigation, CheckCircle2, BarChart3, MessageSquare
} from 'lucide-react';

// =========================================================================
// TYPES & BACKEND-READY INTERFACES
// =========================================================================
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  type?: 'text' | 'chart' | 'table' | 'insight';
  data?: any;
}

type SidebarMode = 'VISIT' | 'BRIEFING' | 'ACCOUNTABILITY' | 'POLICY';

export default function CMCopilotPage() {
  // Chat States
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sidebar States
  const [activeSidebar, setActiveSidebar] = useState<SidebarMode>('BRIEFING');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Good morning, Chief Minister. I am your Governance Copilot. My systems are fully synced with state databases. How can I assist you today? You can ask me to analyze complaints, review officer performance, or generate briefings.',
    }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // =========================================================================
  // BACKEND INTEGRATION HANDLERS
  // =========================================================================
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // API TODO: Send query to your LangChain / LLM Backend
    // const response = await axios.post('/api/copilot/chat', { query: userMsg.text });

    setTimeout(() => {
      setIsTyping(false);
      
      // Mocking a rich AI response based on the prompt
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Water complaints increased by 27% in East Delhi over the last 48 hours. Analyzing the raw data, this is primarily due to repeated pipeline failures near the Shahdara industrial sector.",
        type: 'insight',
        data: {
          insight: "East Delhi Pipeline Degradation",
          recommendation: "Deploy additional maintenance teams to Ward 12 and increase baseline inspections by 15%.",
          impact: "Estimated to prevent 400+ future complaints this week."
        }
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const handleGenerateBriefing = (type: string) => {
    setIsGenerating(type);
    // API TODO: await axios.post('/api/cm/reports/briefing', { type })
    setTimeout(() => setIsGenerating(null), 2000);
  };

  // Quick prompt triggers
  const sendQuickPrompt = (text: string) => {
    setInput(text);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 max-w-[1800px] mx-auto pb-6">
      
      {/* ========================================================= */}
      {/* LEFT PANE: LIVE AI CHAT ASSISTANT */}
      {/* ========================================================= */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="p-5 border-b border-gray-100 bg-linear-to-r from-[#1E3A8A] to-[#0f172a] text-white flex justify-between items-center z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-3 backdrop-blur-md border border-white/20 shadow-inner">
              <Bot className="w-6 h-6 text-[#FF9933]" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-wide flex items-center">
                Live AI Chat Assistant
              </h2>
              <div className="flex items-center text-[10px] font-bold text-[#87CEEB] uppercase tracking-widest mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] mr-1.5 animate-pulse"></span> Systems Online & Listening
              </div>
            </div>
          </div>
          <span className="bg-[#FF9933] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center">
            <MessageSquare className="w-3 h-3 mr-1" /> Ask Anything
          </span>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar for AI messages */}
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center mr-3 shrink-0 mt-1 border border-[#1E3A8A]/20">
                  <Bot className="w-4 h-4 text-[#1E3A8A]" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                
                {/* Standard Text Bubble */}
                <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-linear-to-r from-[#1E3A8A] to-[#254baf] text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>

                {/* AI Rich Data Payload (Insights, Tables, Charts) */}
                {msg.type === 'insight' && msg.data && (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF9933]/10 rounded-bl-full pointer-events-none" />
                    <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-[#FF9933]" /> AI Action Recommendation
                    </h4>
                    <p className="text-sm font-bold text-gray-900 mb-3">{msg.data.recommendation}</p>
                    <div className="bg-white/60 p-2.5 rounded-xl border border-orange-100 flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-2 shrink-0" />
                      <span className="text-xs font-bold text-gray-700">Projected Impact: {msg.data.impact}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center mr-3 shrink-0 mt-1 border border-[#1E3A8A]/20">
                <Bot className="w-4 h-4 text-[#1E3A8A]" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#FF9933] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#87CEEB] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chat Prompts */}
        <div className="px-6 pb-2 pt-4 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {["Show top underperforming departments", "Generate weekly governance report", "Why are complaints increasing in Dwarka?"].map((prompt, i) => (
            <button 
              key={i} onClick={() => sendQuickPrompt(prompt)}
              className="shrink-0 text-[10px] font-black uppercase tracking-wider text-[#1E3A8A] bg-[#87CEEB]/10 border border-[#87CEEB]/30 px-4 py-2 rounded-full hover:bg-[#87CEEB]/20 transition-colors flex items-center"
            >
              <MessageSquare className="w-3 h-3 mr-1.5" /> {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Box */}
        <div className="p-4 bg-white">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI Governance Copilot a question..."
              className="w-full pl-5 pr-14 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#FF9933] focus:ring-0 bg-white text-sm font-bold text-gray-800 transition-colors shadow-inner"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 bg-linear-to-r from-[#FF9933] to-[#FF8C00] text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANE: INTELLIGENCE HUB MODULAR SIDEBAR */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0 h-full">
        
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex overflow-x-auto [&::-webkit-scrollbar]:hidden shrink-0">
          {[
            { id: 'BRIEFING', icon: FileText, label: 'Briefings' },
            { id: 'VISIT', icon: Navigation, label: 'Visit Mode' },
            { id: 'ACCOUNTABILITY', icon: ShieldAlert, label: 'Audits' },
            { id: 'POLICY', icon: Lightbulb, label: 'Policies' }
          ].map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveSidebar(tab.id as SidebarMode)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                activeSidebar === tab.id ? 'bg-[#1E3A8A] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-4 h-4 mb-1 ${activeSidebar === tab.id ? 'text-[#FF9933]' : ''}`} />
              <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Sidebar Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* 1. BRIEFING GENERATOR VIEW */}
            {activeSidebar === 'BRIEFING' && (
              <motion.div key="brief" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 flex flex-col h-full">
                <h3 className="font-black text-[#1E3A8A] text-lg mb-1">Briefing Generator</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Auto-compile governance reports</p>
                
                <div className="space-y-3">
                  {[
                    { id: 'daily', name: 'Daily Morning Brief', desc: 'Overnight closures and critical escalations.' },
                    { id: 'weekly', name: 'Weekly Governance Report', desc: 'Department rankings and trend analysis.' },
                    { id: 'emergency', name: 'Emergency Situation Report', desc: 'Immediate data on active crisis zones.' }
                  ].map((brief) => (
                    <button 
                      key={brief.id} onClick={() => handleGenerateBriefing(brief.id)} disabled={!!isGenerating}
                      className="w-full text-left p-4 rounded-2xl border border-gray-100 hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">{brief.name}</span>
                        {isGenerating === brief.id ? <div className="w-4 h-4 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4 text-gray-300 group-hover:text-[#87CEEB]" />}
                      </div>
                      <p className="text-xs font-medium text-gray-500 pr-6">{brief.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. VISIT INTELLIGENCE VIEW */}
            {activeSidebar === 'VISIT' && (
              <motion.div key="visit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 flex flex-col h-full">
                <h3 className="font-black text-[#1E3A8A] text-lg mb-1 flex items-center"><MapPin className="w-5 h-5 mr-2 text-[#FF9933]" /> Visit Intelligence</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Location-contextual briefings</p>
                
                <div className="relative mb-6">
                  <input type="text" placeholder="Enter visit location (e.g. Dwarka)" defaultValue="Dwarka Sector 12" className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#1E3A8A] bg-gray-50 text-sm font-bold text-[#1E3A8A]" />
                  <button className="absolute right-2 top-2 p-1.5 bg-[#1E3A8A] text-white rounded-lg"><Crosshair className="w-4 h-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-orange-800 tracking-wider mb-2">Nearby Critical Issues</p>
                    <ul className="text-xs font-bold text-orange-900 space-y-2">
                      <li className="flex items-start"><AlertTriangle className="w-3.5 h-3.5 mr-2 shrink-0 text-orange-500 mt-0.5"/> Open transformer near Market Road (Pending 4 days).</li>
                      <li className="flex items-start"><AlertTriangle className="w-3.5 h-3.5 mr-2 shrink-0 text-orange-500 mt-0.5"/> Severe water shortage in Block B.</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-[#1E3A8A] tracking-wider mb-2">Suggested Talking Points</p>
                    <ul className="text-xs font-bold text-blue-900 space-y-2">
                      <li className="flex items-start"><CheckCircle2 className="w-3.5 h-3.5 mr-2 shrink-0 text-blue-500 mt-0.5"/> Announce the approval of the new drainage pipeline for Sector 12.</li>
                      <li className="flex items-start"><CheckCircle2 className="w-3.5 h-3.5 mr-2 shrink-0 text-blue-500 mt-0.5"/> Praise the local RWAs for 90% waste segregation compliance.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. ACCOUNTABILITY INTELLIGENCE VIEW */}
            {activeSidebar === 'ACCOUNTABILITY' && (
              <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 flex flex-col h-full">
                <h3 className="font-black text-[#1E3A8A] text-lg mb-1 flex items-center"><ShieldAlert className="w-5 h-5 mr-2 text-red-500" /> AI Audits</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Officers requiring intervention</p>

                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
                  {[
                    { name: 'Amit Patel', dept: 'Sanitation', risk: 'Critical', reason: 'High reopen rate (45%) & citizen keywords indicating corruption.' },
                    { name: 'Neha Gupta', dept: 'Roads', risk: 'High', reason: 'Geofencing mismatch. Closing cases off-site.' },
                    { name: 'Vikram S.', dept: 'Water', risk: 'High', reason: 'Repeated SLA breaches (>120 hours average).' }
                  ].map((off, i) => (
                    <div key={i} className="p-3 border border-red-100 bg-red-50/30 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 text-sm">{off.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-0.5 rounded">{off.risk} Risk</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{off.dept}</span>
                      <p className="text-xs text-red-900 font-medium leading-tight">{off.reason}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. POLICY RECOMMENDATIONS VIEW */}
            {activeSidebar === 'POLICY' && (
              <motion.div key="policy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 flex flex-col h-full">
                <h3 className="font-black text-[#1E3A8A] text-lg mb-1 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-[#FF9933]" /> Policy Engine</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Algorithmic Resource Allocation</p>

                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1">
                  <div className="p-4 border border-gray-200 rounded-xl hover:border-[#FF9933]/50 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-[#FF9933]/10 flex items-center justify-center text-[#FF8C00] mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm mb-1">Workforce Re-deployment</h4>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">Shift 15% of active field officers from New Delhi to Shahdara to stabilize extreme complaint backlogs.</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-xl hover:border-[#87CEEB]/50 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-[#87CEEB]/10 flex items-center justify-center text-[#87CEEB] mb-3 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm mb-1">Budget Prioritization</h4>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">AI forecast suggests immediate release of emergency funds for Water Infrastructure ahead of monsoon season.</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </motion.div>
  );
}