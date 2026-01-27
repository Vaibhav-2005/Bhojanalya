"use client";

import { useState, useEffect } from "react";
import { 
  PlusCircle, Eye, ArrowUpRight, BarChart3, Sparkles, 
  Ticket, CheckCircle2, Clock, X, Check, Send, 
  Trash2, Info, Loader2, IndianRupee, Percent, Megaphone
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

// --- TYPES ---
type DealType = "percentage" | "flat";
type DealCategory = "Starters" | "Main Course" | "Drinks" | "Desserts";

interface Deal {
  id: string;
  title: string;
  type: DealType;
  category: DealCategory;
  discount: number;
  source: "suggested" | "custom";
}

export default function DealsPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [approvalStatus, setApprovalStatus] = useState("initiated");

  // Deal Data
  const [suggestedDeals, setSuggestedDeals] = useState<Deal[]>([]);
  const [draftDeals, setDraftDeals] = useState<Deal[]>([]); 
  
  // Form State
  const [formType, setFormType] = useState<DealType>("percentage");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<DealCategory>("Main Course");
  const [formDiscount, setFormDiscount] = useState<string>("");

  // Insights Data
  const [insights] = useState({ myCost: 1200, marketAvg: 1400, marketMedian: 900 });

  const restaurantName = restaurants[0]?.Name || restaurants[0]?.name || "Your Restaurant";
  const restaurantId = restaurants[0]?.ID || restaurants[0]?.id;

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/auth'; return; }

    const fetchData = async () => {
      try {
        const storedStatus = localStorage.getItem("approval_status");
        if (storedStatus) setApprovalStatus(storedStatus);

        const userData = await apiRequest('/protected/ping');
        const role = (userData?.role || "").toUpperCase(); 
        if (role === 'ADMIN' || userData?.isAdmin === true) {
            localStorage.removeItem('token'); 
            window.location.href = '/auth'; 
            return; 
        }

        setUser(userData);
        const myRestaurants = await apiRequest('/restaurants/me');
        setRestaurants(myRestaurants || []);

        setSuggestedDeals([
            { id: "s1", title: "Free Coke with Pizza", type: "flat", category: "Drinks", discount: 100, source: "suggested" },
            { id: "s2", title: "20% Off on Starters", type: "percentage", category: "Starters", discount: 20, source: "suggested" },
            { id: "s3", title: "Happy Hour 1+1", type: "percentage", category: "Drinks", discount: 50, source: "suggested" },
            { id: "s4", title: "Weekend Special", type: "percentage", category: "Starters", discount: 25, source: "suggested" },
            { id: "s5", title: "Late Night 15%", type: "percentage", category: "Main Course", discount: 15, source: "suggested" },
            { id: "s6", title: "Dessert Mania", type: "flat", category: "Desserts", discount: 150, source: "suggested" },
            { id: "s7", title: "Family Combo Save", type: "flat", category: "Main Course", discount: 300, source: "suggested" },
            { id: "s8", title: "Rainy Day Flat 50", type: "flat", category: "Starters", discount: 50, source: "suggested" },
        ]);
        
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleAddSuggestion = (deal: Deal) => {
    setDraftDeals([...draftDeals, deal]);
    setSuggestedDeals(suggestedDeals.filter(d => d.id !== deal.id));
  };

  const handleCreateDeal = () => {
    if (!formTitle || !formDiscount) return;
    const newDeal: Deal = {
        id: `c-${Date.now()}`,
        title: formTitle,
        type: formType,
        category: formCategory,
        discount: parseInt(formDiscount),
        source: "custom"
    };
    setDraftDeals([...draftDeals, newDeal]);
    setFormTitle("");
    setFormDiscount("");
  };

  const handleRemoveDeal = (deal: Deal) => {
    setDraftDeals(draftDeals.filter(d => d.id !== deal.id));
    if (deal.source === "suggested") setSuggestedDeals([...suggestedDeals, deal]);
  };

  const handleSubmitRequest = () => {
    setApprovalStatus("pending");
    localStorage.setItem("approval_status", "pending");
  };

  const handlePreviewClick = () => {
     if (restaurantId) window.open(`/preview?id=${restaurantId}`, "_blank");
  };

  if (loading) return ( <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]"><Loader2 className="w-12 h-12 text-[#471396] animate-spin" /></div> );

  return (
    <>
    {/* GLOBAL STYLE TO HIDE SCROLLBARS EVERYWHERE */}
    <style jsx global>{`
      ::-webkit-scrollbar {
        display: none;
      }
      * {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>

    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-10 overflow-hidden selection:bg-[#f1cd48] selection:text-[#471396]">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#F8F9FB]/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Partner Deals</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className={`w-2 h-2 rounded-full animate-pulse ${approvalStatus === 'active' ? 'bg-emerald-500' : 'bg-[#f1cd48]'}`}></span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {user?.id?.slice(0,8) || "..."}</p>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 uppercase tracking-wider shadow-sm ${
              approvalStatus === 'active' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-[#f1cd48]/10 border-[#f1cd48]/40 text-amber-700'
            }`}>
            {approvalStatus === 'active' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            {approvalStatus === 'active' ? 'Live' : 'Pending Approval'}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="pt-8 px-8 max-w-7xl mx-auto h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          
          {/* LEFT: SUGGESTIONS */}
          <div className="lg:col-span-1 flex flex-col h-full overflow-hidden">
             <div className="bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col h-full shadow-sm relative overflow-hidden group/container">
                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#f1cd48]/20 flex items-center justify-center text-amber-600">
                        <Sparkles size={16} fill="#f1cd48" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700">AI Suggestions</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-6">
                    {suggestedDeals.length === 0 && <div className="text-xs text-slate-400 text-center py-10 italic">All suggestions added!</div>}
                    {suggestedDeals.map((deal) => (
                        <div key={deal.id} onClick={() => handleAddSuggestion(deal)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#f1cd48] hover:shadow-[0_4px_20px_-12px_#f1cd48] cursor-pointer transition-all duration-300 group relative">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-slate-700 group-hover:text-[#471396] transition-colors">{deal.title}</span>
                                <PlusCircle size={16} className="text-slate-200 group-hover:text-[#f1cd48] transition-colors" />
                            </div>
                            <div className="flex gap-2 mt-3">
                                <span className="text-[9px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-slate-500 font-semibold">{deal.category}</span>
                                <span className="text-[9px] bg-[#f1cd48]/10 px-2 py-1 rounded-md border border-[#f1cd48]/30 text-amber-700 font-bold uppercase">
                                    {deal.type === 'percentage' ? `${deal.discount}% OFF` : `₹${deal.discount} FLAT`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
             </div>
          </div>

          {/* CENTER: MERGED CREATION & DRAFT LIST */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
             <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col h-full shadow-sm relative overflow-hidden">
                
                {/* TOP HALF: CREATION FORM (FIXED HEIGHT) */}
                <div className="flex-shrink-0 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-[#471396]">
                        <div className="p-2 bg-[#f1cd48]/20 rounded-lg">
                             <Ticket size={20} className="text-amber-700" />
                        </div>
                        <h3 className="font-bold text-lg">Create & Manage Deals</h3>
                    </div>
                    
                    {/* ROW 1: Title (Approx 66%) + Category (Approx 33%) */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-[#f1cd48] focus:ring-1 focus:ring-[#f1cd48] transition-colors" placeholder="e.g. Monsoon Special" />
                        </div>
                        <div className="col-span-4 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as DealCategory)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:outline-none focus:border-[#f1cd48]">
                                <option>Starters</option><option>Main Course</option><option>Drinks</option><option>Desserts</option>
                            </select>
                        </div>
                    </div>

                    {/* ROW 2: Discount (Left) + Toggles (Mid) + Button (Right) */}
                    <div className="flex items-end gap-4 mt-4">
                         {/* Discount Field moved to bottom */}
                         <div className="w-32 space-y-1.5 flex-shrink-0">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount</label>
                            <input type="number" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-[#f1cd48] focus:ring-1 focus:ring-[#f1cd48]" placeholder="20" />
                        </div>

                         <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 h-12 items-center">
                            <button onClick={() => setFormType('percentage')} className={`h-full flex items-center gap-1 px-4 rounded-lg text-xs font-bold uppercase transition-all ${formType === 'percentage' ? 'bg-[#471396] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Percent size={14}/> % Off</button>
                            <button onClick={() => setFormType('flat')} className={`h-full flex items-center gap-1 px-4 rounded-lg text-xs font-bold uppercase transition-all ${formType === 'flat' ? 'bg-[#471396] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><IndianRupee size={14}/> Flat</button>
                        </div>
                        
                        <button onClick={handleCreateDeal} className="ml-auto bg-[#471396] text-white px-8 h-12 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#3b0d82] transition-all shadow-lg shadow-[#471396]/20 flex items-center gap-2">
                            <PlusCircle size={18} className="text-[#f1cd48]" /> Add
                        </button>
                    </div>
                </div>

                {/* BOTTOM HALF: DRAFT LIST */}
                <div className="flex-1 min-h-0 flex flex-col relative">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Drafts ({draftDeals.length})</h4>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-24">
                        {draftDeals.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl p-8">
                                <Megaphone size={32} className="mb-2 opacity-20" />
                                <span className="text-xs font-medium">No deals in queue. Create one or pick a suggestion.</span>
                            </div>
                        )}
                        {draftDeals.map((deal) => (
                            <DealListItem key={deal.id} deal={deal} onRemove={() => handleRemoveDeal(deal)} />
                        ))}
                    </div>

                    <div className="absolute bottom-[4.5rem] left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

                    <div className="absolute bottom-0 left-0 w-full pt-2 bg-white z-20">
                        <button 
                            onClick={handleSubmitRequest} 
                            disabled={draftDeals.length === 0 || approvalStatus === 'pending'}
                            className="w-full py-4 bg-[#471396] text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#3b0d82] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#471396]/20 flex items-center justify-center gap-2 border border-[#471396]"
                        >
                            {approvalStatus === 'pending' ? <Clock size={18} className="text-[#f1cd48]" /> : <Send size={18} className="text-[#f1cd48]" />}
                            {approvalStatus === 'pending' ? 'Approval Pending' : 'Publish Deals'}
                        </button>
                    </div>
                </div>

             </div>
          </div>

          {/* RIGHT: PREVIEW & INSIGHTS */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
             
             {/* TOP: PREVIEW CARD */}
             <div onClick={handlePreviewClick} className="h-1/3 bg-gradient-to-br from-[#471396] to-[#6d28d9] rounded-[2rem] p-6 text-white shadow-lg cursor-pointer group relative overflow-hidden transition-transform hover:scale-[1.02] border-t border-[#f1cd48]/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Eye size={80} />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-70">
                            <span className="w-2 h-2 bg-[#f1cd48] rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Storefront</span>
                        </div>
                        <h2 className="text-xl font-black leading-tight truncate">
                            {restaurantName}
                        </h2>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest bg-white/10 p-2.5 rounded-lg group-hover:bg-white group-hover:text-[#471396] transition-all">
                        View Page <ArrowUpRight size={14} />
                    </div>
                </div>
             </div>

             {/* BOTTOM: INSIGHTS CARD */}
             <div className="h-2/3 bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-[#471396]">
                    <div className="p-2 bg-[#f1cd48]/20 rounded-lg">
                        <BarChart3 size={18} className="text-amber-700" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wide">Competitor Stats</h3>
                </div>
                
                <div className="space-y-4 flex-1">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Cost for Two (Avg)</p>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-xs text-slate-500 font-medium block">You</span>
                                <span className="text-xl font-black text-slate-800">₹{insights.myCost}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 font-medium block">Market</span>
                                <span className="text-xl font-black text-[#471396]">₹{insights.marketAvg}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex-1">
                        <div className="flex items-start gap-2">
                            <Info size={16} className="text-[#471396] mt-0.5 shrink-0" />
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                {insights.myCost > insights.marketAvg 
                                    ? "Your pricing is premium. Ensure your deals highlight quality over deep discounts." 
                                    : "You are competitively priced. Volume-based combos will work well here."}
                            </p>
                        </div>
                    </div>
                </div>
             </div>

          </div>

        </div>
      </main>
    </div>
    </>
  );
}

function DealListItem({ deal, onRemove }: { deal: Deal, onRemove: () => void }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    return (
        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#f1cd48] hover:shadow-md transition-all duration-200 group">
            <div>
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#471396] transition-colors">{deal.title}</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">
                    {deal.category} • <span className="text-emerald-600 font-bold">{deal.type === 'percentage' ? `${deal.discount}%` : `₹${deal.discount}`}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                {confirmDelete ? (
                    <div className="flex items-center gap-1">
                        <button onClick={onRemove} className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Check size={12} /></button>
                        <button onClick={() => setConfirmDelete(false)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><X size={12} /></button>
                    </div>
                ) : (
                    <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}