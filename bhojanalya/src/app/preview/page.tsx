"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function PreviewShop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Get the ID
  const id = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const handleClose = () => {
    if (window.opener) window.close();
    else router.push("/dashboard");
  };

  useEffect(() => {
    if (!id) {
      setErrorDetails({ message: "No ID found in URL" });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log(`[Preview] Requesting: /restaurants/${id}`);
        
        // 2. Fetch Data
        const response = await apiRequest(`/restaurants/${id}`);
        console.log("[Preview] Response:", response);
        setData(response);
        
      } catch (err: any) {
        console.error("[Preview] Failed:", err);
        setErrorDetails({
          message: err.message,
          stack: "Check console for network details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#471396] mb-4" />
        <p>Connecting to Backend...</p>
        <p className="text-xs text-white/50 mt-2 font-mono">ID: {id}</p>
      </div>
    );
  }

  // --- ERROR STATE (This will tell us the problem) ---
  if (errorDetails || !data) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-10">
        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/50 max-w-lg w-full">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">Preview Failed</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50 font-bold">Error Message</p>
              <p className="text-lg font-medium">{errorDetails?.message || "Data came back empty (null)"}</p>
            </div>
            
            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs overflow-auto">
              <p className="text-yellow-400">DEBUG INFO:</p>
              <p>Requested URL ID: <span className="text-white">{id}</span></p>
              <p>Backend Endpoint: <span className="text-white">GET /restaurants/{id}</span></p>
            </div>
          </div>

          <button onClick={handleClose} className="mt-6 w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- SUCCESS STATE (Render the App) ---
  // Using a helper to safely grab keys whether Uppercase or Lowercase
  const safeData = {
    name: data.Name || data.name || "Unknown Name",
    city: data.City || data.city || "Unknown City",
    cuisine: data.CuisineType || data.cuisine_type || "Cuisine"
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-slate-900/95 flex items-center justify-center backdrop-blur-sm z-50">
      
      {/* Close Button */}
      <button onClick={handleClose} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50">
        <X size={24} />
      </button>

      {/* --- MOBILE PREVIEW --- */}
      <div className="relative w-[390px] h-[800px] max-h-[95vh] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden flex flex-col font-sans shrink-0">
        
        {/* Header Image */}
        <div className="relative h-64 bg-slate-200">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          <div className="absolute bottom-0 w-full p-5 text-white z-20">
            <h1 className="text-2xl font-black leading-tight mb-1">{safeData.name}</h1>
            <p className="text-sm text-white/80 font-medium mb-3">{safeData.cuisine}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5">
          <p className="text-slate-500 text-sm">
            Location: <span className="text-slate-900 font-bold">{safeData.city}</span>
          </p>
          <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-xs font-medium text-center border border-yellow-100">
            Menu data is fetching...
          </div>
        </div>

      </div>
    </div>
  );
} 