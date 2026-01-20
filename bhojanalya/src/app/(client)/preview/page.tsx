// app/preview/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Heart, Share2, Star, MapPin, 
  Clock, Phone, Percent, ChevronRight, ShoppingBag, 
  X
} from "lucide-react";

export default function PreviewShop() {
  const router = useRouter();

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      router.push("/dashboard");
    }
  };

  // Mock Data
  const restaurant = {
    name: "Royal Spice Bistro",
    cuisine: "North Indian • Chinese • Continental",
    rating: 4.8,
    reviews: "1.2k",
    address: "Sector 29, Gurugram",
    time: "10:00 AM - 11:00 PM",
    description: "Experience the authentic flavors of royal Indian heritage mixed with modern culinary art. Perfect for family dining.",
    deals: [
      { code: "ROYAL50", title: "50% OFF", desc: "Up to ₹100 on orders above ₹200", color: "from-blue-600 to-blue-400" },
      { code: "FREEDESSERT", title: "Free Dessert", desc: "On all orders above ₹500", color: "from-purple-600 to-purple-400" },
      { code: "WELCOME", title: "Flat ₹150", desc: "New user special discount", color: "from-orange-500 to-yellow-400" },
    ],
    menu: [
      { name: "Butter Chicken", price: 340, desc: "Rich creamy tomato gravy with tender chicken", type: "Non-Veg" },
      { name: "Paneer Tikka", price: 280, desc: "Cottage cheese marinated in spices and grilled", type: "Veg" },
      { name: "Garlic Naan", price: 60, desc: "Oven baked flatbread with garlic butter", type: "Veg" },
      { name: "Chicken Biryani", price: 420, desc: "Aromatic basmati rice with spiced chicken", type: "Non-Veg" },
    ]
  };

  return (
    // UPDATED: fixed h-screen w-screen overflow-hidden prevents ANY page scrolling
    <div className="fixed inset-0 h-screen w-screen bg-slate-900/95 flex items-center justify-center backdrop-blur-sm overflow-hidden z-50">
      
      {/* Hide Scrollbar CSS */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* Close Button */}
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50 group cursor-pointer"
        title="Close Preview"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform" />
      </button>

      <div className="text-white absolute top-6 left-8 hidden md:block">
        <h1 className="text-2xl font-bold">Live Preview</h1>
        <p className="text-white/50 text-sm">This is how your restaurant looks on the App.</p>
      </div>

      {/* --- MOBILE DEVICE CONTAINER --- */}
      {/* Added max-h constraints to ensure it fits on smaller laptop screens without scrolling the body */}
      <div className="relative w-[390px] h-[800px] max-h-[95vh] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden flex flex-col font-sans shrink-0">
        
        {/* Status Bar */}
        <div className="absolute top-0 w-full h-8 bg-black/20 z-30 flex justify-between px-6 items-center backdrop-blur-md pointer-events-none">
           <span className="text-[10px] font-bold text-white">9:41</span>
           <div className="flex gap-1.5">
             <div className="w-3 h-3 bg-white rounded-full opacity-80" />
             <div className="w-3 h-3 bg-white rounded-full opacity-80" />
           </div>
        </div>

        {/* --- SCROLLABLE INTERNAL CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          
          {/* 1. Header Image Section */}
          <div className="relative h-64 bg-slate-200">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            
            <div className="absolute top-10 left-0 w-full px-5 flex justify-between text-white z-20">
              <button onClick={handleClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30"><ChevronLeft size={20} /></button>
              <div className="flex gap-3">
                <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30"><Share2 size={20} /></button>
                <button className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30"><Heart size={20} /></button>
              </div>
            </div>

            <div className="absolute bottom-0 w-full p-5 text-white z-20">
              <h1 className="text-2xl font-black leading-tight mb-1">{restaurant.name}</h1>
              <p className="text-sm text-white/80 font-medium mb-3">{restaurant.cuisine}</p>
              
              <div className="flex items-center gap-3 text-xs font-bold">
                 <div className="bg-green-600 px-2 py-0.5 rounded flex items-center gap-1">
                   {restaurant.rating} <Star size={10} fill="white" />
                 </div>
                 <span className="underline opacity-80">{restaurant.reviews} Reviews</span>
                 <span className="w-1 h-1 bg-white rounded-full" />
                 <span>25 mins</span>
              </div>
            </div>
          </div>

          {/* 2. Info Bar */}
          <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center">
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                   <MapPin size={14} className="text-[#471396]" /> {restaurant.address}
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
             
             <div className="flex overflow-x-auto gap-4 px-5 pb-2 scrollbar-hide snap-x">
               {restaurant.deals.map((deal, i) => (
                 <div key={i} className={`min-w-[240px] h-28 rounded-2xl p-4 flex flex-col justify-between text-white shadow-lg bg-gradient-to-br ${deal.color} snap-center`}>
                    <div className="flex justify-between items-start">
                       <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">{deal.code}</div>
                       <ShoppingBag size={16} className="opacity-50" />
                    </div>
                    <div>
                       <p className="font-black text-xl">{deal.title}</p>
                       <p className="text-[10px] opacity-90 font-medium">{deal.desc}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* 4. Description */}
          <div className="p-5">
             <h3 className="font-bold text-slate-900 mb-2">About Us</h3>
             <p className="text-xs text-slate-500 leading-relaxed">
               {restaurant.description}
             </p>
          </div>

          {/* 5. Menu Section */}
          <div className="pb-8">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-5 py-3 border-b border-slate-100 flex gap-4 overflow-x-auto scrollbar-hide">
               {["Recommended", "Starters", "Main Course", "Breads", "Desserts"].map((cat, i) => (
                 <button key={i} className={`text-xs font-bold whitespace-nowrap transition-colors ${i === 0 ? "text-[#471396] bg-purple-50 px-3 py-1 rounded-full" : "text-slate-400"}`}>
                   {cat}
                 </button>
               ))}
            </div>

            <div className="px-5 pt-4 space-y-6">
              {restaurant.menu.map((item, i) => (
                <div key={i} className="flex justify-between gap-4">
                   <div className="space-y-1.5 w-3/5">
                      <div className={`w-3 h-3 border flex items-center justify-center ${item.type === "Veg" ? "border-green-600" : "border-red-600"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.type === "Veg" ? "bg-green-600" : "bg-red-600"}`} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <p className="text-slate-900 font-bold text-xs">₹{item.price}</p>
                      <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{item.desc}</p>
                   </div>
                   <div className="relative w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                      {/* Placeholder for menu item image */}
                      <div className="absolute inset-0 bg-slate-200" />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                         <button className="bg-white text-green-600 font-extrabold text-xs px-6 py-2 rounded-lg shadow-md border border-slate-100 uppercase hover:bg-slate-50">
                           Add
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- BOTTOM FLOATING BAR --- */}
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