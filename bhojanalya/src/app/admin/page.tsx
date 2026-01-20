"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  Clock, 
  FileText, 
  Smartphone,
  TrendingUp,
  Store
} from "lucide-react";

// --- MOCK DATA ---
const REQUESTS = [
  {
    id: 1,
    restaurant: "Royal Spice Bistro",
    type: "New Registration",
    date: "2 mins ago",
    status: "Pending",
    priority: "High",
    details: {
      owner: "Rajesh Kumar",
      phone: "+91 98765 43210",
      address: "Sector 29, Gurugram",
      documents: ["GSTIN", "FSSAI", "Menu Card"],
    }
  },
  {
    id: 2,
    restaurant: "Pizza Haven",
    type: "Menu Update",
    date: "1 hour ago",
    status: "Pending",
    priority: "Medium",
    details: {
      updateType: "Price Change",
      items: [
        { name: "Farmhouse Pizza", oldPrice: 299, newPrice: 349 },
        { name: "Coke (L)", oldPrice: 60, newPrice: 80 },
      ]
    }
  },
  {
    id: 3,
    restaurant: "Burger Point",
    type: "Info Update",
    date: "3 hours ago",
    status: "Pending",
    priority: "Low",
    details: {
      field: "Operational Hours",
      oldValue: "11:00 AM - 10:00 PM",
      newValue: "10:00 AM - 11:00 PM"
    }
  }
];

export default function AdminDashboard() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [requests, setRequests] = useState(REQUESTS);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAction = (id: number, action: 'accept' | 'reject') => {
    // API Call would go here
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-[#2e0561] pt-12 pb-24 px-8 text-white relative overflow-hidden shadow-2xl">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Pending Approvals</h1>
              <p className="text-white/60 text-sm">Review and manage restaurant requests.</p>
            </div>
            {/* Admin Profile Pill */}
            <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full bg-[#FFCC00] text-[#2e0561] flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="text-xs">
                <p className="font-bold">Super Admin</p>
                <p className="opacity-50">admin@bhojanalya.com</p>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-4">
            <StatCard 
              value={requests.length} 
              label="Pending" 
              icon={<Clock size={16} className="text-[#FFCC00]" />} 
            />
            <StatCard 
              value="128" 
              label="Active Partners" 
              icon={<Store size={16} className="text-green-400" />} 
            />
            <StatCard 
              value="+12%" 
              label="Growth (Wk)" 
              icon={<TrendingUp size={16} className="text-blue-400" />} 
            />
          </div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-[#FFCC00] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      </div>

      {/* --- APPROVALS LIST --- */}
      <div className="max-w-6xl mx-auto -mt-16 px-6 relative z-20">
        <div className="flex flex-col gap-4">
          
          <AnimatePresence mode="popLayout">
            {requests.map((req) => (
              <motion.div 
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* --- CARD HEADER (Always Visible) --- */}
                <div 
                  onClick={() => toggleExpand(req.id)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-6">
                    {/* Priority Strip */}
                    <div className={`w-1.5 h-12 rounded-full ${
                      req.priority === 'High' ? 'bg-red-500' : 
                      req.priority === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'
                    }`} />
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#471396] transition-colors">{req.restaurant}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          req.type === 'New Registration' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {req.type}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {req.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Mobile Preview Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); window.open("/preview", "_blank"); }}
                      className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-[#2e0561] hover:text-white transition-all"
                      title="Preview Mobile App"
                    >
                      <Smartphone size={18} />
                    </button>
                    
                    {/* Expand Chevron */}
                    <div className={`p-2 rounded-full transition-transform duration-300 ${expandedId === req.id ? 'rotate-180 bg-slate-100' : 'text-slate-400'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* --- EXPANDED DETAILS --- */}
                {expandedId === req.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50 px-6 py-6 md:pl-16"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
                      
                      {/* Left: Request Content */}
                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Changes Requested</h4>
                        
                        {req.type === "Menu Update" ? (
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                             <table className="w-full text-sm text-left">
                               <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                 <tr>
                                   <th className="px-4 py-3">Item Name</th>
                                   <th className="px-4 py-3 text-red-500">Old Price</th>
                                   <th className="px-4 py-3 text-green-600">New Price</th>
                                 </tr>
                               </thead>
                               <tbody>
                                  {(req.details as any).items.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-slate-100 last:border-0">
                                      <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                                      <td className="px-4 py-3 text-slate-400 line-through">₹{item.oldPrice}</td>
                                      <td className="px-4 py-3 text-slate-900 font-bold">₹{item.newPrice}</td>
                                    </tr>
                                  ))}
                               </tbody>
                             </table>
                          </div>
                        ) : req.type === "New Registration" ? (
                          <div className="grid grid-cols-2 gap-4">
                             <DetailCard label="Owner Name" value={(req.details as any).owner} />
                             <DetailCard label="Contact" value={(req.details as any).phone} />
                             <DetailCard label="Address" value={(req.details as any).address} />
                             <div className="col-span-2 flex gap-2 mt-2">
                               {(req.details as any).documents.map((doc: string) => (
                                 <span key={doc} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                                   <FileText size={12} className="text-[#FFCC00]" /> {doc}
                                 </span>
                               ))}
                             </div>
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">{(req.details as any).field}</p>
                            <div className="flex items-center gap-2">
                               <span className="line-through text-slate-400">{(req.details as any).oldValue}</span>
                               <span className="text-slate-300">→</span>
                               <span className="font-bold text-slate-900">{(req.details as any).newValue}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col justify-end gap-3 border-l border-slate-200 pl-8 border-dashed">
                        <p className="text-xs font-medium text-slate-500 mb-2">Decision</p>
                        
                        <button 
                          onClick={() => handleAction(req.id, 'accept')}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 active:scale-95"
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>

                        <button 
                          onClick={() => handleAction(req.id, 'reject')}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {requests.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
              <p className="text-slate-400 text-sm mt-1">There are no pending approvals at the moment.</p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ value, label, icon }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[140px] flex flex-col justify-between">
      <div className="mb-2 opacity-80">{icon}</div>
      <div>
        <div className="text-2xl font-black">{value}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      </div>
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