// app/preview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Share2, MapPin, Clock, Phone, Percent, 
  ShoppingBag, X, Loader2, FileText, ChevronRight
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
  Description?: string;
  Time?: string;
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

  // --- HELPER: Capitalize First Letter ---
  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // --- HELPER: Dynamic Font Size for Restaurant Name ---
  const getTitleClass = (name: string) => {
     if (name.length > 25) return "text-sm";   
     if (name.length > 15) return "text-base"; 
     return "text-xl";                         
  };

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const id = sessionStorage.getItem("previewRestaurantId");
        if (!id) throw new Error("No restaurant selected.");

        const data: BackendResponse = await apiRequest(`/restaurants/${id}/preview`);

        if (!data) throw new Error("No data received");

        // --- MAPPING LOGIC ---

        // 1. Deals
        const mappedDeals: UIDeal[] = (data.deals || []).map((d, i) => {
          const val = d.DiscountValue || d.discount_value || 0;
          const type = (d.Type || d.type || "PERCENTAGE").toUpperCase();
          
          const colors = [
            "from-blue-600 to-blue-400",
            "from-purple-600 to-purple-400",
            "from-orange-500 to-yellow-400",
            "from-emerald-600 to-emerald-400"
          ];

          return {
            code: type === "FLAT" ? `FLAT${val}` : `${val}%OFF`,
            title: d.Title || d.title || (type === "FLAT" ? `Flat ₹${val}` : `${val}% OFF`),
            desc: `On ${d.Category || d.category || 'all items'}`,
            color: colors[i % colors.length]
          };
        });

        // 2. Images
        const validImages = (data.Images || []).filter(img => img && img.length > 0);
        if (validImages.length === 0) {
            validImages.push("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000");
        }

        // 3. Menu Link
        let menuLink = null;
        if (Array.isArray(data.menu_pdfs)) {
             if (data.menu_pdfs.length > 0) menuLink = data.menu_pdfs[0];
        } else if (typeof data.menu_pdfs === 'string') {
             menuLink = data.menu_pdfs;
        }

        // 4. Timings
        const timings = data.Time || "11:00 AM - 11:00 PM";

        setRestaurant({
          name: data.Name, 
          cuisine: capitalize(data.CuisineType) || "Multi-Cuisine", 
          address: capitalize(data.City), 
          time: timings,
          description: data.Description || `Welcome to ${data.Name}. We serve delicious ${data.CuisineType || 'food'} in ${capitalize(data.City)}.`,
          images: validImages,
          deals: mappedDeals,
          menuLink: menuLink
        });

      } catch (err: any) {
        console.error("Preview Error:", err);
        setError(err.message || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, []);

  // --- SLIDESHOW EFFECT ---
  useEffect(() => {
    if (!restaurant || restaurant.images.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % restaurant.images.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [restaurant]);

  if (loading) return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-900/95 flex items-center justify-center z-50">
        <Loader2 className="text-[#471396] animate-spin" size={48} />
      </div>
  );

  if (error || !restaurant) return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-900 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl max-w-sm text-center">
            <h3 className="text-red-600 font-bold mb-2">Unavailable</h3>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button onClick={handleClose} className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold">Go Back</button>
        </div>
      </div>
  );

  return (
    <div className="fixed inset-0 h-screen w-screen bg-slate-900/95 flex items-center justify-center backdrop-blur-sm overflow-hidden z-50">
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Close Button (Desktop Only) */}
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50 group cursor-pointer"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform" />
      </button>

      <div className="text-white absolute top-6 left-8 hidden md:block">
        <h1 className="text-2xl font-bold">Live Preview</h1>
        <p className="text-white/50 text-sm">Visualizing data for {restaurant.name}</p>
      </div>

      {/* --- PHONE CONTAINER --- */}
      <div className="relative w-[390px] h-[800px] max-h-[95vh] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden flex flex-col font-sans shrink-0">
        
        {/* Status Bar */}
        <div className="absolute top-0 w-full h-8 bg-black/20 z-30 flex justify-between px-6 items-center backdrop-blur-md pointer-events-none">
           <span className="text-[10px] font-bold text-white">9:41</span>
           <div className="flex gap-1.5">
             <div className="w-3 h-3 bg-white rounded-full opacity-80" />
             <div className="w-3 h-3 bg-white rounded-full opacity-80" />
           </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          
          {/* 1. Header Slideshow */}
          <div className="relative h-64 bg-slate-200 overflow-hidden group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105"
              style={{ backgroundImage: `url('${restaurant.images[currentImageIndex]}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
            
            {restaurant.images.length > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                    {restaurant.images.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/40'}`} />
                    ))}
                </div>
            )}

            <div className="absolute top-10 right-5 flex gap-3 text-white z-20">
               <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30"><Share2 size={20} /></button>
               <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30"><Heart size={20} /></button>
            </div>

            <div className="absolute bottom-0 w-full p-5 text-white z-20">
              {/* Dynamic Restaurant Name Font Size */}
              <h1 className={`${getTitleClass(restaurant.name)} capitalize font-black leading-tight mb-1 shadow-sm break-words`}>
                  {restaurant.name}
              </h1>
              <p className="text-sm text-white/90 font-medium capitalize">{restaurant.cuisine}</p>
            </div>
          </div>

          {/* 2. Info Bar */}
          <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                   <MapPin size={14} className="text-[#471396]" /> <span className="capitalize">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[10px] ml-0.5">
                   <Clock size={12} /> {restaurant.time}
                </div>
             </div>
             <button className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-[#471396]">
               <Phone size={16} />
             </button>
          </div>

          {/* 3. Deals Section */}
          <div className="py-6 border-b border-slate-50 bg-slate-50/50">
             <div className="flex items-center gap-2 px-5 mb-3">
               <Percent size={16} className="text-[#471396]" />
               <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide">Exclusive Deals</h3>
             </div>
             
             {restaurant.deals.length > 0 ? (
               <div className="flex overflow-x-auto gap-4 px-5 pb-2 scrollbar-hide snap-x">
                 {restaurant.deals.map((deal, i) => (
                   <div key={i} className={`min-w-[240px] h-28 rounded-2xl p-4 flex flex-col justify-between text-white shadow-lg bg-gradient-to-br ${deal.color} snap-center`}>
                      <div className="flex justify-between items-start">
                         <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">{deal.code}</div>
                         <ShoppingBag size={16} className="opacity-50" />
                      </div>
                      <div>
                         {/* UPDATED: Title font size reduced to text-base */}
                         <p className="font-black text-base">{deal.title}</p>
                         <p className="text-[10px] opacity-90 font-medium truncate">{deal.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="px-5 py-4 text-center text-xs text-slate-400 italic bg-white mx-5 rounded-xl border border-dashed border-slate-200">
                  No active deals found
               </div>
             )}
          </div>

          {/* 4. Description */}
          <div className="p-5">
             <h3 className="font-bold text-slate-900 mb-2">About Us</h3>
             <p className="text-xs text-slate-500 leading-relaxed">
               {restaurant.description}
             </p>
          </div>

          {/* 5. Menu Link */}
          <div className="px-5 pb-8">
            <h3 className="font-bold text-slate-900 mb-3">Menu</h3>
            
            {restaurant.menuLink ? (
                <a 
                  href={restaurant.menuLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#471396] hover:shadow-md transition-all group"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#471396] group-hover:bg-[#471396] group-hover:text-white transition-colors">
                          <FileText size={20} />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-slate-800">Full Menu</p>
                          <p className="text-[10px] text-slate-400">View PDF / Image</p>
                      </div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100">
                       <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                   </div>
                </a>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 italic">
                    Menu unavailable
                </div>
            )}
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-4 pb-8 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
           <div className="bg-[#471396] rounded-xl p-3.5 flex items-center justify-between text-white shadow-xl shadow-purple-900/20 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex flex-col pl-2">
                 <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Total</span>
                 <span className="font-bold text-sm">₹0.00</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-sm pr-2">
                 View Cart <ChevronRight size={16} />
              </div>
           </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full z-30" />

      </div>
    </div>
  );
}