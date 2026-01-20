"use client";

import { useState } from "react";
import { 
  PlusCircle, Eye, Search, Calendar, ArrowUpRight, 
  Wallet, Users, BarChart3, ShoppingBag, Activity, 
  CreditCard, TrendingUp, Lock 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false); 

  // --- NEW: Handle Preview Click ---
  const handleActionClick = () => {
    if (isRegistered) {
      // Open /preview in a new tab ("_blank")
      window.open("/preview", "_blank");
    } else {
      // Normal navigation for registration
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans selection:bg-[#471396]/10">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#F8F9FB]/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/60 shadow-sm focus-within:border-[#471396]/50 transition-colors">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent text-xs font-semibold outline-none w-48 placeholder:text-slate-300" 
            />
            <span className="text-[10px] text-slate-300 font-mono border border-slate-100 rounded px-1">⌘K</span>
          </div>
          <button className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:bg-slate-50 text-slate-500">
            <Calendar size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-8 px-8 pb-20 max-w-7xl mx-auto">
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[180px]">
          
          {/* 1. HERO CARD: Total Revenue (2x2) */}
          <div className={`md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-sm transition-all duration-500 ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Wallet size={120} className="text-[#471396]" />
            </div>
            
            <div className="h-full flex flex-col justify-between p-8 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#471396]">
                  <Wallet size={24} />
                </div>
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold flex items-center gap-1">
                  <TrendingUp size={12} /> +24.5%
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Revenue</h3>
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
                  $42,850<span className="text-slate-300 text-4xl">.00</span>
                </h2>
              </div>
              
              <div className="flex items-end gap-1 h-12 mt-4 opacity-50">
                {[40, 70, 45, 90, 60, 80, 50, 95, 60, 40, 70, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#471396] rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* 2. ACTION CARD: Register/Preview (2x1) */}
          <div className="md:col-span-2 md:row-span-1 rounded-[2.5rem] overflow-hidden relative shadow-lg shadow-purple-900/5">
            <div className={`absolute inset-0 z-0 ${isRegistered ? "bg-[#2e0561]" : "bg-[#FFCC00]"}`} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 h-full flex items-center justify-between p-8">
              <div className={isRegistered ? "text-white" : "text-[#2e0561]"}>
                <h3 className="text-2xl font-black mb-1">
                  {isRegistered ? "Store is Live" : "Complete Setup"}
                </h3>
                <p className={`text-xs font-medium opacity-80 max-w-[250px] ${isRegistered ? "text-purple-200" : "text-purple-900"}`}>
                  {isRegistered 
                    ? "Manage your orders and view your live storefront." 
                    : "Register your restaurant to unlock the full dashboard."}
                </p>
              </div>

              <button 
                onClick={handleActionClick} // Updated Click Handler
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl ${
                  isRegistered 
                  ? "bg-white text-[#2e0561]" 
                  : "bg-[#2e0561] text-white"
                }`}
              >
                {isRegistered ? (
                  <><Eye size={16} /> View Shop</>
                ) : (
                  <><PlusCircle size={16} /> Register Now</>
                )}
              </button>
            </div>
          </div>

          {/* 3. METRIC: Total Clients (1x1) */}
          <div className={`md:col-span-1 md:row-span-1 bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-lg ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
             <div className="flex justify-between text-slate-400">
               <Users size={20} />
               <ArrowUpRight size={18} />
             </div>
             <div>
               <h3 className="text-3xl font-bold text-slate-900">842</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Clients</p>
             </div>
          </div>

          {/* 4. METRIC: Total Purchases (1x1) */}
          <div className={`md:col-span-1 md:row-span-1 bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-lg ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
             <div className="flex justify-between text-slate-400">
               <ShoppingBag size={20} />
               <ArrowUpRight size={18} />
             </div>
             <div>
               <h3 className="text-3xl font-bold text-slate-900">1,204</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Orders Placed</p>
             </div>
          </div>

          {/* 5. TALL CARD: Recent Activity (1x2) */}
          <div className={`md:col-span-1 md:row-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-50 rounded-lg"><Activity size={18} className="text-slate-400"/></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Feed</span>
             </div>
             
             <div className="space-y-6 overflow-hidden relative flex-1">
               {[1, 2, 3, 4].map((_, i) => (
                 <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#FFCC00]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">New Order #220{i}</p>
                      <p className="text-[10px] text-slate-400">2 mins ago • ₹450</p>
                    </div>
                 </div>
               ))}
               <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-white to-transparent" />
             </div>
          </div>

          {/* 6. WIDE METRIC: Analytics (2x1) */}
          <div className={`md:col-span-2 md:row-span-1 bg-[#2e0561] rounded-[2.5rem] p-8 text-white relative overflow-hidden flex items-center justify-between shadow-xl shadow-purple-900/10 ${!isRegistered && "blur-sm opacity-80 grayscale"}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-white/50">
                 <BarChart3 size={16} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Growth</span>
              </div>
              <h3 className="text-3xl font-bold">+128%</h3>
              <p className="text-xs text-white/40 mt-1">More traffic than last month</p>
            </div>

            <div className="flex gap-2 items-end h-16 w-32 opacity-20">
               <div className="w-4 bg-white h-[40%]" />
               <div className="w-4 bg-white h-[70%]" />
               <div className="w-4 bg-white h-[50%]" />
               <div className="w-4 bg-white h-[100%]" />
               <div className="w-4 bg-white h-[80%]" />
            </div>
          </div>

           {/* 7. CARD: Payment Method (1x1) */}
           <div className={`md:col-span-1 md:row-span-1 bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col justify-center items-center shadow-sm text-center ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-400">
                <CreditCard size={20} />
              </div>
              <p className="text-xs font-bold text-slate-900">Payouts Ready</p>
              <p className="text-[10px] text-slate-400 mt-1">Next: tomorrow</p>
           </div>

        </div>

        {/* LOCKED OVERLAY */}
        {!isRegistered && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl z-40 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <Lock size={16} className="text-[#FFCC00]" />
            <span className="text-xs font-bold">Dashboard Locked. Please register your restaurant.</span>
          </div>
        )}

      </main>

      {/* Dev Toggle */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={() => setIsRegistered(!isRegistered)}
          className="bg-slate-200 text-slate-600 text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity"
        >
          Toggle: {isRegistered ? "Live" : "Locked"}
        </button>
      </div>
      
    </div>
  );
}