"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // 👈 Import this
import { AlertOctagon } from "lucide-react";

export default function SessionGuard() {
  const pathname = usePathname(); // 👈 Get current URL
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    // 🛑 EXCEPTION: Allow Preview page to open in new tab
    if (pathname?.startsWith("/preview")) return; 

    const channel = new BroadcastChannel('bhojanalya_global_session');
    
    channel.onmessage = (event) => {
      if (event.data === 'CHECK_EXISTING') {
        channel.postMessage('I_EXIST');
      } 
      else if (event.data === 'I_EXIST') {
        setIsDuplicate(true);
      }
    };

    channel.postMessage('CHECK_EXISTING');

    return () => channel.close();
  }, [pathname]);

  // If on preview page OR no duplicate found, render nothing
  if (pathname?.startsWith("/preview") || !isDuplicate) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans backdrop-blur-sm">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <AlertOctagon className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-black text-[#2e0561] mb-3">Session Active Elsewhere</h1>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed font-medium">
        Bhojanalya is already open in another tab. <br/>
        Please close this tab or use the existing one.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-8 py-4 bg-[#FFCC00] text-[#2e0561] border border-[#e6b800] rounded-xl font-bold hover:bg-[#ffdb4d] transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
      >
        Use This Tab Instead
      </button>
    </div>
  );
}