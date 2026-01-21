"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Save, MapPin, Clock, Phone, Utensils, Type, ImageIcon, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function EditRestaurantPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); // Controls UI visibility
  const [sessionError, setSessionError] = useState("");

  // --- 1. SINGLE SESSION & AUTH CHECK ---
  useEffect(() => {
    // A. Single Session Check using BroadcastChannel
    const channel = new BroadcastChannel("BHOJANALYA_SESSION");
    
    // Listen for other tabs saying "I exist"
    channel.onmessage = (event) => {
      if (event.data === "NEW_TAB_OPENED") {
        // Another tab just opened, tell it we are here
        channel.postMessage("SESSION_ALREADY_ACTIVE");
      }
      if (event.data === "SESSION_ALREADY_ACTIVE") {
        // We just opened, but another tab yelled at us
        setSessionError("Application is already open in another tab.");
        channel.close(); // Stop listening
      }
    };

    // Announce presence
    channel.postMessage("NEW_TAB_OPENED");

    // B. Security Verification (Auth Check)
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           router.replace("/auth");
           return;
        }

        const userData = await apiRequest('/protected/ping');
        
        // Ensure user is registered before allowing access
        if (userData?.isRegistered) {
          setIsAuthorized(true);
        } else {
          // Unregistered users trying to access URL directly get kicked back
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        router.replace("/auth");
      }
    };

    checkAuth();

    return () => channel.close();
  }, [router]);


  // --- BLOCKING VIEWS ---
  
  // 1. Session Error (Duplicate Tab)
  if (sessionError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="p-8 bg-slate-800 rounded-2xl border border-slate-700 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-400">Multiple Tabs Detected</h2>
          <p className="text-slate-400 text-sm mb-6">{sessionError}</p>
          <button 
            onClick={() => window.close()} 
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-colors"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading / Unauthorized State
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FB]">
        <Loader2 className="animate-spin text-[#2e0561]" size={32} />
      </div>
    );
  }

  // --- MAIN CONTENT (Only renders if Authorized & Single Session) ---
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
            onClick={() => setIsSaving(true)} 
            className="flex items-center gap-2 bg-[#2e0561] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#471396] shadow-lg shadow-purple-900/20"
          >
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <EditForm isSaving={isSaving} setIsSaving={setIsSaving} router={router} />
      </main>
    </div>
  );
}

// Separate Component to keep the main file clean
function EditForm({ isSaving, setIsSaving, router }: any) {
    const [formData, setFormData] = useState({
        name: "Royal Spice Bistro",
        description: "Experience the authentic flavors...",
        address: "Sector 29, Gurugram, Haryana",
        phone: "+91 98765 43210",
        cuisine: "North Indian, Chinese",
        prepTime: "25-30 min",
        isVegOnly: false,
    });

    return (
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
            {/* Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">Vegetarian Only</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, isVegOnly: !formData.isVegOnly})}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${formData.isVegOnly ? "bg-green-500" : "bg-slate-300"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.isVegOnly ? "translate-x-5" : "translate-x-0"}`} />
                </button>
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
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cuisine</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.cuisine} onChange={(e) => setFormData({...formData, cuisine: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Prep Time</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={formData.prepTime} onChange={(e) => setFormData({...formData, prepTime: e.target.value})} />
                    </div>
                 </div>
               </div>
            </section>
          </div>
        </div>
    );
}