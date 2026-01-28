"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Save, Lock, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function EditRestaurantPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // New State for Blocked UI
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    const channel = new BroadcastChannel("BHOJANALYA_SESSION");
    channel.postMessage("NEW_TAB_OPENED");

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { router.replace("/auth"); return; }
        
        const userData = await apiRequest('/auth/protected/ping');
        if (!userData) { router.replace("/auth"); return; }

        // --- 1. ADMIN CHECK (Case Insensitive) ---
        const role = userData?.role?.toUpperCase();
        if (role === 'ADMIN' || userData?.isAdmin === true) {
            router.replace("/admin");
            return;
        }

        // --- 2. CLIENT STATUS CHECK ---
        const status = localStorage.getItem("approval_status") || "initiated";
        if (status === "active" || status === "rejected") {
          setIsAuthorized(true);
        } else {
          setIsBlocked(true);
          setBlockReason(status === "pending" 
            ? "Your request is pending approval. You cannot edit details yet." 
            : "Please submit the approval request from the Deals first.");
        }

      } catch (err) {
        router.replace("/auth");
      }
    };

    checkAuth();
    return () => channel.close();
  }, [router]);

  if (isBlocked) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100">
           <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><Lock size={32} /></div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h3>
           <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{blockReason}</p>
           <button onClick={() => router.push("/deals")} className="w-full py-3 bg-[#2e0561] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#471396] transition-colors">Back to Deals</button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return <div className="h-screen flex items-center justify-center bg-[#F8F9FB]"><Loader2 className="animate-spin text-[#2e0561]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#2e0561] hover:text-white transition-colors"><ChevronLeft size={20} /></button>
            <div><h1 className="text-xl font-bold text-slate-800">Edit Details</h1><p className="text-xs text-slate-400 font-medium">Update your restaurant profile</p></div>
          </div>
          <button onClick={() => setIsSaving(true)} className="flex items-center gap-2 bg-[#2e0561] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#471396] shadow-lg shadow-purple-900/20">
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
         <div className="p-10 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">Form Loaded</div>
      </main>
    </div>
  );
}