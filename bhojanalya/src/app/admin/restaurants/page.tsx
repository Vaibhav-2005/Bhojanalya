"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, MapPin, Filter, 
  Smartphone, Loader2, AlertCircle, Utensils
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function RestaurantDirectory() {
  const router = useRouter();
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        // Using your standardized apiRequest helper
        const data = await apiRequest('/admin/restaurants/approved', 'GET');
        setRestaurants(data || []);
      } catch (err: any) {
        console.error("Directory fetch failed:", err.message);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Filtering Logic
  const filtered = restaurants.filter(r => {
    const name = (r.name || r.Name || "").toLowerCase();
    const city = (r.city || r.City || "").toLowerCase();
    const cuisine = (r.cuisine_type || r.CuisineType || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || city.includes(search) || cuisine.includes(search);
  });

  const openPreview = (id: string | number) => {
    window.open(`/preview?id=${id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#471396]" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Partners</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Browse and manage all live establishments on the platform.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-[1.25rem] border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by name, city..." 
                className="bg-transparent text-sm font-bold outline-none w-60 placeholder:text-slate-300" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Restaurant Name</th>
                <th className="px-10 py-6">Cuisine</th>
                <th className="px-10 py-6">Location</th>
                <th className="px-10 py-6 text-right">App Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <tr key={r.id || r.ID} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-10 py-6">
                    <div className="font-black text-slate-800 text-base">{r.name || r.Name}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold text-sm">
                      <Utensils size={15} className="text-indigo-400" />
                      {r.cuisine_type || r.CuisineType || "Not Specified"}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold text-sm">
                      <MapPin size={15} className="text-indigo-400" />
                      {r.city || r.City || "Unknown"}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => openPreview(r.id || r.ID)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2e0561] hover:text-white hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
                    >
                      <Smartphone size={14} /> Open Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="p-24 text-center text-slate-300 flex flex-col items-center gap-3">
              <AlertCircle size={40} className="opacity-20" />
              <span className="font-black text-sm uppercase tracking-widest opacity-40">No matching establishments found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}