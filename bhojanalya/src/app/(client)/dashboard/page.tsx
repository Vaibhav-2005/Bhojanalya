"use client";

import { useState } from "react";
import { PlusCircle, Eye, Search, Calendar, ArrowUpRight, Wallet, Users, BarChart3, PieChart, ShoppingBag, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  
  // false = Gray/Locked State | true = Registered State
  const [isRegistered, setIsRegistered] = useState(false); 

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans text-slate-900 selection:bg-[#471396]/10">
      
      {/* 1. Header & Controls - Centered Spacing */}
      <div className="max-w-5xl mx-auto pt-16 px-12">
        <div className="flex justify-between items-start mb-16">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Monitor health of<br/>your business
            </h1>
            <p className="text-slate-400 text-sm font-semibold tracking-wide">
              Control and analyze your data in the easiest way
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-8">
            {/* Action Toggle Button using /preview and /register */}
            <button 
              onClick={() => router.push(isRegistered ? "/preview" : "/register")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-slate-200/50 ${
                isRegistered 
                ? "bg-slate-900 text-white hover:bg-black" 
                : "bg-[#FFCC00] text-[#471396] hover:brightness-105"
              }`}
            >
              {isRegistered ? (
                <><Eye size={16} strokeWidth={2.5} /> Preview Shop</>
              ) : (
                <><PlusCircle size={16} strokeWidth={2.5} /> Register Restaurant</>
              )}
            </button>

            {/* Utility Bar */}
            <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border border-slate-200/50 shadow-sm">
              <Search size={18} className="text-slate-300 ml-2" />
              <input 
                type="text" 
                placeholder="Search metrics..." 
                className="bg-transparent text-xs font-bold outline-none w-32 placeholder:text-slate-300" 
              />
              <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                <Calendar size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Symmetrical Geometric Card Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ease-in-out ${
          !isRegistered ? "opacity-30 grayscale blur-[3px] pointer-events-none scale-[0.98]" : "opacity-100 scale-100"
        }`}>
          
          {/* Card 1: Revenue */}
          <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-8 h-72 flex flex-col justify-between shadow-sm group hover:shadow-2xl transition-all">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#471396]">
                   <Wallet size={20} />
                </div>
                <ArrowUpRight size={18} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter">$42,850</p>
             </div>
          </div>

          {/* Card 2: Clients */}
          <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-8 h-72 flex flex-col justify-between shadow-sm group hover:shadow-2xl transition-all">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#471396]">
                   <Users size={20} />
                </div>
                <ArrowUpRight size={18} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Clients</p>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter">842</p>
             </div>
          </div>

          {/* Card 3: Orders */}
          <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-8 h-72 flex flex-col justify-between shadow-sm group hover:shadow-2xl transition-all">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#471396]">
                   <ShoppingBag size={20} />
                </div>
                <ArrowUpRight size={18} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Purchases</p>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter">1,204</p>
             </div>
          </div>

          {/* Card 4: Analysis */}
          <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-8 h-72 flex flex-col justify-between shadow-sm">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#471396]">
                   <BarChart3 size={20} />
                </div>
                <div className="text-green-500 text-[10px] font-bold bg-green-50 px-2 py-1 rounded-lg">+12.5%</div>
             </div>
             <div className="flex items-end gap-1.5 h-20 mb-2">
                {[30, 60, 45, 90, 55, 75, 50].map((h, i) => (
                   <div key={i} className="flex-1 bg-slate-100 rounded-t-lg hover:bg-[#471396]/20 transition-colors" style={{ height: `${h}%` }} />
                ))}
             </div>
          </div>

          {/* Card 5: Processing/Status */}
          <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-8 h-72 flex flex-col justify-center items-center shadow-sm">
             <div className="w-20 h-20 rounded-full border-[6px] border-slate-50 border-t-[#471396]/10 animate-spin" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-8">Analyzing</p>
          </div>

          {/* Card 6: Health Shell */}
          <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-8 h-72 flex flex-col justify-between shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                <Settings2 size={20} />
             </div>
             <div className="space-y-4">
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                   <div className="h-full w-4/5 bg-[#471396]/10" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health: 80%</p>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Dev Toggle for State Testing */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 z-[200]">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Dev Mode:</span>
        <button 
          onClick={() => setIsRegistered(!isRegistered)}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
            isRegistered ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
          }`}
        >
          {isRegistered ? "Active" : "Locked"}
        </button>
      </div>
    </div>
  );
}