"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, ChevronDown, Clock, 
  Smartphone, Store, Loader2, MapPin, Utensils, FileText
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [expandedKey, setExpandedKey] = useState<string | number | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. AUTH & DATA FETCHING ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decodedToken = JSON.parse(jsonPayload);
      const role = (decodedToken.role || "").toUpperCase();

      if (role !== "ADMIN") {
        router.push('/deals');
        return;
      }

      const fetchRequests = async () => {
        try {
          const data = await apiRequest('/admin/menus/pending');
          const list = data.pending_menus || data || [];
          
          const safeList = list.map((item: any, index: number) => ({
            ...item,
            _ui_key: item.ID || `fallback-${index}`
          }));
          
          setRequests(safeList);
        } catch (err) {
          console.error("Failed to fetch requests", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();

    } catch (e) {
      localStorage.removeItem('token');
      router.push('/auth');
    }
  }, [router]);

  const toggleExpand = (key: string | number) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  const handleApprove = async (e: React.MouseEvent, restaurantId: number, menuId: number) => {
    e.stopPropagation(); 
    try {
        await apiRequest(`/admin/menus/${restaurantId}/approve`, 'POST');
        setRequests(prev => prev.filter(req => req.ID !== menuId));
    } catch (err) {
        console.error("Approval failed", err);
        alert("Failed to approve menu.");
    }
  };

  const handlePreview = (e: React.MouseEvent, restaurantId: number) => {
      e.stopPropagation(); 
      if (!restaurantId) return alert("Restaurant ID missing");
      window.open(`/preview?id=${restaurantId}`, '_blank');
  };

  const handleViewMenuFile = (e: React.MouseEvent, url: string) => {
      e.stopPropagation();
      if (!url) return alert("File URL missing");
      window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#471396]" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-[#2e0561] pt-12 pb-24 px-8 text-white relative overflow-hidden shadow-2xl">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Menu Approvals</h1>
              <p className="text-white/60 text-sm">Review uploaded menus and approve for OCR.</p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full bg-[#FFCC00] text-[#2e0561] flex items-center justify-center font-bold text-xs">A</div>
              <div className="text-xs"><p className="font-bold">Super Admin</p></div>
            </div>
          </div>
          <div className="flex gap-4">
            <StatCard value={requests.length} label="Pending Menus" icon={<Clock size={16} className="text-[#FFCC00]" />} />
            <StatCard value="--" label="Processed Today" icon={<CheckCircle2 size={16} className="text-green-400" />} />
          </div>
        </div>
      </div>

      {/* APPROVALS LIST */}
      <div className="max-w-6xl mx-auto -mt-16 px-6 relative z-20">
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {requests.map((req) => {
                const restaurantId = req.RestaurantID || req.restaurant_id || 0;
                const isExpanded = expandedKey === req._ui_key;

                return (
                  <motion.div 
                    key={req._ui_key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden
                        ${isExpanded ? 'border-[#471396] shadow-lg ring-1 ring-[#471396]/10' : 'border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    {/* --- LIST ITEM HEADER --- */}
                    <div 
                      onClick={() => toggleExpand(req._ui_key)}
                      className="p-6 flex items-center justify-between cursor-pointer group relative"
                    >
                      <div className="flex items-center gap-6">
                        {/* Status Indicator Bar */}
                        <div className={`w-1.5 h-12 rounded-full transition-colors ${isExpanded ? 'bg-[#471396]' : 'bg-blue-400'}`} />
                        
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#471396] transition-colors">
                            {req.RestaurantName || req.restaurant_name || `Restaurant #${restaurantId}`}
                          </h3>
                          
                          <div className="flex items-center gap-3 mt-1.5">
                            {(req.City || req.restaurant_city) && (
                                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                    <MapPin size={12} className="text-slate-400" /> {req.City || req.restaurant_city}
                                </span>
                            )}
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                {req.status || "PENDING"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS & EXPAND */}
                      <div className="flex items-center gap-4 relative z-10">
                        <button 
                          onClick={(e) => handlePreview(e, restaurantId)}
                          className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-[#2e0561] hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm active:scale-95 border border-slate-100"
                          title="Preview Storefront"
                        >
                          <Smartphone size={18} /> <span className="hidden md:inline">Preview</span>
                        </button>
                        
                        <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#471396] text-white' : 'text-slate-400 bg-slate-50'}`}>
                          <ChevronDown size={20} />
                        </div>
                      </div>
                    </div>

                    {/* --- EXPANDED DETAILS PANE --- */}
                    <AnimatePresence>
                        {isExpanded && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-6 md:pl-16">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Data Column */}
                                    <div className="md:col-span-2">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Restaurant Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailCard label="Owner Name" value={req.OwnerName || "N/A"} />
                                            <DetailCard label="Contact" value={req.Phone || "N/A"} />
                                            <DetailCard label="Restaurant ID" value={restaurantId} />
                                            <DetailCard label="Uploaded On" value={new Date(req.CreatedAt || req.created_at).toLocaleDateString()} />
                                        </div>
                                    </div>
                                    
                                    {/* Action Column */}
                                    <div className="flex flex-col justify-end gap-3 border-l border-slate-200 pl-8 border-dashed">
                                        <button 
                                            onClick={(e) => handleViewMenuFile(e, req.object_key || req.url)}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-slate-200 text-slate-600 hover:border-[#471396] hover:text-[#471396] rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                                        >
                                            <FileText size={16} /> View Menu PDF
                                        </button>

                                        <button 
                                            onClick={(e) => handleApprove(e, restaurantId, req.ID)} 
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 active:scale-95 hover:shadow-xl"
                                        >
                                            <CheckCircle2 size={16} /> Approve Menu
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
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500"><CheckCircle2 size={32} /></div>
              <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
              <p className="text-slate-400 text-sm mt-1">No pending menus to review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px] flex flex-col justify-between hover:bg-white/20 transition-colors cursor-pointer">
      <div className="mb-2 opacity-80">{icon}</div>
      <div><div className="text-2xl font-black">{value}</div><div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div></div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate" title={String(value)}>{value}</p>
    </div>
  );
}