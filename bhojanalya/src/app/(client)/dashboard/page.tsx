"use client";

import { useState, useEffect } from "react";
import { 
  PlusCircle, Eye, Search, ArrowUpRight, 
  Wallet, Users, BarChart3, ShoppingBag, Activity, 
  CreditCard, TrendingUp, Lock, AlertOctagon, 
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const isRegistered = restaurants.length > 0;

  useEffect(() => {
    const channel = new BroadcastChannel('bhojanalya_session');
    channel.onmessage = (event) => {
      if (event.data === 'CHECK_EXISTING') channel.postMessage('I_EXIST');
      else if (event.data === 'I_EXIST') setIsDuplicate(true);
    };
    channel.postMessage('CHECK_EXISTING');
    return () => channel.close();
  }, []);

  useEffect(() => {
    if (isDuplicate) return;
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth'); return; }

    const fetchData = async () => {
      try {
        const userData = await apiRequest('/protected/ping');
        setUser(userData);
        
        const myRestaurants = await apiRequest('/restaurants/me');
        console.log("DASHBOARD DATA RECEIVED:", myRestaurants); // 🔍 Debugging Log
        setRestaurants(myRestaurants || []);
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, isDuplicate]);

  const handleActionClick = () => {
    if (isRegistered) {
      const safeId = restaurants[0].ID || restaurants[0].id;
      if (safeId) {
        window.open(`/preview?id=${safeId}`, "_blank");
      } else {
        alert("Error: Restaurant ID not found in data. Check console.");
        console.error("Restaurant Data:", restaurants[0]);
      }
    } else {
      router.push("/register");
    }
  };

  if (isDuplicate) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Session active in another tab.</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]"><div className="w-12 h-12 bg-[#471396]/20 rounded-full animate-bounce" /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans selection:bg-[#471396]/10">
      <header className="sticky top-0 z-50 bg-[#F8F9FB]/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {user?.id || user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:bg-slate-50 text-slate-500"><Calendar size={18} /></button>
        </div>
      </header>

      <main className="pt-8 px-8 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[180px]">
          
          {/* Revenue Card (Static) */}
          <div className={`md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-sm transition-all duration-500 ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Wallet size={120} className="text-[#471396]" /></div>
            <div className="h-full flex flex-col justify-between p-8 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#471396]"><Wallet size={24} /></div>
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold flex items-center gap-1"><TrendingUp size={12} /> +0.0%</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Revenue</h3>
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter">₹0<span className="text-slate-300 text-4xl">.00</span></h2>
              </div>
              <div className="flex items-end gap-1 h-12 mt-4 opacity-50">{[0,0,0,0,0,0,0,0,0,0,0,0].map((h, i) => (<div key={i} className="flex-1 bg-slate-100 rounded-t-sm" style={{ height: `10%` }} />))}</div>
            </div>
          </div>

          {/* ACTION CARD (Dynamic) */}
          <div className="md:col-span-2 md:row-span-1 rounded-[2.5rem] overflow-hidden relative shadow-lg shadow-purple-900/5">
            <div className={`absolute inset-0 z-0 ${isRegistered ? "bg-[#2e0561]" : "bg-[#FFCC00]"}`} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 h-full flex items-center justify-between p-8">
              <div className={isRegistered ? "text-white" : "text-[#2e0561]"}>
                {/* ✅ FIX: Access Name or name */}
                <h3 className="text-2xl font-black mb-1">{isRegistered ? (restaurants[0]?.Name || restaurants[0]?.name) : "Complete Setup"}</h3>
                <p className={`text-xs font-medium opacity-80 max-w-[250px] ${isRegistered ? "text-purple-200" : "text-purple-900"}`}>
                  {isRegistered ? "Manage your orders and view your live storefront." : "Register your restaurant to unlock the full dashboard."}
                </p>
              </div>
              <button onClick={handleActionClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl ${isRegistered ? "bg-white text-[#2e0561]" : "bg-[#2e0561] text-white"}`}>
                {isRegistered ? <><Eye size={16} /> View Shop</> : <><PlusCircle size={16} /> Register Now</>}
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className={`md:col-span-1 md:row-span-1 bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col justify-between shadow-sm ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
              <div className="flex justify-between text-slate-400"><Users size={20} /><ArrowUpRight size={18} /></div>
              <div><h3 className="text-3xl font-bold text-slate-900">0</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Clients</p></div>
          </div>
          <div className={`md:col-span-1 md:row-span-1 bg-white border border-slate-200 rounded-[2.5rem] p-6 flex flex-col justify-between shadow-sm ${!isRegistered && "blur-sm opacity-60 grayscale"}`}>
              <div className="flex justify-between text-slate-400"><ShoppingBag size={20} /><ArrowUpRight size={18} /></div>
              <div><h3 className="text-3xl font-bold text-slate-900">0</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Orders Placed</p></div>
          </div>
        </div>

        {!isRegistered && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl z-40">
            <Lock size={16} className="text-[#FFCC00]" /><span className="text-xs font-bold">Dashboard Locked. Register your restaurant.</span>
          </div>
        )}
      </main>
    </div>
  );
}