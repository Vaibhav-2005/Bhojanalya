"use client";

import { useEffect, useState } from "react";
import { AlertOctagon } from "lucide-react";

export default function SessionGuard() {
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    // Unique channel name for the whole app
    const channel = new BroadcastChannel('bhojanalya_global_session');
    
    // 1. Listen for messages from other tabs
    channel.onmessage = (event) => {
      // If a new tab opens and asks "Is anyone there?", we answer "Yes"
      if (event.data === 'CHECK_EXISTING') {
        channel.postMessage('I_EXIST');
      } 
      // If we receive "I_EXIST", it means another tab responded, so WE are the duplicate
      else if (event.data === 'I_EXIST') {
        setIsDuplicate(true);
      }
    };

    // 2. Ask "Is anyone there?" as soon as this component mounts
    channel.postMessage('CHECK_EXISTING');

    // Cleanup when closing tab
    return () => channel.close();
  }, []);

  // If no duplicate found, render nothing (invisible)
  if (!isDuplicate) return null;

  // If duplicate, BLOCK the screen
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans backdrop-blur-sm">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <AlertOctagon className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-black text-[#2e0561] mb-3">Session Active Elsewhere</h1>
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed font-medium">
        Bhojanalya is already open in another tab or window. <br/>
        To prevent data conflicts, please use the existing tab or close it to continue here.
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