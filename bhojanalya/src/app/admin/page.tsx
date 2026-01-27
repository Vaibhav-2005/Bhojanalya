"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, XCircle, ChevronDown, Clock, 
  Smartphone, TrendingUp, Store, Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // SECURITY GUARD (Auth & Role Check Only)
  // Global session check is now handled by layout.tsx
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Check 1: Token Existence
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      // Check 2: Role Verification (Decode JWT)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decodedToken = JSON.parse(jsonPayload);
      const role = (decodedToken.role || "").toUpperCase();

      if (role !== "ADMIN") {
        // If logged in but NOT admin, kick back to deals page
        console.warn("Unauthorized Access: User is not Admin");
        router.push('/deals');
        return;
      }

      // 3. If Valid Admin, Fetch Data
      const fetchRequests = async () => {
        try {
          const data = await apiRequest('/restaurants/pending');
          setRequests(data || []);
        } catch (err) {
          console.error("Failed to fetch requests", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();

    } catch (e) {
      // If token is malformed, force logout
      localStorage.removeItem('token');
      router.push('/auth');
    }
  }, [router]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAction = (id: number, action: 'accept' | 'reject') => {
    // In real app: await apiRequest(`/restaurants/${id}/${action}`, 'PATCH')
    // Optimistic UI update
    setRequests(prev => prev.filter(req => req.ID !== id));
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
              <h1 className="text-3xl font-bold mb-2">Pending Approvals</h1>
              <p className="text-white/60 text-sm">Review and manage restaurant requests.</p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full bg-[#FFCC00] text-[#2e0561] flex items-center justify-center font-bold text-xs">A</div>
              <div className="text-xs"><p className="font-bold">Super Admin</p></div>
            </div>
          </div>
          <div className="flex gap-4">
            <StatCard value={requests.length} label="Pending" icon={<Clock size={16} className="text-[#FFCC00]" />} />
            <StatCard value="--" label="Active Partners" icon={<Store size={16} className="text-green-400" />} />
            <StatCard value="--" label="Growth (Wk)" icon={<TrendingUp size={16} className="text-blue-400" />} />
          </div>
        </div>
      </div>

      {/* APPROVALS LIST */}
      <div className="max-w-6xl mx-auto -mt-16 px-6 relative z-20">
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {requests.map((req) => (
              <motion.div 
                key={req.ID}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* HEADER */}
                <div 
                  onClick={() => toggleExpand(req.ID)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-1.5 h-12 rounded-full bg-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#471396] transition-colors">{req.Name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">New Registration</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {new Date(req.CreatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); window.open(`/preview?id=${req.ID}`, "_blank"); }}
                      className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-[#2e0561] hover:text-white transition-all"
                    >
                      <Smartphone size={18} />
                    </button>
                    <div className={`p-2 rounded-full transition-transform duration-300 ${expandedId === req.ID ? 'rotate-180 bg-slate-100' : 'text-slate-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                {expandedId === req.ID && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50 px-6 py-6 md:pl-16"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                             <DetailCard label="City" value={req.City} />
                             <DetailCard label="Cuisine" value={req.CuisineType} />
                             <DetailCard label="Owner ID" value={req.OwnerID} />
                             <DetailCard label="Status" value={req.Status} />
                        </div>
                      </div>
                      <div className="flex flex-col justify-end gap-3 border-l border-slate-200 pl-8 border-dashed">
                        <p className="text-xs font-medium text-slate-500 mb-2">Decision</p>
                        <button onClick={() => handleAction(req.ID, 'accept')} className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 active:scale-95"><CheckCircle2 size={16} /> Approve</button>
                        <button onClick={() => handleAction(req.ID, 'reject')} className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"><XCircle size={16} /> Reject</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {requests.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500"><CheckCircle2 size={32} /></div>
              <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px] flex flex-col justify-between">
      <div className="mb-2 opacity-80">{icon}</div>
      <div><div className="text-2xl font-black">{value}</div><div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div></div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-slate-100">
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate" title={value}>{value}</p>
    </div>
  );
}