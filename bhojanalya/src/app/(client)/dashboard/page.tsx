"use client";

import { useState, useEffect } from "react";
import { 
  PlusCircle, Eye, ArrowUpRight, 
  BarChart3, TrendingUp, Lock, AlertOctagon, 
  Sparkles, Megaphone, Lightbulb, Ticket, CheckCircle2, Clock,
  X, Check, Save, Send, AlertCircle, Activity, Users, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  
  // Start with loading TRUE. We never set this to false if the user is unauthorized.
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);

  // UI State
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const [suggestionMode, setSuggestionMode] = useState<'idle' | 'confirming'>('idle');
  const [dealForm, setDealForm] = useState({ title: "", discount: "" });
  const [toastVisible, setToastVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("initiated");

  const isRegistered = restaurants.length > 0;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { 
        window.location.href = '/auth'; // Hard redirect
        return; 
    }

    const fetchData = async () => {
      try {
        const storedStatus = localStorage.getItem("approval_status");
        if (storedStatus) setApprovalStatus(storedStatus);

        const userData = await apiRequest('/protected/ping');
        
        // --- ROBUST ADMIN CHECK ---
        const rawRole = userData?.role || userData?.Role || "";
        const role = rawRole.toUpperCase(); 

        if (role === 'ADMIN' || userData?.isAdmin === true) {
            console.error("⛔ SECURITY ALERT: Admin attempted to access Client Dashboard.");
            localStorage.removeItem('token'); 
            window.location.href = '/auth'; 
            return; 
        }

        setUser(userData);
        const myRestaurants = await apiRequest('/restaurants/me');
        setRestaurants(myRestaurants || []);
        
        setLoading(false);

      } catch (err) {
        console.error("Auth Error:", err);
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    };
    fetchData();
  }, []);

  const handleSubmitRequest = () => {
    setApprovalStatus("pending");
    localStorage.setItem("approval_status", "pending");
    window.dispatchEvent(new Event("status-update"));
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handlePreviewClick = () => {
    if (isRegistered) {
      const safeId = restaurants[0].ID || restaurants[0].id;  
      if (safeId) window.open(`/preview?id=${safeId}`, "_blank");
    } else {
      router.push("/register");
    }
  };

  const handleApplySuggestion = () => {
    setDealForm({ title: "1 + 1 Lunch Combo", discount: "50%" });
    setIsCreatingDeal(true);
    setSuggestionMode('idle'); 
    setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 100);
  };

  const getStatusBadge = () => {
    switch(approvalStatus) {
      case "active": return <div className="px-4 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-bold flex items-center gap-2 uppercase tracking-wider"><CheckCircle2 size={14} /> Accepted</div>;
      case "pending": return <div className="px-4 py-1.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 text-xs font-bold flex items-center gap-2 uppercase tracking-wider"><Clock size={14} /> Pending</div>;
      case "rejected": return <div className="px-4 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2 uppercase tracking-wider"><AlertCircle size={14} /> Rejected</div>;
      default: return <div className="px-4 py-1.5 rounded-full border border-slate-600 bg-white text-slate-700 text-xs font-bold flex items-center gap-2 uppercase tracking-wider shadow-sm"><div className="w-2 h-2 rounded-full bg-slate-600" /> Not Requested</div>;
    }
  };

  if (loading) {
      return ( 
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
            <Loader2 className="w-12 h-12 text-[#471396] animate-spin" />
        </div> 
      );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans selection:bg-[#471396]/10 pb-32 overflow-x-hidden">
      
      <header className="sticky top-0 z-50 bg-[#F8F9FB]/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {user?.id || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">{getStatusBadge()}</div>
        </div>
      </header>

      <main className="pt-8 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:auto-rows-[220px]">
          
          <div className={`md:col-span-2 md:row-span-1 bg-white border border-slate-200 rounded-[2rem] p-6 relative overflow-hidden transition-all h-full ${!isRegistered && "blur-sm opacity-60 grayscale pointer-events-none"}`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Lightbulb size={100} className="text-yellow-500" /></div>
             <div className="flex items-center gap-2 mb-3 text-yellow-600"><Sparkles size={18} /><span className="text-[10px] font-bold uppercase tracking-widest">AI Suggestion</span></div>
             <div className="relative z-10 flex flex-col justify-between h-[130px]">
               {suggestionMode === 'idle' ? (
                 <>
                   <div><p className="text-lg font-bold text-slate-800 leading-tight mb-2">"Lunch traffic +15%."</p><p className="text-xs text-slate-500 font-medium">Offer a 1+1 Combo Deal (12-2 PM).</p></div>
                   <button onClick={() => setSuggestionMode('confirming')} className="mt-auto text-[10px] font-bold text-[#471396] hover:underline flex items-center gap-1 w-fit">Apply Suggestion <ArrowUpRight size={12} /></button>
                 </>
               ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 h-full flex flex-col justify-center">
                   <p className="text-sm font-bold text-slate-800 mb-4">Confirm?</p>
                   <div className="flex gap-4">
                     <button onClick={handleApplySuggestion} className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition-all"><Check size={20} /></button>
                     <button onClick={() => setSuggestionMode('idle')} className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* --- PREVIEW / RESTAURANT NAME CARD --- */}
          <div className={`md:col-span-2 md:row-span-1 rounded-[2rem] overflow-hidden relative shadow-lg group h-full ${isRegistered ? "bg-[#2e0561] shadow-purple-900/5" : "bg-[#FFCC00] shadow-yellow-500/20"}`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 h-full flex flex-col justify-between p-6">
              <div className={isRegistered ? "text-white mt-2" : "text-[#2e0561] mt-2"}>
                {/* UPDATED: Shows Restaurant Name if Registered */}
                <h3 className="text-xl font-black mb-1 truncate pr-2">
                    {isRegistered ? (restaurants[0]?.Name || restaurants[0]?.name || "Your Restaurant") : "Setup Required"}
                </h3>
                <p className={`text-[11px] font-medium opacity-80 max-w-[150px] ${isRegistered ? "text-purple-200" : "text-[#2e0561]/70"}`}>
                  {isRegistered ? "See your restaurant live on the customer app." : "Register your restaurant to unlock dashboard."}
                </p>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handlePreviewClick} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-xl ${isRegistered ? "bg-white text-[#2e0561]" : "bg-[#2e0561] text-white"}`}
                >
                  {isRegistered ? <><Eye size={14} /> Live Preview</> : <><PlusCircle size={14} /> Start Registration</>}
                </button>
              </div>
            </div>
          </div>

          <div className={`md:col-span-2 md:row-span-2 bg-gradient-to-br from-white to-[#471396]/15 border border-[#471396]/10 rounded-[2rem] p-6 flex flex-col h-full ${!isRegistered && "blur-sm opacity-60 grayscale pointer-events-none"}`}>
             <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 rounded-xl bg-[#471396]/10 flex items-center justify-center text-[#471396] shadow-sm border border-[#471396]/10"><BarChart3 size={20} /></div>
               <span className="px-3 py-1 rounded-full bg-white/80 border border-[#471396]/10 text-[#471396]/70 text-[10px] font-bold uppercase tracking-wide shadow-sm">Market Watch</span>
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">Competitive<br/>Insights</h3>
             <p className="text-xs text-slate-400 font-medium mb-6">Trends within 5km radius.</p>
             <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
               <InsightRow icon={<TrendingUp size={14} className="text-green-600" />} text="Italian Cuisine searches +22%." />
               <InsightRow icon={<AlertOctagon size={14} className="text-orange-600" />} text="Avg delivery time 5m slower." />
               <InsightRow icon={<Activity size={14} className="text-blue-600" />} text="Top item: Butter Chicken." />
               <InsightRow icon={<Users size={14} className="text-purple-600" />} text="Footfall rising this weekend." />
             </div>
          </div>

          <div className={`md:col-span-4 md:row-span-1 bg-[#FDF8F3] border border-orange-100 rounded-[2rem] p-6 relative overflow-hidden transition-all duration-500 h-full ${!isRegistered && "blur-sm opacity-60 grayscale pointer-events-none"}`}>
             <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-100/50 to-transparent pointer-events-none" />
             <div className="absolute -bottom-10 -right-10 text-orange-200/40"><Ticket size={180} /></div>
             {!isCreatingDeal ? (
               <div className="relative z-10 flex items-center justify-between h-full animate-in fade-in slide-in-from-left-4 duration-300">
                 <div className="flex gap-6 items-center">
                   <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-sm"><Megaphone size={24} /></div>
                   <div><h3 className="text-lg font-bold text-slate-900">Create a Flash Deal</h3><p className="text-xs text-slate-500 font-medium mt-1 max-w-sm">Boost your orders instantly by creating a limited-time offer.</p></div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right mr-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Deals</p><p className="text-xl font-black text-slate-900">02</p></div>
                    <button onClick={() => setIsCreatingDeal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#2e0561] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#471396] transition-colors shadow-lg shadow-purple-900/10"><PlusCircle size={16} /> Create New Deal</button>
                 </div>
               </div>
             ) : (
               <div className="relative z-10 h-full flex flex-col justify-center animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Ticket size={18} className="text-orange-500"/> New Deal Details</h3>
                    <button onClick={() => setIsCreatingDeal(false)} className="p-1.5 hover:bg-orange-100 rounded-full text-slate-400 hover:text-orange-600 transition-colors"><X size={18} /></button>
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deal Title</label>
                      <input type="text" value={dealForm.title} onChange={(e) => setDealForm({...dealForm, title: e.target.value})} className="w-full h-10 bg-white border border-orange-200 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500" placeholder="e.g. 50% Off Lunch"/>
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount</label>
                      <input type="text" value={dealForm.discount} onChange={(e) => setDealForm({...dealForm, discount: e.target.value})} className="w-full h-10 bg-white border border-orange-200 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500" placeholder="e.g. 50%"/>
                    </div>
                    <button className="h-10 px-6 bg-[#2e0561] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#471396] shadow-lg flex items-center gap-2 shrink-0"><Save size={14} /> Publish</button>
                  </div>
               </div>
             )}
          </div>
        </div>

        {!isRegistered && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl z-40 hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push("/register")}>
            <Lock size={16} className="text-[#FFCC00]" />
            <span className="text-xs font-bold">Dashboard Locked. Complete your registration.</span>
          </div>
        )}

        {isRegistered && approvalStatus === "initiated" && (
           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 duration-500">
             <button onClick={handleSubmitRequest} className="flex items-center gap-3 px-8 py-4 bg-[#2e0561] text-white rounded-full shadow-2xl shadow-purple-900/40 hover:scale-105 hover:bg-[#471396] transition-all group">
               <Send size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
               <div className="text-left"><p className="text-[10px] uppercase font-bold text-purple-200 tracking-wider leading-none">Ready to go?</p><p className="text-sm font-bold leading-none mt-1">Submit for Approval</p></div>
             </button>
           </div>
        )}

        <div 
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 ease-in-out ${
            toastVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
          }`}
        >
          <CheckCircle2 size={20} className="text-white" />
          <span className="font-bold text-sm">Request Sent Successfully!</span>
        </div>
      </main>
    </div>
  );
}

function InsightRow({ icon, text }: any) {
  return (
    <div className="flex gap-3 items-center p-3 bg-white/80 rounded-xl border border-white/60 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 cursor-default">
      <div className="shrink-0">{icon}</div>
      <p className="text-xs font-bold text-slate-700 leading-snug">{text}</p>
    </div>
  );
}