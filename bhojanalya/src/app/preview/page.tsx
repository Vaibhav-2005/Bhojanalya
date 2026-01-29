"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Share2, MapPin, Clock, Phone, Percent, 
  ShoppingBag, X, Loader2, FileText, ChevronRight,
  Plane, AlertCircle 
} from "lucide-react";
import { apiRequest } from "@/lib/api"; 

// --- TYPES ---
interface BackendDeal {
  Title?: string;
  title?: string;
  DiscountValue?: number;
  discount_value?: number;
  Type?: string;
  type?: string;
  Category?: string;
  category?: string;
}

interface BackendResponse {
  id: number;
  Name: string;
  City: string;
  CuisineType: string;
  CostForTwo: number;
  Images: string[];
  short_description?: string;
  opens_at?: string;
  closes_at?: string;
  deals: BackendDeal[];
  menu_pdfs: string[] | string; 
}

interface UIDeal {
  code: string;
  title: string;
  desc: string;
  color: string;
}

interface RestaurantUIState {
  name: string;
  cuisine: string;
  address: string;
  time: string;
  description: string;
  images: string[];
  deals: UIDeal[];
  menuLink: string | null;
}

export default function PreviewShop() {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<RestaurantUIState | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      router.push("/deals");
    }
  };

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getTitleClass = (name: string) => {
     if (name.length > 25) return "text-sm";   
     if (name.length > 15) return "text-base"; 
     return "text-xl";                         
  };

  // --- 1. STATE MACHINE & DATA FETCHING ---
  useEffect(() => {
    // SECURITY GUARD: Prevent direct URL access
    const navAllowed = sessionStorage.getItem("nav_intent");
    if (!navAllowed) {
        window.location.href = "/auth";
        return;
    }

    const fetchPreview = async () => {
      try {
        // Step A: Identify Restaurant
        const myRestaurants = await apiRequest('/restaurants/me');
        if (!myRestaurants || myRestaurants.length === 0) {
            router.replace("/register");
            return;
        }

        const rid = myRestaurants[0].ID || myRestaurants[0].id;

        // Step B: Fetch Detail & Check Completeness
        let data: BackendResponse;
        try {
            data = await apiRequest(`/restaurants/${rid}/preview`);
        } catch (err: any) {
            // If deals are missing, the API throws an error
            if (err.message?.toLowerCase().includes("at least one deal exists")) {
                router.replace("/deals");
                return;
            }
            throw err;
        }

        // --- THE FIX: ENFORCE LOGIC SEQUENCE ---
        const hasImages = data.Images && data.Images.length > 0;
        const hasMenu = data.menu_pdfs && (Array.isArray(data.menu_pdfs) ? data.menu_pdfs.length > 0 : data.menu_pdfs !== "");
        const hasDeals = data.deals && data.deals.length > 0;

        // 1. Check for missing uploads first
        if (!hasImages || !hasMenu) {
            sessionStorage.setItem("incomplete_rid", rid.toString());
            router.replace("/register?step=upload");
            return;
        }

        // 2. Check for missing deals
        if (!hasDeals) {
            router.replace("/deals");
            return;
        }

        // --- 3. MAPPING UI STATE ---
        const mappedDeals: UIDeal[] = (data.deals || []).map((d, i) => {
          const val = d.DiscountValue || d.discount_value || 0;
          const type = (d.Type || d.type || "PERCENTAGE").toUpperCase();
          const colors = ["from-blue-600 to-blue-400", "from-purple-600 to-purple-400", "from-orange-500 to-yellow-400", "from-emerald-600 to-emerald-400"];

          return {
            code: type === "FLAT" ? `FLAT${val}` : `${val}%OFF`,
            title: d.Title || d.title || (type === "FLAT" ? `Flat ₹${val}` : `${val}% OFF`),
            desc: `On ${d.Category || d.category || 'all items'}`,
            color: colors[i % colors.length]
          };
        });

        const timings = (data.opens_at && data.closes_at) 
            ? `${data.opens_at} - ${data.closes_at}` 
            : "11:00 AM - 11:00 PM";

        setRestaurant({
          name: data.Name, 
          cuisine: capitalize(data.CuisineType) || "Multi-Cuisine", 
          address: capitalize(data.City), 
          time: timings,
          description: data.short_description || `Welcome to ${data.Name}.`,
          images: data.Images,
          deals: mappedDeals,
          menuLink: Array.isArray(data.menu_pdfs) ? data.menu_pdfs[0] : (data.menu_pdfs || null)
        });

      } catch (err: any) {
        console.error("Preview Error:", err);
        setError(err.message || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [router]);

  useEffect(() => {
    if (!restaurant || restaurant.images.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % restaurant.images.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [restaurant]);

  if (loading) return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-900/95 flex flex-col items-center justify-center z-50 gap-4">
        <Loader2 className="text-[#FFCC00] animate-spin" size={48} />
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Validating State...</span>
      </div>
  );

  if (error || !restaurant) return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-900 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-[2rem] max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                <AlertCircle size={24} />
            </div>
            <h3 className="text-slate-900 font-black mb-2 uppercase tracking-tight">Access Restricted</h3>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">We couldn't verify your restaurant state. Please return to the dashboard.</p>
            <button onClick={handleClose} className="w-full bg-[#471396] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">Go Back</button>
        </div>
      </div>
  );

  return (
    <div className="fixed inset-0 h-screen w-screen bg-slate-900/95 flex items-center justify-center backdrop-blur-sm overflow-hidden z-50 font-sans">
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Desktop Close Button */}
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50 group cursor-pointer"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform" />
      </button>

      {/* PHONE CONTAINER */}
      <div className="relative w-[390px] h-[800px] max-h-[95vh] bg-white rounded-[3rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col shrink-0">
        
        {/* STATUS BAR */}
        <div className="absolute top-0 w-full h-8 bg-black/5 z-30 flex justify-between px-8 items-center backdrop-blur-sm pointer-events-none">
           <div className="flex items-center gap-1.5">
             <Plane size={10} className="text-slate-900 fill-slate-900 rotate-45" />
             <span className="text-[10px] font-black text-slate-900">9:41</span>
           </div>
           <div className="flex gap-1.5 items-center">
             <div className="w-4 h-2 border border-slate-900/30 rounded-sm" />
             <div className="w-1.5 h-1.5 bg-slate-900 rounded-full opacity-80" />
           </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          
          {/* Header Slideshow */}
          <div className="relative h-[300px] bg-slate-200 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
              style={{ backgroundImage: `url('${restaurant.images[currentImageIndex]}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            {restaurant.images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {restaurant.images.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'}`} />
                    ))}
                </div>
            )}

            <div className="absolute bottom-0 w-full p-6 text-white z-20">
              <h1 className={`${getTitleClass(restaurant.name)} capitalize font-black leading-tight mb-1`}>
                  {restaurant.name}
              </h1>
              <p className="text-xs text-white/80 font-bold uppercase tracking-widest">{restaurant.cuisine}</p>
            </div>
          </div>

          {/* Info Bar */}
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white">
             <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                   <MapPin size={14} className="text-[#471396]" /> {restaurant.address}
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                   <Clock size={12} /> {restaurant.time}
                </div>
             </div>
             <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-[#471396] shadow-sm active:scale-90 transition-transform">
               <Phone size={18} />
             </button>
          </div>

          {/* Deals */}
          <div className="py-8 bg-slate-50/50 border-b border-slate-100">
             <div className="flex items-center gap-2 px-6 mb-4">
               <Percent size={16} className="text-[#471396]" />
               <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Exclusive Deals</h3>
             </div>
             
             <div className="flex overflow-x-auto gap-4 px-6 pb-2 scrollbar-hide snap-x">
               {restaurant.deals.map((deal, i) => (
                 <div key={i} className={`min-w-[260px] h-32 rounded-[1.5rem] p-5 flex flex-col justify-between text-white shadow-xl bg-gradient-to-br ${deal.color} snap-center`}>
                    <div className="flex justify-between items-start">
                       <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase">{deal.code}</div>
                       <ShoppingBag size={18} className="opacity-40" />
                    </div>
                    <div>
                       <p className="font-black text-lg leading-tight">{deal.title}</p>
                       <p className="text-[10px] opacity-80 font-bold truncate uppercase tracking-wide">{deal.desc}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Description */}
          <div className="p-6">
             <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-3">The Experience</h3>
             <p className="text-xs text-slate-600 font-medium leading-relaxed">
               {restaurant.description}
             </p>
          </div>

          {/* Menu Section */}
          <div className="px-6 pb-12">
            <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4">Digital Menu</h3>
            {restaurant.menuLink ? (
                <a 
                  href={restaurant.menuLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#471396] transition-all group active:scale-[0.98]"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#471396]/5 flex items-center justify-center text-[#471396] group-hover:bg-[#471396] group-hover:text-white transition-all">
                          <FileText size={22} />
                      </div>
                      <div>
                          <p className="text-sm font-black text-slate-900">View Full Menu</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">PDF • Instant View</p>
                      </div>
                   </div>
                   <ChevronRight size={18} className="text-slate-300 group-hover:text-[#471396] transition-colors" />
                </a>
            ) : null}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full z-30" />

      </div>
    </div>
  );
}