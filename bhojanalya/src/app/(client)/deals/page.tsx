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
  const [approvalStatus, setApprovalStatus] = useState<"draft" | "pending">("draft");

  // Deal Data
  const [suggestedDeals, setSuggestedDeals] = useState<Deal[]>([]);
  const [draftDeals, setDraftDeals] = useState<Deal[]>([]); 
  
  // Form State
  const [formType, setFormType] = useState<DealType>("percentage");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<DealCategory>("Main Course");
  const [formDiscount, setFormDiscount] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Insights Data
  const [insights, setInsights] = useState({ myCost: 0, marketAvg: 0, marketMedian: 0 });

  // Notifications
  const [toast, setToast] = useState<Toast | null>(null);

  const restaurantName = restaurants[0]?.Name || restaurants[0]?.name || "Your Restaurant";
  const restaurantId = restaurants[0]?.ID || restaurants[0]?.id;

  // --- 1. THE FLOW ENGINE (INTEGRATED) ---
  const syncUserFlow = async () => {
    try {
      const myRestaurants = await apiRequest('/restaurants/me');
      if (!myRestaurants || myRestaurants.length === 0) {
        router.replace("/register");
        return;
      }

      const restaurant = myRestaurants[0];
      const rid = restaurant.ID || restaurant.id;

      let details;
      let hasDeals = false;
      try {
        details = await apiRequest(`/restaurants/${rid}/preview`);
        hasDeals = details?.deals && details.deals.length > 0;
      } catch (err: any) {
        if (!err.message?.toLowerCase().includes("at least one deal exists")) throw err;
      }

      const hasImages = details?.Images && details.Images.length > 0;
      const hasMenu = details?.menu_pdfs && (Array.isArray(details.menu_pdfs) ? details.menu_pdfs.length > 0 : details.menu_pdfs !== "");

      // LOGIC: If they reached here but assets are missing, push back to upload
      if (!hasImages || !hasMenu) {
        sessionStorage.setItem("incomplete_rid", rid.toString());
        router.replace("/register?step=upload");
        return;
      }

      // If they already have deals and try to access /deals manually, move them to preview
      if (hasDeals && !isPublishing) {
        router.replace("/preview");
        return;
      }

      // If they are where they should be (assets exist but no deals), load page data
      setUser(user);
      setRestaurants(myRestaurants);
      setInsights({
        myCost: Math.round(details?.RestaurantCostForTwo || details?.restaurant_cost_for_two || 0),
        marketAvg: Math.round(details?.MarketAvg || details?.market_avg_cost_for_two || 0),
        marketMedian: Math.round(details?.MarketMedian || details?.market_median_cost_for_two || 0)
      });
      
      // Fetch Suggestions separately
      const suggestRes = await apiRequest(`/restaurants/${rid}/deals/suggestion`);
      const rawSuggestions = suggestRes.Suggestions || suggestRes.suggestions || [];
      setSuggestedDeals(Array.isArray(rawSuggestions) ? rawSuggestions.map((d: any, i: number) => mapBackendToFrontend(d, i)) : []);

    } catch (err) {
      console.error("State Sync Failure", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. SECURITY GUARD & INIT ---
  useEffect(() => {
    const navAllowed = sessionStorage.getItem("nav_intent");
    if (!navAllowed) {
        window.location.href = "/auth";
        return;
    }
    syncUserFlow();
  }, [router]);

  // --- HELPERS ---
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getInsightText = () => {
    const { myCost, marketMedian, marketAvg } = insights;
    if (myCost === 0 || marketAvg === 0) return "Analyzing your market position...";
    if (myCost > marketAvg && myCost > marketMedian) return "You’re clearly premium. Own it, but price carefully.";
    if (myCost > marketMedian && myCost <= marketAvg) return "You look aspirational but accessible.";
    return "You’re playing in the mainstream battleground.";
  };

  const getPositionPercentage = (value: number) => {
    const values = [insights.myCost, insights.marketAvg, insights.marketMedian];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const buffer = (maxVal - minVal) || minVal * 0.1; 
    const scaleMin = Math.max(0, minVal - buffer * 1.5);
    const scaleMax = maxVal + buffer * 1.5;
    const percentage = ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
    return Math.max(8, Math.min(percentage, 92));
  };

  const mapBackendToFrontend = (backendDeal: any, index: number): Deal => {
    let cat: DealCategory = "Main Course";
    const c = (backendDeal.Category || backendDeal.category || "").toLowerCase();
    if (c.includes("starter")) cat = "Starters";
    else if (c.includes("drink")) cat = "Drinks";
    else if (c.includes("dessert")) cat = "Desserts";
    return {
        id: `s-${index}`,
        title: backendDeal.Title || backendDeal.title || "Special Offer",
        type: (backendDeal.Type || backendDeal.type || "").toUpperCase() === "FLAT" ? "flat" : "percentage",
        category: cat,
        discount_value: backendDeal.DiscountValue || backendDeal.discount_value || 0,
        source: "suggested",
        reason: backendDeal.Reason || backendDeal.reason
    };
  };

  const mapCategoryToBackend = (cat: DealCategory) => {
      if (cat === "Starters") return "starter";
      if (cat === "Drinks") return "drink";
      if (cat === "Desserts") return "dessert";
      return "main_course";
  };

  // --- HANDLERS ---
  const handleAddSuggestion = (deal: Deal) => {
    setDraftDeals([...draftDeals, { ...deal, id: `c-${Date.now()}` }]);
    setSuggestedDeals(suggestedDeals.filter(d => d.id !== deal.id));
  };

  const handleCreateDeal = () => {
    if (!formTitle || !formDiscount) { showToast("Title and discount required", "error"); return; }
    setDraftDeals([...draftDeals, { id: `c-${Date.now()}`, title: formTitle, type: formType, category: formCategory, discount_value: parseInt(formDiscount), source: "custom" }]);
    setFormTitle(""); setFormDiscount("");
  };

  const handleRemoveDeal = (deal: Deal) => {
    setDraftDeals(draftDeals.filter(d => d.id !== deal.id));
    if (deal.source === "suggested") setSuggestedDeals([...suggestedDeals, { ...deal, source: "suggested" }]);
  };

  const handlePublishDeals = async () => {
    if (draftDeals.length === 0 || !restaurantId) return;
    setIsPublishing(true);
    try {
        const publishPromises = draftDeals.map(deal => 
            apiRequest(`/restaurants/${restaurantId}/deals`, "POST", {
                title: deal.title,
                type: deal.type === 'flat' ? 'FLAT' : 'PERCENTAGE',
                category: mapCategoryToBackend(deal.category),
                discount_value: Number(deal.discount_value),
                source: deal.source
            })
        );
        await Promise.all(publishPromises);
        showToast("Submitted successfully!", "success");
        
        // Let the state machine decide the next hop (will be /preview)
        await syncUserFlow();

    } catch (error) {
        showToast("Failed to publish.", "error");
        setIsPublishing(false); 
    } 
  };

  const handlePreviewClick = () => {
     if (restaurantId) {
        sessionStorage.setItem("previewRestaurantId", restaurantId);
        window.open(`/preview?id=${restaurantId}`, "_blank");
     }
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

    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-10 overflow-hidden selection:bg-[#f1cd48] selection:text-[#471396]">
      
      <header className="sticky top-0 z-50 bg-[#F8F9FB]/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Publish Your Deals Here</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className={`w-2 h-2 rounded-full animate-pulse ${approvalStatus === 'pending' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <Mail size={10} /> {user?.email || "..."}
               </div>
            </div>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 uppercase tracking-wider shadow-sm transition-colors duration-300
            ${approvalStatus === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            {approvalStatus === 'pending' ? <Clock size={14} /> : <Layers size={14} />}
            {approvalStatus === 'pending' ? 'Pending Approval' : 'Draft Mode'}
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
                    <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700">Suggested Deals</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-6">
                    {suggestedDeals.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-center px-4"><Sparkles size={24} className="mb-2 opacity-20" /><p className="text-xs italic">No suggestions available.</p></div>
                    ) : (
                        suggestedDeals.map((deal) => (
                            <div key={deal.id} onClick={() => handleAddSuggestion(deal)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#f1cd48] hover:shadow-[0_4px_20px_-12px_#f1cd48] cursor-pointer transition-all duration-300 group relative">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-[#471396] transition-colors">{deal.title}</span>
                                    <PlusCircle size={16} className="text-slate-200 group-hover:text-[#f1cd48] transition-colors" />
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <span className="text-[9px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100 text-slate-500 font-semibold">{deal.category}</span>
                                    <span className="text-[9px] bg-[#f1cd48]/10 px-2 py-1 rounded-md border border-[#f1cd48]/30 text-amber-700 font-bold uppercase">
                                        {deal.type === 'percentage' ? `${deal.discount_value}% OFF` : `₹${deal.discount_value} FLAT`}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
          </div>

          {/* CENTER: BUILDER */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
             <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="flex-shrink-0 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-[#471396]">
                        <div className="p-2 bg-[#f1cd48]/20 rounded-lg"><Ticket size={20} className="text-amber-700" /></div>
                        <h3 className="font-bold text-lg">Create & Manage Deals</h3>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-8 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-[#f1cd48]" placeholder="e.g. Monsoon Special" />
                        </div>
                        <div className="col-span-4 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as DealCategory)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:outline-none">
                                <option>Starters</option><option>Main Course</option><option>Drinks</option><option>Desserts</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-end gap-4 mt-4">
                         <div className="w-32 space-y-1.5 flex-shrink-0">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount</label>
                            <input type="number" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:outline-none" placeholder="20" />
                        </div>

                         <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 h-12 items-center">
                            <button onClick={() => setFormType('percentage')} className={`h-full flex items-center gap-1 px-4 rounded-lg text-xs font-bold uppercase transition-all ${formType === 'percentage' ? 'bg-[#471396] text-white shadow-sm' : 'text-slate-400'}`}><Percent size={14}/> % Off</button>
                            <button onClick={() => setFormType('flat')} className={`h-full flex items-center gap-1 px-4 rounded-lg text-xs font-bold uppercase transition-all ${formType === 'flat' ? 'bg-[#471396] text-white shadow-sm' : 'text-slate-400'}`}><IndianRupee size={14}/> Flat</button>
                        </div>
                        
                        <button onClick={handleCreateDeal} className="ml-auto bg-[#471396] text-white px-8 h-12 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#3b0d82] transition-all shadow-lg flex items-center gap-2">
                            <PlusCircle size={18} className="text-[#f1cd48]" /> Add
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pb-24">
                    {draftDeals.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl p-8"><Megaphone size={32} className="mb-2 opacity-20" /><span className="text-xs font-medium">No deals in queue.</span></div>
                    ) : (
                        draftDeals.map((deal) => (<DealListItem key={deal.id} deal={deal} onRemove={() => handleRemoveDeal(deal)} />))
                    )}
                </div>

                <div className="absolute bottom-0 left-0 w-full pt-2 bg-white z-20">
                    <button 
                        onClick={handlePublishDeals} 
                        disabled={draftDeals.length === 0 || isPublishing}
                        className="w-full py-4 bg-[#471396] text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {isPublishing ? <Loader2 size={18} className="animate-spin text-[#f1cd48]" /> : <Send size={18} className="text-[#f1cd48]" />}
                        {isPublishing ? 'Publishing...' : 'Publish Deals'}
                    </button>
                </div>
             </div>
          </div>

          {/* RIGHT: PREVIEW & INSIGHTS */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
             <div onClick={handlePreviewClick} className="h-1/3 bg-gradient-to-br from-[#471396] to-[#6d28d9] rounded-[2rem] p-6 text-white shadow-lg cursor-pointer group relative overflow-hidden transition-transform hover:scale-[1.02]">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Eye size={80} /></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-70"><span className="w-2 h-2 bg-[#f1cd48] rounded-full animate-pulse"></span><span className="text-[10px] font-bold uppercase tracking-widest">Storefront</span></div>
                        <h2 className="text-xl font-black leading-tight truncate">{restaurantName}</h2>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest bg-white/10 p-2.5 rounded-lg group-hover:bg-white group-hover:text-[#471396] transition-all">
                        View Page (New Window) <ArrowUpRight size={14} />
                    </div>
                </div>
             </div>

             <div className="h-2/3 bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-[#471396]">
                    <div className="p-2 bg-[#f1cd48]/20 rounded-lg"><BarChart3 size={18} className="text-amber-700" /></div>
                    <h3 className="font-bold text-sm uppercase tracking-wide">Market Insights</h3>
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
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-[#471396] text-white' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-[#f1cd48]" /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </div>
    </>
  );
}

function DealListItem({ deal, onRemove }: { deal: Deal, onRemove: () => void }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    return (
        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#f1cd48] transition-all duration-200 group">
            <div>
                <h5 className="text-xs font-bold text-slate-800">{deal.title}</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">{deal.category} • <span className="text-emerald-600 font-bold">{deal.type === 'percentage' ? `${deal.discount_value}%` : `₹${deal.discount_value}`}</span></p>
            </div>
            <div className="flex items-center gap-2">
                {confirmDelete ? (
                    <div className="flex items-center gap-1">
                        <button onClick={onRemove} className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center transition-all"><Check size={12} /></button>
                        <button onClick={() => setConfirmDelete(false)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><X size={12} /></button>
                    </div>
                ) : (
                    <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                )}
            </div>
        </div>
    );
}