"use client";

import { useState, useEffect } from "react";
import { 
  PlusCircle, Eye, ArrowUpRight, BarChart3, Sparkles, 
  Ticket, CheckCircle2, Clock, X, Check, Send, 
  Trash2, Info, Loader2, IndianRupee, Percent, Megaphone,
  AlertCircle, Layers, Mail
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
  discount_value: number;
  source: "suggested" | "custom";
  reason?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function DealsPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  
  // Deal Data
  const [suggestedDeals, setSuggestedDeals] = useState<Deal[]>([]);
  const [draftDeals, setDraftDeals] = useState<Deal[]>([]); 
  
  // Form State
  const [formType, setFormType] = useState<DealType>("percentage");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<DealCategory>("Main Course");
  const [formDiscount, setFormDiscount] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Insights Data (Now populated from the suggestion API)
  const [insights, setInsights] = useState({ myCost: 0, marketAvg: 0, marketMedian: 0, positioning: "" });

  // Notifications
  const [toast, setToast] = useState<Toast | null>(null);

  const restaurantName = restaurants[0]?.Name || restaurants[0]?.name || "Your Restaurant";
  const restaurantId = restaurants[0]?.ID || restaurants[0]?.id;

  // --- 1. ONBOARDING STATUS GUARD & DATA FETCH ---
  const checkOnboardingFlow = async () => {
    try {
      const statusRes = await apiRequest('/auth/protected/onboarding', 'GET');
      const status = (statusRes.onboarding_status || "null").toUpperCase();

      // Enforce positioning
      if (status === "NULL" || ["REGISTERED", "MENU_PENDING", "PHOTO_PENDING"].includes(status)) {
        router.replace("/register");
        return;
      }
      if (["DEALS_COMPLETED", "COMPLETED"].includes(status)) {
        router.replace("/preview");
        return;
      }

      if (status === "BOTH_COMPLETED") {
        const myRestaurants = await apiRequest('/restaurants/me');
        if (!myRestaurants?.[0]) return router.replace("/register");

        const res = myRestaurants[0];
        const rid = res.ID || res.id;
        setRestaurants(myRestaurants);
        setUser({ email: localStorage.getItem("email") });

        // Hit Suggestion API (Contains Market Data)
        const suggestData = await apiRequest(`/restaurants/${rid}/deals/suggestion`);
        
        // Populate Insights from Suggestion Response
        setInsights({
          myCost: suggestData.restaurant_cost_for_two || 0,
          marketAvg: suggestData.market_avg_cost_for_two || 0,
          marketMedian: suggestData.market_median_cost_for_two || 0,
          positioning: suggestData.positioning || ""
        });

        const rawSuggestions = suggestData.suggestions || [];
        setSuggestedDeals(rawSuggestions.map((d: any, i: number) => mapBackendToFrontend(d, i)));
        
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Sync Failure", err);
      const isAuthError = err.status === 401 || err.message?.toLowerCase().includes("unauthorized");
      if (isAuthError) {
        localStorage.clear();
        router.replace("/auth");
      } else {
        setLoading(false);
        showToast("Error syncing market data", "error");
      }
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("nav_intent")) {
        window.location.href = "/auth";
        return;
    }
    checkOnboardingFlow();
  }, [router]);

  // --- HELPERS ---
  const mapBackendToFrontend = (d: any, i: number): Deal => {
    let cat: DealCategory = "Main Course";
    const c = (d.category || "").toLowerCase();
    if (c.includes("starter")) cat = "Starters";
    else if (c.includes("drink")) cat = "Drinks";
    else if (c.includes("dessert")) cat = "Desserts";
    return {
        id: `s-${i}`,
        title: d.title || "Special Offer",
        type: (d.type || "").toUpperCase() === "FLAT" ? "flat" : "percentage",
        category: cat,
        discount_value: d.discount_value || 0,
        source: "suggested",
        reason: d.reason
    };
  };

  const mapCategoryToBackend = (cat: DealCategory) => {
    const map = { "Starters": "starter", "Drinks": "drink", "Desserts": "dessert", "Main Course": "main_course" };
    return map[cat] || "main_course";
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getInsightText = () => {
    const { positioning, myCost, marketAvg } = insights;
    if (positioning === "PREMIUM") return "You’re positioned as premium. High-value main course deals will work best.";
    if (myCost < marketAvg) return "You’re value-driven. Consider volume-based drink or starter discounts.";
    return "You're at market average. AI suggests focusing on dessert attachment rates.";
  };

  const getPositionPercentage = (value: number) => {
    const values = [insights.myCost, insights.marketAvg, insights.marketMedian];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const buffer = (maxVal - minVal) || minVal * 0.1; 
    const scaleMin = Math.max(0, minVal - buffer);
    const scaleMax = maxVal + buffer;
    const percentage = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
    return Math.max(8, Math.min(percentage, 92));
  };

  // --- HANDLERS ---
  const handlePublishDeals = async () => {
    if (draftDeals.length === 0 || !restaurantId) return;
    setIsPublishing(true);
    try {
        const publishPromises = draftDeals.map(deal => 
            apiRequest(`/restaurants/${restaurantId}/deals`, "POST", {
                title: deal.title,
                type: deal.type.toUpperCase(),
                category: mapCategoryToBackend(deal.category),
                discount_value: Number(deal.discount_value),
                source: deal.source
            })
        );
        await Promise.all(publishPromises);
        await apiRequest('/auth/protected/onboarding', 'PATCH', { onboarding_status: "DEALS_COMPLETED" });
        showToast("Campaigns published!", "success");
        await checkOnboardingFlow();
    } catch (error) {
        showToast("Publish failed.", "error");
        setIsPublishing(false); 
    } 
  };

  const handleCreateDeal = () => {
    if (!formTitle || !formDiscount) { showToast("Title and value required", "error"); return; }
    setDraftDeals([...draftDeals, { id: Date.now().toString(), title: formTitle, type: formType, category: formCategory, discount_value: parseInt(formDiscount), source: "custom" }]);
    setFormTitle(""); setFormDiscount("");
  };

  const handleAddSuggestion = (deal: Deal) => {
    setDraftDeals([...draftDeals, { ...deal, id: Date.now().toString() }]);
    setSuggestedDeals(suggestedDeals.filter(d => d.id !== deal.id));
  };

  const statItems = [
    { label: "You", value: insights.myCost, color: "#471396", labelColor: "text-[#471396]", valueColor: "text-[#471396]" },
    { label: "Median", value: insights.marketMedian, color: "#94a3b8", labelColor: "text-slate-400", valueColor: "text-slate-400" },
    { label: "Avg", value: insights.marketAvg, color: "#334155", labelColor: "text-slate-600", valueColor: "text-slate-700" }
  ].sort((a, b) => a.value - b.value);

  if (loading) return ( <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]"><Loader2 className="w-12 h-12 text-[#471396] animate-spin" /></div> );

  return (
    <>
    <style jsx global>{`
      ::-webkit-scrollbar { display: none; }
      * { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>

    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-10 overflow-hidden">
      
      <header className="sticky top-0 z-50 bg-[#F8F9FB]/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Publish Your Deals</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <Mail size={10} /> {user?.email || "..."}
               </div>
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full border bg-white border-slate-200 text-slate-500 text-xs font-bold flex items-center gap-2 uppercase tracking-wider shadow-sm">
            <Layers size={14} /> Onboarding: Phase 3
          </div>
        </div>
      </header>

      <main className="pt-8 px-8 max-w-7xl mx-auto h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          
          {/* LEFT: SUGGESTIONS */}
          <div className="lg:col-span-1 flex flex-col h-full overflow-hidden">
             <div className="bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col h-full shadow-sm relative overflow-hidden group/container">
                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#f1cd48]/20 flex items-center justify-center text-amber-600"><Sparkles size={16} fill="#f1cd48" /></div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700">Suggestions</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-6">
                    {suggestedDeals.map((deal) => (
                        <div key={deal.id} onClick={() => handleAddSuggestion(deal)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#f1cd48] hover:shadow-[0_4px_20px_-12px_#f1cd48] cursor-pointer transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-slate-700 group-hover:text-[#471396]">{deal.title}</span>
                                <PlusCircle size={16} className="text-slate-200 group-hover:text-[#f1cd48]" />
                            </div>
                            <div className="flex gap-2 mt-3">
                                <span className="text-[9px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-slate-500 font-semibold uppercase">{deal.category}</span>
                                <span className="text-[9px] bg-[#f1cd48]/10 px-2 py-1 rounded-md border border-[#f1cd48]/30 text-amber-700 font-bold uppercase">
                                    {deal.type === 'percentage' ? `${deal.discount_value}% OFF` : `₹${deal.discount_value} FLAT`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          {/* CENTER: BUILDER */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
             <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="flex-shrink-0 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-[#471396]">
                        <div className="p-2 bg-[#f1cd48]/20 rounded-lg"><Ticket size={20} className="text-amber-700" /></div>
                        <h3 className="font-bold text-lg">Manage Deals</h3>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Deal Title</label>
                            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none" placeholder="Special Discount" />
                        </div>
                        <div className="col-span-4 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
                            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as DealCategory)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold outline-none">
                                <option>Starters</option><option>Main Course</option><option>Drinks</option><option>Desserts</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-end gap-4 mt-4">
                         <div className="w-32 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Value</label>
                            <input type="number" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" placeholder="20" />
                        </div>
                         <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 h-12">
                            <button onClick={() => setFormType('percentage')} className={`px-4 rounded-lg text-xs font-bold uppercase ${formType === 'percentage' ? 'bg-[#471396] text-white shadow-sm' : 'text-slate-400'}`}>%</button>
                            <button onClick={() => setFormType('flat')} className={`px-4 rounded-lg text-xs font-bold uppercase ${formType === 'flat' ? 'bg-[#471396] text-white shadow-sm' : 'text-slate-400'}`}>₹</button>
                        </div>
                        <button onClick={handleCreateDeal} className="ml-auto bg-[#471396] text-white px-8 h-12 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                            <PlusCircle size={18} /> Add
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pb-24 scroll-hide">
                    {draftDeals.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 grayscale opacity-30"><Megaphone size={32} className="mb-2" /><span className="text-xs font-medium">Empty List</span></div>
                    ) : (
                        draftDeals.map((deal) => (
                            <div key={deal.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#471396] transition-all">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-800">{deal.title}</h5>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{deal.category} • <span className="text-[#471396]">{deal.type === 'percentage' ? `${deal.discount_value}%` : `₹${deal.discount_value}`} OFF</span></p>
                                </div>
                                <button onClick={() => setDraftDeals(draftDeals.filter(d => d.id !== deal.id))} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        ))
                    )}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 bg-white z-20">
                    <button onClick={handlePublishDeals} disabled={draftDeals.length === 0 || isPublishing} className="w-full py-4 bg-[#471396] text-white rounded-xl font-bold text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-xl shadow-indigo-100">
                        {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="text-[#f1cd48]" />}
                        {isPublishing ? 'Publishing...' : 'Finalize & Publish'}
                    </button>
                </div>
             </div>
          </div>

          {/* RIGHT: INSIGHTS */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
             <div onClick={() => window.open(`/preview?id=${restaurantId}`, "_blank")} className="h-1/3 bg-gradient-to-br from-[#471396] to-[#6d28d9] rounded-[2rem] p-6 text-white shadow-lg cursor-pointer transition-transform hover:scale-[1.02] group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Eye size={80} /></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-70"><span className="w-2 h-2 bg-[#f1cd48] rounded-full"></span><span className="text-[10px] font-bold uppercase tracking-widest">Storefront</span></div>
                        <h2 className="text-xl font-black truncate">{restaurantName}</h2>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest bg-white/10 p-2.5 rounded-lg group-hover:bg-white group-hover:text-[#471396] transition-all">
                        Preview <ArrowUpRight size={14} />
                    </div>
                </div>
             </div>

             <div className="h-2/3 bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-[#471396]">
                    <div className="p-2 bg-[#f1cd48]/20 rounded-lg"><BarChart3 size={18} className="text-amber-700" /></div>
                    <h3 className="font-bold text-sm uppercase tracking-wide">Market Pricing</h3>
                </div>
                
                <div className="space-y-4 flex-1">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 text-center">Cost for Two Map</p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {statItems.map((item, idx) => (
                                <div key={idx} className={`${idx === 2 ? 'text-right' : idx === 1 ? 'text-center' : 'text-left'}`}>
                                    <span className={`text-[10px] font-medium block ${item.labelColor}`}>{item.label}</span>
                                    <span className={`text-lg font-black ${item.valueColor}`}>₹{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="relative h-6 w-full mt-2">
                             <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 rounded-full -translate-y-1/2"></div>
                             {statItems.map((item, idx) => (
                                <div key={idx} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow-sm transition-all duration-500"
                                    style={{ left: `${getPositionPercentage(item.value)}%`, backgroundColor: item.color, width: item.label === 'You' ? '14px' : '10px', height: item.label === 'You' ? '14px' : '10px', zIndex: item.label === 'You' ? 20 : 10 }}
                                />
                             ))}
                        </div>
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex-1">
                        <div className="flex items-start gap-2">
                            <Info size={16} className="text-[#471396] mt-0.5 shrink-0" />
                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">{getInsightText()}</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-[#471396] text-white' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-[#f1cd48]" /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </div>
    </>
  );
}