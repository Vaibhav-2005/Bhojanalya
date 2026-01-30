"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, ChevronDown, Clock, 
  Smartphone, Loader2, MapPin, FileText, 
  UtensilsCrossed, IndianRupee, XCircle
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [expandedKey, setExpandedKey] = useState<string | number | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    const fetchRequests = async () => {
      try {
        const data = await apiRequest('/admin/menus/pending');
        const list = Array.isArray(data) ? data : (data.pending_menus || []);
        
        const safeList = list.map((item: any) => ({
          ...item,
          _ui_key: `req-${item.id}` 
        }));
        
        setRequests(safeList);
      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  const toggleExpand = (key: string | number) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  const handleApprove = async (e: React.MouseEvent, restaurantId: number, requestId: number) => {
    e.stopPropagation(); 
    try {
        await apiRequest(`/admin/restaurants/${restaurantId}/approve`, 'POST');
        setRequests(prev => prev.filter(req => req.id !== requestId));
        if (expandedKey === `req-${requestId}`) setExpandedKey(null);
    } catch (err) {
        alert("Failed to approve restaurant.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <Loader2 className="w-10 h-10 animate-spin text-[#471396]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20 overflow-x-hidden">
      
      {/* HEADER - Explicitly set to lower z-index */}
      <div className="bg-[#2e0561] pt-16 pb-32 px-8 text-white relative z-0 shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Restaurant Approvals</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Review AI-parsed menu data and approve for live status.</p>
          </div>
          <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-white/50">Queue</p>
              <p className="text-2xl font-black text-[#FFCC00]">{requests.length}</p>
            </div>
            <Clock size={24} className="text-[#FFCC00]" />
          </div>
        </div>
      </div>

      {/* LIST - Explicitly set to higher z-index to overlay header */}
      <div className="max-w-6xl mx-auto -mt-20 px-6 relative z-10">
        <div className="flex flex-col gap-5">
          <AnimatePresence mode='popLayout'>
            {requests.map((req) => {
                const isExpanded = expandedKey === req._ui_key;
                const cost = req.parsed_data?.cost_for_two?.calculation?.total_cost_for_two || 0;
                const avail = req.parsed_data?.cost_for_two?.availability || {};

                return (
                  <motion.div 
                    key={req._ui_key}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-[#471396] shadow-2xl ring-1 ring-[#471396]/20' : 'border-slate-100 shadow-sm'}`}
                  >
                    {/* CARD HEADER */}
                    <div onClick={() => toggleExpand(req._ui_key)} className="p-8 flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-6">
                        <div className={`w-1.5 h-12 rounded-full transition-colors duration-500 ${isExpanded ? 'bg-[#471396]' : 'bg-slate-200'}`} />
                        <div>
                          <h3 className="text-xl font-black text-slate-800">{req.restaurant_name}</h3>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <MapPin size={14} className="text-indigo-400" /> {req.city}
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            <UtensilsCrossed size={14} className="text-indigo-400" /> {req.cuisine_type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); window.open(`/preview?id=${req.restaurant_id}`, '_blank'); }} 
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#2e0561] hover:text-white transition-all shadow-sm active:scale-95">
                          <Smartphone size={16} /> Preview
                        </button>
                        <div className={`p-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-[#471396] text-white rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                          <ChevronDown size={24} />
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED SECTION */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: "auto", opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-8 pb-8 pt-4 border-t border-slate-50 bg-slate-50/40">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 ml-8">
                              
                              <div className="space-y-6">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Operating Hours</p>
                                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <Clock size={16} className="text-indigo-500" />
                                    {req.opens_at?.split(':')[0]}:{req.opens_at?.split(':')[1]} — {req.closes_at?.split(':')[0]}:{req.closes_at?.split(':')[1]}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filename</p>
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm truncate">
                                    <FileText size={16} className="text-blue-500" />
                                    {req.filename}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-6">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cost for Two</p>
                                  <div className="flex items-center gap-2 text-xl font-black text-[#471396] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <IndianRupee size={20} />
                                    {cost} <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-tighter">Est. Value</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Category Detection</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <AvailTag label="Starters" active={avail.starter} />
                                    <AvailTag label="Mains" active={avail.main_course} />
                                    <AvailTag label="Drinks" active={avail.drink} />
                                    <AvailTag label="Desserts" active={avail.dessert} />
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col justify-end gap-3 pl-10 border-l border-slate-200 border-dashed">
                                <button onClick={(e) => handleApprove(e, req.restaurant_id, req.id)}
                                        className="w-full py-4.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                                  <CheckCircle2 size={18} /> Approve Entry
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
            })}
          </AnimatePresence>

          {requests.length === 0 && !loading && (
            <div className="text-center py-28 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Queue Empty</h3>
              <p className="text-slate-400 font-medium mt-2">All parsed data has been verified.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AvailTag({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[9px] font-black uppercase border transition-all ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-400 opacity-60'}`}>
      {label}
      {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    </div>
  );
}