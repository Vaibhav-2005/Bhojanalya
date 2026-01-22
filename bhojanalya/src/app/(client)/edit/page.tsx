"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Save, ImageIcon, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function EditRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    city: "",
  });

  // 🔒 SECURITY & DATA GUARD 🔒
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      
      // 1. Check Token Existence
      if (!token) { 
        router.replace("/auth"); 
        return; 
      }

      try {
        // 2. Decode Token & Block Admins
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const role = JSON.parse(jsonPayload).role?.toUpperCase();

        if (role === "ADMIN") {
          console.warn("Security Alert: Admins cannot access Owner Edit Page.");
          router.replace("/admin/restaurants"); 
          return;
        }

        // 3. Verify Session
        await apiRequest('/protected/ping');
        
        // 4. Fetch Restaurant Data
        const myRestaurants = await apiRequest('/restaurants/me');
        
        // 🛑 CRITICAL CHECK: Does a restaurant exist?
        if (!myRestaurants || myRestaurants.length === 0) {
          // If user exists but has NO restaurant, kick them out
          console.warn("No restaurant found for this user.");
          router.replace("/dashboard"); 
          return;
        }

        // 5. Populate Data
        const r = myRestaurants[0];
        setRestaurantId(r.ID || r.id);
        setFormData({
          name: r.Name || r.name || "",
          cuisine: r.CuisineType || r.cuisine_type || "",
          city: r.City || r.city || "",
        });
        
        setLoading(false);

      } catch (err) {
        console.error("Security check failed", err);
        localStorage.removeItem('token'); 
        router.replace("/auth");
      }
    };

    init();
  }, [router]);

  // --- SAVE HANDLER ---
  const handleSave = async () => {
    if (!restaurantId) return;
    setIsSaving(true);
    try {
      await apiRequest(`/restaurants/${restaurantId}`, 'PUT', {
        name: formData.name,
        city: formData.city,
        cuisine_type: formData.cuisine
      });
      alert("Changes saved successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#2e0561]" size={32} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Restaurant Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#2e0561] hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Edit Details</h1>
              <p className="text-xs text-slate-400 font-medium">Update your restaurant profile</p>
            </div>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#2e0561] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#471396] shadow-lg shadow-purple-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-[#471396]" /> Cover Image
              </h3>
              <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden group cursor-pointer border-2 border-dashed border-slate-300 hover:border-[#471396] transition-colors">
                 <div className="absolute inset-0 bg-slate-200" />
                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={32} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Change Photo</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
               <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">Basic Information</h3>
               <div className="grid gap-6">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Restaurant Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#2e0561] outline-none" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">City</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#2e0561] outline-none" 
                          value={formData.city} 
                          onChange={(e) => setFormData({...formData, city: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cuisine Type</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#2e0561] outline-none" 
                          value={formData.cuisine} 
                          onChange={(e) => setFormData({...formData, cuisine: e.target.value})} 
                        />
                    </div>
                 </div>
               </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}