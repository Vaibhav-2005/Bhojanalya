"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  X, Loader2, FileText, ChevronRight, Plane, MapPin, Clock, Phone, Percent, 
  ShoppingBag, LogOut, CalendarCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Outfit } from "next/font/google"; 
import { apiRequest } from "@/lib/api"; 

const outfit = Outfit({ subsets: ["latin"] });

// --- TYPES ---
interface BackendDeal {
  Title?: string; title?: string;
  DiscountValue?: number; discount_value?: number;
  Type?: string; type?: string;
  Category?: string; category?: string;
}

interface BackendResponse {
  id: number; name: string; city: string; cuisine_type: string;
  images: string[]; short_description?: string; opens_at?: string; closes_at?: string;
  deals: BackendDeal[]; menu_pdfs: string[] | string; 
}

interface UIDeal { code: string; title: string; desc: string; color: string; }

interface RestaurantUIState {
  name: string; cuisine: string; city: string; time: string;
  description: string; images: string[]; deals: UIDeal[];
  menuLink: string | null; isApproved: boolean;
}

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  const [restaurant, setRestaurant] = useState<RestaurantUIState | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("USER");

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    let isAdmin = false;
    if (token) {
        try {
            const payload = JSON.parse(window.atob(token.split('.')[1]));
            const role = (payload.role || "").toUpperCase();
            setUserRole(role);
            isAdmin = role === "ADMIN";
        } catch (e) { console.error("Token error"); }
    }

    const navAllowed = sessionStorage.getItem("nav_intent");
    if (!isAdmin && !navAllowed) {
        window.location.href = "/auth";
        return;
    }

    const fetchPreview = async () => {
      try {
        let rid: string | number | null = targetId;

        if (!isAdmin) {
            const statusRes = await apiRequest('/auth/protected/onboarding', 'GET');
            const status = (statusRes.onboarding_status || "null").toUpperCase();

            if (status === "NULL" || ["REGISTERED", "MENU_PENDING", "PHOTO_PENDING"].includes(status)) {
                router.replace("/register");
                return;
            }
            if (status === "BOTH_COMPLETED") {
                router.replace("/deals");
                return;
            }

            const myRestaurants = await apiRequest('/restaurants/me');
            if (!myRestaurants?.[0]) {
                router.replace("/register");
                return;
            }
            rid = myRestaurants[0].ID || myRestaurants[0].id;
        }

        if (!rid) throw new Error("No restaurant ID provided");

        const data: BackendResponse = await apiRequest(`/restaurants/${rid}/preview`);

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

        setRestaurant({
          name: data.name, 
          cuisine: capitalize(data.cuisine_type) || "Multi-Cuisine", 
          city: capitalize(data.city),
          time: (data.opens_at && data.closes_at) ? `${data.opens_at?.slice(0,5)} - ${data.closes_at?.slice(0,5)}` : "11:00 AM - 11:00 PM",
          description: data.short_description || "", 
          images: data.images && data.images.length > 0 ? data.images.slice(0, 3) : ["/placeholder-food.jpg"],
          deals: mappedDeals,
          menuLink: Array.isArray(data.menu_pdfs) ? data.menu_pdfs[0] : (data.menu_pdfs || null),
          isApproved: false 
        });

      } catch (err: any) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [router, targetId]);

  // --- AUTOMATIC SLIDING LOGIC ---
  useEffect(() => {
    if (!restaurant || !restaurant.images || restaurant.images.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % restaurant.images.length);
    }, 4500); // 4.5 seconds per slide
    return () => clearInterval(interval);
  }, [restaurant]);

  const handleClose = () => {
    window.close();
    if (userRole === "ADMIN") {
        router.push("/admin");
    } else {
        router.push("/deals");
    }
  };

  if (loading) return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-900/95 flex flex-col items-center justify-center z-50 gap-4">
        <Loader2 className="text-[#FFCC00] animate-spin" size={48} />
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest font-mono">Syncing Experience...</span>
      </div>
  );

  return (
    <div className="fixed inset-0 h-screen w-screen bg-slate-900 flex items-center justify-center backdrop-blur-sm overflow-hidden z-50 font-sans">
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* TOP HEADER */}
      <div className={`absolute top-8 left-10 flex flex-col gap-1 z-50 ${outfit.className}`}>
          <h2 className="text-white font-black text-2xl tracking-tighter uppercase">Live Preview</h2>
          <div className="h-1 w-12 bg-[#FFCC00] rounded-full" />
      </div>

      <div className="absolute top-8 right-10 z-50">
          <button onClick={handleClose} className="p-3 bg-white/5 text-white rounded-2xl hover:bg-red-500 transition-all group border border-white/10">
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
      </div>

      {/* PHONE Mockup */}
      <div className="relative w-[390px] h-[800px] max-h-[95vh] bg-white rounded-[3rem] border-[10px] border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col shrink-0">
        
        <div className="absolute top-0 w-full h-8 bg-black/5 z-30 flex justify-between px-8 items-center pointer-events-none">
           <div className="flex items-center gap-1.5"><Plane size={10} className="text-slate-900 rotate-45" /><span className="text-[10px] font-black tracking-tighter">9:11</span></div>
           <div className="flex gap-1.5 items-center"><div className="w-4 h-2 border border-slate-900/30 rounded-sm" /><div className="w-1.5 h-1.5 bg-slate-900 rounded-full opacity-80" /></div>
        </div>

        <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
          {/* IMAGE SLIDER CONTAINER */}
          <div className="relative h-[300px] bg-slate-200 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentImageIndex}
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('${restaurant?.images[currentImageIndex]}')` }} 
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            {/* SLIDER DOTS */}
            {restaurant && restaurant.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {restaurant.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#FFCC00] w-5' : 'bg-white/40 w-1.5'}`} 
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-12 w-full px-6 text-white z-20">
              <h1 className="text-xl capitalize font-black leading-tight mb-1">{restaurant?.name}</h1>
              <p className="text-xs text-white/80 font-bold uppercase tracking-widest">{restaurant?.cuisine}</p>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white">
             <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs"><MapPin size={14} className="text-[#471396]" /> {restaurant?.city}</div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter"><Clock size={12} /> {restaurant?.time}</div>
             </div>
             <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-[#471396] shadow-sm"><Phone size={18} /></button>
          </div>

          <div className="py-8 bg-slate-50/50 border-b border-slate-100">
             <div className="flex items-center gap-2 px-6 mb-4 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]"><Percent size={14} className="text-[#471396]" /> Exclusive Deals</div>
             <div className="flex overflow-x-auto gap-4 px-6 pb-2 scrollbar-hide snap-x">
               {restaurant?.deals.map((deal, i) => (
                 <div key={i} className={`min-w-[260px] h-32 rounded-[1.5rem] p-5 flex flex-col justify-between text-white shadow-xl bg-gradient-to-br ${deal.color} snap-center`}>
                    <div className="flex justify-between items-start"><div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black uppercase">{deal.code}</div><ShoppingBag size={18} className="opacity-40" /></div>
                    <div><p className="font-black text-lg leading-tight">{deal.title}</p><p className="text-[10px] opacity-80 font-bold truncate uppercase tracking-wide">{deal.desc}</p></div>
                 </div>
               ))}
             </div>
          </div>

          <div className="p-6">
             <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-3">About Us</h3>
             <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{restaurant?.description}</p>
          </div>

          <div className="px-6 pb-12">
            {restaurant?.menuLink && (
                <a 
                  href={restaurant.menuLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#471396] transition-all group active:scale-95"
                >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[#471396]/5 flex items-center justify-center text-[#471396] group-hover:bg-[#471396] group-hover:text-white transition-all"><FileText size={22} /></div>
                       <div><p className="text-sm font-black text-slate-900">Menu</p><p className="text-[10px] text-slate-400 font-bold uppercase">Click Here to Download Menu</p></div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-[#471396]" />
                </a>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-white border-t border-slate-100 z-40">
            <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all">
                <CalendarCheck size={18} /> Book Restaurant
            </button>
        </div>
      </div>
    </div>
  );
}

export default function PreviewShop() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-slate-900 flex items-center justify-center"><Loader2 className="text-[#FFCC00] animate-spin" /></div>}>
      <PreviewContent />
    </Suspense>
  );
}